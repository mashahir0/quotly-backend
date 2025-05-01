import chatRepository from "../infrastructure/repositories/chatRepository";
import UserRepository from "../infrastructure/repositories/userRepository";


const chatService = {
  async sendMessage(senderId: string, receiverId: string, message: string) {
    return await chatRepository.saveMessage(senderId, receiverId, message);
  },

  async getMessages(senderId: string, receiverId: string) {
    return await chatRepository.getMessages(senderId, receiverId);
  },

  async markMessagesAsSeen(senderId: string, receiverId: string) {
    return await chatRepository.markMessagesAsSeen(senderId, receiverId);
  },
  // async getRecentUsersPaginated(userId: string, search: string, page: number, limit: number) {
  //   if (search.trim()) {
  //     console.log(search ,"from serivce chat")
  //     return await UserRepository.searchUsers(search, page, limit);
  //   } else {
  //     return await chatRepository.getRecentChatUsersPaginated(userId, page, limit);
  //   }
  // }
  async getRecentUsersPaginated(userId: string, search: string, page: number, limit: number) {
   return await chatRepository.getRecentChatUsersPaginated(userId, page, limit,search);
  }
  
  
};

export default chatService;
