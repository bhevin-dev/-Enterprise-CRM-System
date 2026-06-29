const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get dashboard metrics and sales reports
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const isRep = req.user.role === 'Rep';
    const userId = req.user._id;

    // Base query for leads based on role scoping
    const leadQuery = isRep ? { assignedTo: userId } : {};

    // 1. Fetch all leads under current scope
    const leads = await Lead.find(leadQuery);

    // 2. Calculate summary statistics
    let totalValue = 0;
    let wonValue = 0;
    let lostValue = 0;
    let activeValue = 0;
    let totalLeadsCount = leads.length;
    let wonCount = 0;
    let lostCount = 0;

    const stagesBreakdown = {
      New: { count: 0, value: 0 },
      Contacted: { count: 0, value: 0 },
      Proposal: { count: 0, value: 0 },
      Negotiation: { count: 0, value: 0 },
      Won: { count: 0, value: 0 },
      Lost: { count: 0, value: 0 },
    };

    leads.forEach((lead) => {
      const val = lead.value || 0;
      totalValue += val;

      if (stagesBreakdown[lead.stage]) {
        stagesBreakdown[lead.stage].count += 1;
        stagesBreakdown[lead.stage].value += val;
      }

      if (lead.stage === 'Won') {
        wonValue += val;
        wonCount += 1;
      } else if (lead.stage === 'Lost') {
        lostValue += val;
        lostCount += 1;
      } else {
        activeValue += val;
      }
    });

    const conversionRate =
      wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

    // 3. Sales rep performance (Admin/Manager sees all, Rep sees only themselves)
    let repPerformance = [];
    if (!isRep) {
      // Find all reps and calculate stats
      const reps = await User.find({ role: 'Rep' });
      
      // Calculate performance details for each rep
      for (const rep of reps) {
        const repLeads = leads.filter(l => l.assignedTo.toString() === rep._id.toString());
        let repWonValue = 0;
        let repActiveValue = 0;
        let repWonCount = 0;
        let repTotalCount = repLeads.length;

        repLeads.forEach(l => {
          if (l.stage === 'Won') {
            repWonValue += l.value || 0;
            repWonCount += 1;
          } else if (l.stage !== 'Lost') {
            repActiveValue += l.value || 0;
          }
        });

        repPerformance.push({
          repId: rep._id,
          name: rep.name,
          email: rep.email,
          totalLeads: repTotalCount,
          wonCount: repWonCount,
          wonValue: repWonValue,
          activeValue: repActiveValue,
        });
      }
      
      // Sort reps by won value descending
      repPerformance.sort((a, b) => b.wonValue - a.wonValue);
    } else {
      // Rep sees their own summarized performance
      repPerformance.push({
        repId: req.user._id,
        name: req.user.name,
        email: req.user.email,
        totalLeads: totalLeadsCount,
        wonCount: wonCount,
        wonValue: wonValue,
        activeValue: activeValue,
      });
    }

    // 4. Recent activities feed (last 15 activities across leads)
    let recentActivities = [];
    leads.forEach((lead) => {
      lead.activities.forEach((act) => {
        recentActivities.push({
          leadId: lead._id,
          leadName: lead.name,
          leadCompany: lead.company,
          activityId: act._id,
          type: act.type,
          description: act.description,
          createdBy: act.createdBy,
          creatorName: act.creatorName,
          date: act.date,
        });
      });
    });

    // Sort by activity date descending and limit to 12
    recentActivities.sort((a, b) => b.date - a.date);
    recentActivities = recentActivities.slice(0, 12);

    res.json({
      summary: {
        totalLeadsCount,
        activeLeadsCount: totalLeadsCount - (wonCount + lostCount),
        totalValue,
        activeValue,
        wonValue,
        lostValue,
        conversionRate,
      },
      stages: stagesBreakdown,
      repPerformance,
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
