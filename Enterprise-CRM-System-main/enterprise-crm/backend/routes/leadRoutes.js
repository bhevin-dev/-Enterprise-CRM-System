const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  logActivity,
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, authorize('Admin', 'Manager'), deleteLead);

router.route('/:id/activity')
  .post(protect, logActivity);

module.exports = router;
