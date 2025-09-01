import { Button, Box, Text } from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect } from "react";

// Function to handle accepting friend requests
const handleAcceptRequest = async (requesterId) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(
      `/api/user/accept-friend-request`,
      { userId: requesterId },
      config
    );

    toast({
      title: "Friend Request Accepted",
      description: `You are now friends with ${data.name}`,
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  } catch (error) {
    toast({
      title: "Error Accepting Friend Request",
      description: error.response.data.message || "An error occurred.",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  }
};

// List the incoming friend requests
const FriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user/friend-requests`, config);
      setFriendRequests(data);
    };

    fetchRequests();
  }, []);

  return (
    <Box>
      <Text>Incoming Friend Requests</Text>
      {friendRequests.map((request) => (
        <Box key={request._id} display="flex" alignItems="center">
          <Text>{request.name}</Text>
          <Button onClick={() => handleAcceptRequest(request._id)} colorScheme="blue">
            Accept
          </Button>
          <Button colorScheme="red" onClick={() => handleRejectRequest(request._id)}>
            Reject
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default FriendRequests;