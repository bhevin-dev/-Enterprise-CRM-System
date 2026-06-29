const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('Admin', 'Manager'), getAllUsers);
router.put('/users/:id/role', protect, authorize('Admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
