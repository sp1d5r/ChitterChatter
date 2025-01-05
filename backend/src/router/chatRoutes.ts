import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createChat } from '../controllers/chatController';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createChat);

export default router;
