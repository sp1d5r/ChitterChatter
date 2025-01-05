import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';
import { ChatData } from 'shared';


export const createChat = async (req: Request, res: Response) => {
    try {
        const chatData: ChatData = req.body;
        const userId = req.user?.uid; // From auth middleware

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const chatService = new ChatService();
        const newChat = await chatService.createChat(userId, chatData);
        
        res.status(201).json(newChat);
    } catch (error) {
        console.error('Chat creation error:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
};