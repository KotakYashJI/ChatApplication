const express = require('express');
const {
  allUsers,
  registerUser,
  authUser,
  blockUser,
  unblockUser,
  sendFriendRequest,
  acceptRequest,
  getAcceptedUsers,
  rejectRequest,
  getFriendRequests,
  removeFriend
} = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', registerUser); // User registration
router.post('/login', authUser);         // User login

// Protected Routes
router.route('/').get(protect, allUsers); // Get all users
router.route('/').post(registerUser);    // Register user (this might be redundant)

// Other Routes
router.post('/block', protect, blockUser);
router.post('/unblock', protect, unblockUser);
router.post('/send-friend-request', protect, sendFriendRequest);
router.post('/accept-request', protect, acceptRequest);
router.get('/accepted', protect, getAcceptedUsers);
router.post('/reject-request', protect, rejectRequest);
router.get('/requests', protect, getFriendRequests);
router.post('/remove-friend', protect, removeFriend);

module.exports = router;
