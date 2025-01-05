import { ChatData, FirebaseDatabaseService } from "shared";
import crypto from 'crypto';

// Create a new type for processed chat data without the file
type ProcessedChatData = Omit<ChatData, 'chatFile'> & {
    chatContent: string;
};

// Type for what we actually store in Firestore
interface StoredChatMetadata {
    id: string;
    userId: string;
    platform: string;
    conversationType: string;
    members: string[];
    contentPreview: string;
    createdAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    messageCount?: number;
    // Add any other metadata you want to track
}

export class ChatService {
    async createChat(
        userId: string, 
        chatData: ProcessedChatData
    ): Promise<StoredChatMetadata> {
        // Generate a preview of the chat content (first 100 chars)
        const contentPreview = chatData.chatContent.substring(0, 100) + '...';
        
        // Create metadata object for Firestore
        const chatMetadata: StoredChatMetadata = {
            id: crypto.randomUUID(),
            userId,
            platform: chatData.platform || 'whatsapp',
            conversationType: chatData.conversationType || 'group',
            members: chatData.members,
            contentPreview,
            createdAt: new Date(),
            status: 'pending',
            messageCount: chatData.chatContent.split('\n').length, // Rough estimate
        };

        // Log the metadata we're about to store
        console.log('Storing chat metadata:', {
            ...chatMetadata,
            contentPreview: chatMetadata.contentPreview
        });

        // Store in Firestore
        await FirebaseDatabaseService.addDocument(
            `chats/${userId}/conversations/`,
            chatMetadata,
            (docId) => {
                console.log('Chat metadata stored with ID:', docId);
            },
            (error) => {
                console.error('Failed to store chat metadata:', error);
                throw error;
            }
        );

        return chatMetadata;
    }
}
