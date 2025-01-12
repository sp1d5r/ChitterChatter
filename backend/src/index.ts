import express from 'express';
import cors from 'cors';
import { initializeFirebase } from 'shared';
import * as dotenv from 'dotenv';

dotenv.config();

initializeFirebase({
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
});

import serverless from 'serverless-http';
import articleRoutes from './router/articleRoutes';
import paymentRoutes from './router/paymentRoutes';
import chatRoutes from './router/chatRoutes';

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS
app.use(cors(corsOptions));

// Routes 
app.use('/api/articles', articleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);

app.listen(port, () => {
  console.log(`Backend server running at ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});


export const handler = serverless(app);