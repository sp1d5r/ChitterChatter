import { ChatData } from "shared";

// Create a new type for processed chat data without the file
type ProcessedChatData = Omit<ChatData, 'chatFile'> & {
    chatContent: string;
};

interface StoredChat extends ProcessedChatData {
    id: string;
    userId: string;
    createdAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class ChatService {
    async createChat(
        userId: string, 
        chatData: ProcessedChatData
    ): Promise<StoredChat> {
        // Log the incoming data
        console.log('Received chat data:', {
            userId,
            platform: chatData.platform,
            conversationType: chatData.conversationType,
            members: chatData.members,
            contentLength: chatData.chatContent.length,
            contentPreview: chatData.chatContent.substring(0, 100) + '...'
        });
        
        const newChat: StoredChat = {
            id: crypto.randomUUID(),
            userId,
            platform: chatData.platform,
            conversationType: chatData.conversationType,
            members: chatData.members,
            chatContent: chatData.chatContent,
            createdAt: new Date(),
            status: 'pending'
        };

        // Log the created chat object
        console.log('Created new chat:', {
            ...newChat,
            contentLength: newChat.chatContent.length,
            contentPreview: newChat.chatContent.substring(0, 100) + '...'
        });

        return newChat;
    }
}
