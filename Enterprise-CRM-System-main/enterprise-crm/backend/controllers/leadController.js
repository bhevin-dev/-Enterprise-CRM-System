const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get all leads (scoped by role)
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    let query = {};

    // Scoping for Sales Reps - they only see their assigned leads
    if (req.user.role === 'Rep') {
      query.assignedTo = req.user._id;
    }

    // Optional Stage or Search filters
    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
      ];
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .sort({ updatedAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single lead details
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email role');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Role verification
    if (req.user.role === 'Rep' && lead.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this lead' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const { name, company, email, phone, value, stage, assignedTo } = req.body;

    if (!name || !company) {
      return res.status(400).json({ message: 'Lead name and company are required' });
    }

    // Determine who this lead is assigned to
    let assignId = req.user._id;

    // Admin/Manager can assign to any user, Reps can only assign to themselves
    if (req.user.role !== 'Rep' && assignedTo) {
      const targetUser = await User.findById(assignedTo);
      if (!targetUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
      assignId = targetUser._id;
    }

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      value: value || 0,
      stage: stage || 'New',
      assignedTo: assignId,
      activities: [
        {
          type: 'Note',
          description: `Lead created by ${req.user.name}`,
          createdBy: req.user._id,
          creatorName: req.user.name,
        },
      ],
    });

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email role');
    res.status(201).json(populatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check permissions (Reps can only edit their own leads)
    if (req.user.role === 'Rep' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    const { name, company, email, phone, value, stage, assignedTo } = req.body;

    // Track stages changes for auto logging
    let stageChanged = false;
    let oldStage = lead.stage;

    if (stage && stage !== lead.stage) {
      stageChanged = true;
      lead.stage = stage;
    }

    lead.name = name || lead.name;
    lead.company = company || lead.company;
    lead.email = email || lead.email;
    lead.phone = phone || lead.phone;
    lead.value = value !== undefined ? value : lead.value;

    // Admin/Manager can reassign leads
    if (req.user.role !== 'Rep' && assignedTo && assignedTo !== lead.assignedTo.toString()) {
      const targetUser = await User.findById(assignedTo);
      if (targetUser) {
        lead.assignedTo = targetUser._id;
        lead.activities.push({
          type: 'Note',
          description: `Lead reassigned to ${targetUser.name} by ${req.user.name}`,
          createdBy: req.user._id,
          creatorName: req.user.name,
        });
      }
    }

    if (stageChanged) {
      lead.activities.push({
        type: 'Note',
        description: `Stage updated from '${oldStage}' to '${stage}' by ${req.user.name}`,
        createdBy: req.user._id,
        creatorName: req.user.name,
      });
    }

    const updatedLead = await lead.save();
    const populatedLead = await Lead.findById(updatedLead._id).populate('assignedTo', 'name email role');
    res.json(populatedLead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a lead (Managers & Admins only)
// @route   DELETE /api/leads/:id
// @access  Private (Manager & Admin only)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ id: req.params.id, message: 'Lead removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log a new lead activity (Email, Call, Meeting, Note)
// @route   POST /api/leads/:id/activity
// @access  Private
const logActivity = async (req, res) => {
  try {
    const { type, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({ message: 'Activity type and description are required' });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Rep check
    if (req.user.role === 'Rep' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to log activity for this lead' });
    }

    // Add activity
    const newActivity = {
      type,
      description,
      createdBy: req.user._id,
      creatorName: req.user.name,
      date: new Date(),
    };

    lead.activities.push(newActivity);
    await lead.save();

    res.status(201).json(lead.activities[lead.activities.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  logActivity,
};
