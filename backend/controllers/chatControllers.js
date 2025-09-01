const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// @description     Create or fetch One-to-One Chat
// @route           POST /api/chat/
// @access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @description     Block a user
// @route           PUT /api/block/:userId
// @access          Protected
const blockUser = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    if (!chat.blockedUsers.includes(userId)) {
      chat.blockedUsers.push(userId);
      await chat.save();
      res.status(200).json({ message: "User blocked successfully!" });
    } else {
      res.status(400).json({ message: "User is already blocked!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }

    chat.blockedUsers = chat.blockedUsers.filter((id) => id !== userId);
    await chat.save();
    res.status(200).json({ message: "User unblocked successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @description     Request to Join a Chat
// @route           PUT /api/chat/request/:chatId
// @access          Protected
const requestToJoinChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).json({ message: "Chat ID not found in request parameters." });
  }

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { pendingRequests: req.user._id } },
      { new: true }
    );
    res.status(200).json({ message: "Request to join sent", chat });
  } catch (error) {
    res.status(500).json({ message: "Error requesting to join chat" });
  }
});

// @description     Fetch all chats for a user
// @route           GET /api/chat/
// @access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.status(200).send(populatedResults);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @description     Create New Group Chat
// @route           POST /api/chat/group
// @access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (users.length < 2) {
    return res.status(400).json({ message: "More than 2 users are required to form a group chat" });
  }

  users.push(req.user._id); // Adding the current user to the group

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @description     Rename Group
// @route           PUT /api/chat/rename
// @access          Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({ message: "Chat ID and name are required" });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(updatedChat);
  }
});

// @description     Remove user from Group
// @route           PUT /api/chat/groupremove
// @access          Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "Chat ID and User ID are required" });
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(removed);
  }
});

// @description     Add user to Group
// @route           PUT /api/chat/groupadd
// @access          Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "Chat ID and User ID are required" });
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return res.status(404).json({ message: "Chat not found" });
  } else {
    res.json(added);
  }
});

module.exports = {
  accessChat,
  blockUser,
  unblockUser,
  requestToJoinChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
