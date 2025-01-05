import { ChatData } from "shared";


interface StoredChat extends ChatData {
    id: string;
    userId: string;
    createdAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class ChatService {

  async createChat(userId: string, chatData: ChatData): Promise<StoredChat> {
        // Here you would typically:
        // 1. Validate the data
        // 2. Store it in your database
        // 3. Queue any background processing if needed
        
        const newChat: StoredChat = {
            ...chatData,
            id: crypto.randomUUID(), // Or your DB's ID generation
            userId,
            createdAt: new Date(),
            status: 'pending'
        };

        // TODO: Add your database storage logic here
        console.log('Creating new chat:', newChat);

        return newChat;
    }
}
