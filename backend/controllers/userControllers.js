const asyncHandler = require("express-async-handler");
const express = require("express");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const app = express();

const Request = require("../models/requestModel");

//@description     Block a user
//@route           POST /api/user/block
//@access          Protected

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  // Fetch all users excluding the logged-in user
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  // Filter out blocked users
  const filteredUsers = users.filter(user => !req.user.blockedUsers.includes(user._id.toString()));

  res.send(filteredUsers); // Return the filtered list of users
});


//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const isAlreadyFriends = async (userId, potentialFriendId) => {
  const user = await User.findById(userId);
  return user.friends.includes(potentialFriendId);
};

// Handle sending a friend request
const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id; // The logged-in user's ID

    // Check if the receiver is the same as the sender
    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    // Check if the receiver is already a friend
    const sender = await User.findById(senderId).populate("friends"); // Assuming you have a 'friends' field in the User schema

    const isAlreadyFriend = sender.friends.some(friend => friend._id.toString() === receiverId);
    if (isAlreadyFriend) {
      return res.status(400).json({ message: "You are already friends with this user." });
    }

    // Proceed with sending the friend request if not already friends
    const request = new Request({
      sender: senderId,
      receiver: receiverId,
    });

    await request.save();

    res.status(200).json({ message: "Friend request sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




const getAcceptedUsers = async (req, res) => {
  try {
    const userId = req.user._id; // Extract logged-in user from the request object (from middleware)

    // Find the accepted users (assuming you store friends or accepted users in 'friends' array)
    const acceptedUsers = await User.find({ 'friends': { $in: [userId] } });

    res.status(200).json(acceptedUsers); // Respond with the list of accepted users
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};



const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the logged-in user is the receiver of the request
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    // Update the request status to "accepted"
    request.status = 'accepted';
    await request.save();

    // Optionally, add logic here to add the sender as a friend to the receiver's friend list

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the logged-in user is the receiver of the request
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }

    // Remove the request or mark it as rejected (optional, based on your logic)
    await request.delete();  // Or set status to 'rejected' if you're keeping records of rejected requests

    res.status(200).json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getFriendRequests = async (req, res) => {
  try {
    // Check if req.user exists before proceeding
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    const friendRequests = await Request.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
    .populate('sender', 'name email')  // Populate sender data
    .populate('receiver', 'name email');  // Populate receiver data

    if (!friendRequests || friendRequests.length === 0) {
      return res.status(404).json({ message: 'No friend requests found.' });
    }

    return res.status(200).json(friendRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching friend requests' });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.user; // Get the currently authenticated user

    // Validate userId
    if (!userId) {
      console.error("User ID is missing in request body");
      return res.status(400).json({ message: 'User ID is required to block.' });
    }

    // Check if the user to block exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent blocking oneself
    if (userId === currentUser._id.toString()) {
      console.error("User tried to block themselves");
      return res.status(400).json({ message: 'You cannot block yourself.' });
    }

    // Check if the user is already blocked
    if (currentUser.blockedUsers.includes(userId)) {
      console.log("User is already blocked");
      return res.status(400).json({ message: 'User is already blocked.' });
    }

    // Add the user to the blocked list
    currentUser.blockedUsers.push(userId);
    await currentUser.save();  // Ensure the change is saved to the database

    // Verify that the blockedUsers list is updated
    const updatedUser = await User.findById(currentUser._id);
    console.log("Updated Blocked Users:", updatedUser.blockedUsers);

    return res.status(200).json({ message: 'User blocked successfully.' });
  } catch (error) {
    console.error("Error in blockUser:", error);
    return res.status(500).json({ message: "Failed to block user", error: error.message });
  }
};

//@description     Unblock a user
//@route           POST /api/user/unblock
//@access          Protected

app.get('/api/user/requests', async (req, res) => {
  try {
    const userId = req.user._id;  // Assuming you use JWT authentication
    const requests = await FriendRequest.find({ recipient: userId, status: 'pending' });

    if (!requests) {
      return res.status(404).json({ message: 'No requests found' });
    }

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;  // Get userId to unblock
    const currentUser = req.user; // Get the currently authenticated user

    // Log currentUser to debug
    console.log("Current User:", currentUser);

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to unblock.' });
    }

    // Check if currentUser is populated and has blockedUsers
    if (!currentUser || !Array.isArray(currentUser.blockedUsers)) {
      return res.status(500).json({ message: 'Blocked users list is not available or not an array.' });
    }

    // Check if the user is in the blocked list
    const index = currentUser.blockedUsers.indexOf(userId);
    if (index === -1) {
      return res.status(400).json({ message: 'User is not blocked.' });
    }

    // Remove the user from the blocked list
    currentUser.blockedUsers.splice(index, 1);

    // Save the current user with the updated blockedUsers array
    await currentUser.save();

    return res.status(200).json({ message: 'User unblocked successfully.' });
  } catch (error) {
    console.error("Error in unblockUser:", error);  // Log the error for debugging
    return res.status(500).json({ message: 'Failed to unblock user', error: error.message });
  }
};


const removeFriend = async (req, res) => {
  try {
    const { userId } = req.body; // User to be removed from friend list
    const loggedInUserId = req.user._id; // Logged-in user ID

    // Remove the friend from both users' friend lists
    await User.updateOne({ _id: loggedInUserId }, { $pull: { friends: userId } });
    await User.updateOne({ _id: userId }, { $pull: { friends: loggedInUserId } });

    res.status(200).json({ message: "Friend removed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//@description     Get all users excluding the current authenticated user
//@route           GET /api/user?search=
//@access          Protected

module.exports = {
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
  removeFriend,
  isAlreadyFriends
};
