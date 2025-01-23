import multer from 'multer';
import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
}).single('chatFile');

// Wrap multer middleware in a Promise
const handleMultipartData = (req: Request, res: Response) => {
    return new Promise<void>((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

export const createChat = async (req: Request, res: Response): Promise<void> => {
    try {
        await handleMultipartData(req, res);
        
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Access the uploaded file (now using req.file for single file upload)
        const chatFile = req.file;
        
        if (!chatFile) {
            res.status(400).json({ error: 'No chat file provided' });
            return;
        }

        // Create processed chat data
        const processedChatData = {
            platform: req.body.platform,
            conversationType: req.body.conversationType,
            members: JSON.parse(req.body.members || '[]'),
            chatContent: chatFile.buffer.toString('utf-8'),
            analytics: req.body.analytics ? JSON.parse(req.body.analytics) : undefined
        };

        const chatService = new ChatService();
        const newChat = await chatService.createChat(userId, processedChatData);
        
        res.status(201).json(newChat);
    } catch (error) {
        console.error('Chat creation error:', error);
        console.error('Request body:', req.body);
        console.error('File:', req.file);
        res.status(500).json({ error: 'Failed to create chat' });
    }
};