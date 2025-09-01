// frontend/src/components/BlockList.js
import { Box, Text } from "@chakra-ui/react";

const BlockList = () => {
  return (
    <Box
      d="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      p={5}
      bg="white"
      w="100%"
      h="100vh"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Text fontSize="2xl" fontFamily="Work sans" color="red.500">
        You are currently blocked in one or more chats.
      </Text>
      <Text fontSize="lg" color="gray.500">
        Contact the administrator or unblock yourself to continue.
      </Text>
    </Box>
  );
};

export default BlockList;