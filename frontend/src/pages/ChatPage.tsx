import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthenticationProvider';
import { FirebaseDatabaseService } from 'shared';
import { ChatData } from 'shared/src/types/Chat';

export const ChatPage = () => {
  const { chatId } = useParams();
  const { authState } = useAuth();
  const [chat, setChat] = useState<ChatData | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (authState.user?.uid && chatId) {
      // Set up real-time listener for the specific chat
      unsubscribe = FirebaseDatabaseService.listenToDocument<ChatData>(
        `chats/${authState.user.uid}/conversations/`,
        chatId,
        (updatedChat) => {
          if (updatedChat) {
            setChat(updatedChat);
          }
        },
        (error) => {
          console.error('Error listening to chat:', error);
        }
      );
    }

    // Cleanup listener when component unmounts or chatId changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authState.user, chatId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      {chat ? (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 
                      transform transition-all duration-500 hover:scale-[1.01]
                      animate-fadeIn">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
                         bg-clip-text text-transparent mb-6">
            {chat.conversationType || 'Untitled Chat'}
          </h1>
          
          <div className="space-y-6">
            {/* Analysis Status */}
            <div className="flex items-center gap-3 text-gray-600">
              <div className={`h-3 w-3 rounded-full ${
                chat.status === 'completed' ? 'bg-green-400 animate-pulse' :
                chat.status === 'processing' ? 'bg-yellow-400 animate-ping' :
                chat.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
              }`} />
              <span className="capitalize">{chat.status || 'Pending'}</span>
            </div>

            {/* Chat Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-600">Messages</p>
                <p className="text-2xl font-bold">{chat.messageCount || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600">Members</p>
                <p className="text-2xl font-bold">{chat.members?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="animate-bounce">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};   