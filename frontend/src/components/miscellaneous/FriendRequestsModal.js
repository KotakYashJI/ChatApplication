import { 
    Box, 
    Text, 
    Button, 
    Modal, 
    ModalOverlay, 
    ModalContent, 
    ModalHeader, 
    ModalBody, 
    ModalCloseButton 
  } from "@chakra-ui/react";
  
  const FriendRequestsModal = ({ isOpen, onClose, requests, friends, onBlockUser }) => {
    const handleAcceptRequest = async (userId) => {
      // Handle accepting the friend request
    };
  
    const handleRejectRequest = async (userId) => {
      // Handle rejecting the friend request
    };
  
    const handleBlockFriend = async (friendId) => {
      if (onBlockUser) {
        await onBlockUser(friendId);
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Friend Requests</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Friend Requests Section */}
            {requests.length > 0 ? (
              requests.map((request) => (
                <Box key={request._id} mb={4}>
                  <Text>{request.name}</Text>
                  <Button 
                    onClick={() => handleAcceptRequest(request._id)} 
                    colorScheme="green" 
                    size="sm" 
                    mr={2}
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={() => handleRejectRequest(request._id)} 
                    colorScheme="red" 
                    size="sm"
                  >
                    Reject
                  </Button>
                </Box>
              ))
            ) : (
              <Text>No new requests</Text>
            )}
  
            {/* Block Friends Section */}
            <Box mt={6}>
              <Text fontWeight="bold" mb={2}>
                Block Friends
              </Text>
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <Box key={friend._id} mb={4}>
                    <Text>{friend.name}</Text>
                    <Button
                      onClick={() => handleBlockFriend(friend._id)}
                      colorScheme="red"
                      size="sm"
                    >
                      Block
                    </Button>
                  </Box>
                ))
              ) : (
                <Text>No friends to block</Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default FriendRequestsModal;
  