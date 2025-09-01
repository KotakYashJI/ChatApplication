import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  const [blockedUsers, setBlockedUsers] = useState([]); // state to store blocked users
  const [requestSent, setRequestSent] = useState({}); // Track sent friend requests

  // Fetch chats and update the chat list
  const fetchChats = async () => {
    try {
      if (!user || !user.token) {
        toast({
          title: "Unauthorized",
          description: "You are not logged in.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);

      if (data) {
        setChats(data); // This will be the updated list of chats
      } else {
        throw new Error("No chats found.");
      }
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error?.response?.data?.message || "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const fetchBlockedUsers = () => {
    // Get blocked users from localStorage
    const blockedUsersList = JSON.parse(localStorage.getItem("blockedUsers")) || [];
    setBlockedUsers(blockedUsersList);
  };


  const handleBlockUser = async (userId, chat) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/user/block", { userId }, config);

      // After blocking, remove the blocked user's chat from the list
      const updatedChats = chats.filter(
        (chat) => !chat.users.some((user) => user._id === userId)
      );
      setChats(updatedChats);

      // Update localStorage with blocked users
      let blockedUsers = JSON.parse(localStorage.getItem("blockedUsers")) || [];
      blockedUsers.push(userId);
      localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));

      toast({
        title: "User Blocked",
        description: data.message || "User has been blocked successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });

      fetchBlockedUsers(); // Update the blocked user list
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to block user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/user/unblock", { userId }, config);

      // Remove the user from the blocked list in localStorage
      let blockedUsers = JSON.parse(localStorage.getItem("blockedUsers")) || [];
      blockedUsers = blockedUsers.filter(id => id !== userId);
      localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));

      // Optionally update the UI if needed
      fetchChats(); // Refresh chats after unblocking

      toast({
        title: "User Unblocked",
        description: data.message || "User has been unblocked successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });

      fetchBlockedUsers(); // Update the blocked user list
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to unblock user",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const isBlocked = (chat) => {
    const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers")) || [];
    return blockedUsers.includes(chat.users[0]._id); // Check if the user is in the blocked list
  };

  // To ensure that blocked users are excluded from the displayed chat list even after refresh
  const filterChats = () => {
    const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers")) || [];
    return chats.filter((chat) => {
      return !chat.users.some((user) => blockedUsers.includes(user._id));
    });
  };

  const handleAddToGroupChat = (selectedUsers) => {
    // Check if any of the selected users are blocked
    const blockedUser = selectedUsers.find((user) => isBlocked({ users: [user] }));
    if (blockedUser) {
      toast({
        title: "Blocked User",
        description: "You cannot add a blocked user to the group.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return; // Prevent adding the blocked user
    }
    // Continue with group chat creation logic if no user is blocked
  };


  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem("sentRequests")) || {};
    setRequestSent(savedRequests);
  }, []);

  const handleSendRequest = async (recipient) => {
    // Check if request has already been sent to the recipient
    if (requestSent[recipient._id]) {
      toast({
        title: "Request Already Sent",
        description: `You have already sent a request to ${recipient.name}.`,
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return; // Prevent sending a duplicate request
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const payload = {
        senderId: user._id,  // Current user's ID
        receiverId: recipient._id,  // Recipient's ID
      };

      // Send the friend request
      const { data } = await axios.post(
        "/api/user/send-friend-request",
        payload,
        config
      );

      console.log("Friend request sent:", data);  // Check response for debugging

      // Update the state to mark the request as sent
      const updatedRequests = { ...requestSent, [recipient._id]: true };

      // Persist the updated requests to localStorage
      localStorage.setItem("sentRequests", JSON.stringify(updatedRequests));

      // Update state to re-render with the new request status
      setRequestSent(updatedRequests);

      toast({
        title: "Friend Request Sent",
        description: `You have sent a friend request to ${recipient.name}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Error Sending Friend Request",
        description: error.response?.data?.message || "An error occurred while sending the request.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };


  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats(); // Ensure that after each refresh, we load updated chats
    fetchBlockedUsers(); // Load the list of blocked users
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal onAddToGroupChat={handleAddToGroupChat}>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {/* Blocked Users Section */}
      <Box
        pb={3}
        fontSize={{ base: "22px", md: "24px" }}
        fontFamily="Work sans"
        w="100%"
      >
        <Text fontWeight="bold">Blocked Users</Text>
        <Box>
          {blockedUsers.length > 0 ? (
            blockedUsers.map((blockedUserId) => (
              <Box key={blockedUserId}>
                <Text>{blockedUserId}</Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleUnblockUser(blockedUserId)}
                >
                  Unblock
                </Button>
              </Box>
            ))
          ) : (
            <Text>No users blocked.</Text>
          )}
        </Box>
      </Box>

      {/* Chats List */}
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {filterChats().map((chat) => {
              // Ensure that chat.users is not empty and loggedUser is defined
              const otherUser = chat.users && loggedUser ? chat.users.find((u) => u._id !== loggedUser._id) : null;

              // If otherUser is not found, skip rendering for this chat
              if (!otherUser) return null;

              const blocked = isBlocked(chat); // Check if user is blocked

              return (
                !blocked && ( // Only render chats that are not blocked
                  <Box
                    onClick={() => setSelectedChat(chat)}
                    cursor="pointer"
                    bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                    color={selectedChat === chat ? "white" : "black"}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    key={chat._id}
                  >
                    <Text>
                      {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                    </Text>
                    {chat.latestMessage && (
                      <Text fontSize="xs">
                        <b>{chat.latestMessage.sender.name} : </b>
                        {chat.latestMessage.content.length > 50
                          ? chat.latestMessage.content.substring(0, 51) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                    <Box mt={2}>
                      {!chat.isGroupChat && (
                        <>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleBlockUser(otherUser._id, chat)} // Pass chat to remove it after block
                            disabled={blocked} // Disable Block button if user is blocked
                            mr={2}
                          >
                            Block
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleUnblockUser(otherUser._id)}
                            disabled={!blocked} // Disable Unblock button if user is not blocked
                          >
                            Unblock
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleSendRequest(otherUser)} // Send friend request
                          >
                            {requestSent[otherUser._id] ? "Request Sent" : "Send Request"}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                )
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}

      </Box>
    </Box>
  );
};

export default MyChats; 