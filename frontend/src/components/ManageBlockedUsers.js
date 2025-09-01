import { Box, Text, Button, Stack } from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";

const BlockedUsersPage = ({ user, setBlockedUsers }) => {
  const [blockedUsers, setBlockedUsersState] = useState([]);

  useEffect(() => {
    // Fetch blocked users from the backend when the page loads
    const fetchBlockedUsers = async () => {
      try {
        const { data } = await axios.get(`/api/users/blocked/${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBlockedUsersState(data.blockedUsers); // Update state with blocked users
        setBlockedUsers(data.blockedUsers); // Pass blocked users to the parent component if needed
      } catch (error) {
        console.error("Failed to fetch blocked users:", error);
      }
    };

    fetchBlockedUsers();
  }, [user, setBlockedUsers]);

  const unblockUser = async (unblockUserId) => {
    try {
      // Call API to unblock user
      await axios.post(
        "/api/unblock",
        { userId: user._id, unblockUserId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      // Update blocked users state on successful unblock
      setBlockedUsersState(blockedUsers.filter((user) => user._id !== unblockUserId));
      setBlockedUsers(blockedUsers.filter((user) => user._id !== unblockUserId)); // Update parent component
    } catch (error) {
      console.error("Failed to unblock user:", error);
    }
  };

  return (
    <Box p={3} bg="#F8F8F8" borderRadius="lg" w="100%" h="100%" overflowY="hidden">
      <Text fontWeight="bold" mb={2}>Blocked Users</Text>
      {blockedUsers.length > 0 ? (
        <Stack>
          {blockedUsers.map((blockedUser) => (
            <Box
              key={blockedUser._id} // Ensure each blocked user has a unique key
              bg="#E8E8E8"
              color="black"
              px={3}
              py={2}
              borderRadius="lg"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Text>{blockedUser.chatName || blockedUser.name}</Text>
              <Button size="sm" colorScheme="red" onClick={() => unblockUser(blockedUser._id)}>
                Unblock
              </Button>
            </Box>
          ))}
        </Stack>
      ) : (
        <Text>No blocked users.</Text>
      )}
    </Box>
  );
};

export default BlockedUsersPage;
