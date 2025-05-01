import { Request, Response } from "express";
import chatService from "../../usecases/chatServices";




interface AuthenticatedRequest extends Request {
    user?: { id: string; name: string; email: string; role: string }; 
  }


const chatController = {
  // ✅ Send a new message
//   async sendMessage(req: AuthenticatedRequest, res: Response) {
//     try {
//         console.log('send messag cont')
//       const { receiverId, message } = req.body;
//       const senderId = req.user?.id;
//       if (!senderId || !receiverId || !message) return res.status(400).json({ message: "Invalid data" });

//       const newMessage = await chatService.sendMessage(senderId, receiverId, message);
//       console.log(`📩 Sending message from ${senderId} to ${receiverId}`);
//         console.log(`Message Content:`, newMessage);

//     io.to(receiverId).emit("newMessage", newMessage);
//     io.to(senderId).emit("newMessage", newMessage);


//       res.status(201).json(newMessage);
//     } catch (error:any) {
//       res.status(500).json({ message: "Error sending message", error: error.message });
//     }
//   },
async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user?.id;

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ message: "Invalid data" });
        }

        // Store message in DB
        const newMessage = await chatService.sendMessage(senderId, receiverId, message);

        // ✅ Do NOT emit via WebSocket (handled separately)
        res.status(201).json(newMessage);
    } catch (error: any) {
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
},



  // ✅ Get message history
  async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.user?.id;

      const { receiverId } = req.params;
      if (!senderId || !receiverId) return res.status(400).json({ message: "Invalid data" });

      const messages = await chatService.getMessages(senderId, receiverId);
      res.status(200).json(messages);
    } catch (error :any) {
      res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
  },

  // ✅ Mark messages as seen
  async markMessagesAsSeen(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.user?.id;
      const { receiverId } = req.params;
      if (!senderId) {
        return res.status(401).json({ message: "Unauthorized: No sender ID found" });
      }
      await chatService.markMessagesAsSeen(senderId, receiverId);
      res.status(200).json({ message: "Messages marked as seen" });
    } catch (error :any) {
      res.status(500).json({ message: "Error marking messages", error: error.message });
    }
  },

  async getUsersForChat(req: AuthenticatedRequest, res: Response) {
    try {

      const { search = "", page = "1", limit = "20" } = req.query;
      const userId = req.user?.id;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const usersData = await chatService.getRecentUsersPaginated(
        userId,
        search as string,
        Number(page),
        Number(limit)
      );
      if(!usersData) return res.status(401).json({message : "user data not found"})

  
      res.json({
        users: usersData.users,
        total: usersData.total,
      });
    } catch (error) {
      console.error("Error getting paginated chat users", error);
      res.status(500).json({ message: "Server error" });
    }
  }
  
  
};

export default chatController;
