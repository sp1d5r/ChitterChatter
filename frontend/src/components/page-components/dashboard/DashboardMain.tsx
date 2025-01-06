import React, { useEffect, useState } from 'react';
import { ChatCarousel } from './ChatCarousel';
import { NewChatModal } from './NewChatModal';
import { ChatData } from 'shared/src/types/Chat';
import { useApi } from '../../../contexts/ApiContext';
import { useAuth } from '../../../contexts/AuthenticationProvider';
import { FirebaseDatabaseService } from 'shared';

export interface DashboardMainProps {

}

export const DashboardMain : React.FC<DashboardMainProps> = () => {
    const { fetchWithAuth } = useApi();
    const { authState } = useAuth();
    const [chats, setChats] = useState<ChatData[]>([]);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (authState.user?.uid) {
            // Set up real-time listener for chats
            unsubscribe = FirebaseDatabaseService.listenToQuery<ChatData>(
                `chats/${authState.user.uid}/conversations`,
                'userId', // assuming this is the field that stores the user ID
                authState.user.uid,
                'createdAt', // assuming you have a timestamp field to order by
                (updatedChats) => {
                    if (updatedChats) {
                        setChats(updatedChats);
                    }
                },
                (error) => {
                    console.error('Error listening to chats:', error);
                }
            );
        }

        // Cleanup listener when component unmounts or user changes
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [authState.user]);

    const handleNewChat = async (chatData: ChatData) => {
        try {
            const formData = new FormData();
            
            formData.append('platform', chatData.platform as string);
            formData.append('conversationType', chatData.conversationType as string);
            formData.append('members', JSON.stringify(chatData.members));
            
            if (chatData.chatFile) {
                formData.append('chatFile', chatData.chatFile);
            }

            const response = await fetchWithAuth('api/chats', {
                method: 'POST',
                body: formData
            });
            
            const newChat = await response.json();
            console.log('Chat created successfully:', newChat);
            
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    return <div className="w-full h-full dark:text-white flex flex-col gap-2">
        <h1 className='text-4xl font-bold '>Your Conversations</h1>
        <p>Check out your conversations here. You can also create a new conversation by clicking the button below.</p>

        <NewChatModal onFinish={handleNewChat} />
        
        <div className="flex gap-2 flex-wrap">
            {chats.reverse().map((chat) => (
                <ChatCarousel key={chat.id} chat={chat} />
            ))}
        </div>
    </div>
}