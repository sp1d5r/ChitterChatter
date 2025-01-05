import React from 'react';
import { ChatCarousel } from './ChatCarousel';
import { NewChatModal } from './NewChatModal';
import { ChatData } from 'shared/src/types/Chat';

export interface DashboardMainProps {

}

export const DashboardMain : React.FC<DashboardMainProps> = () => {
    const handleNewChat = (chatData: ChatData) => {
        console.log('New Chat Data:', chatData);
    };

    return <div className="w-full h-full dark:text-white flex flex-col gap-2">
        <h1 className='text-4xl font-bold '>Your Conversations</h1>
        <p>Check out your conversations here. You can also create a new conversation by clicking the button below.</p>

        <div className="flex justify-start items-center gap-2 flex-wrap lg:flex-no-wrap overflow-x-scroll my-2">
            <NewChatModal onFinish={handleNewChat} />
        </div>

        <div className="flex gap-2 flex-wrap">
            <ChatCarousel />
            <ChatCarousel />
        </div>
    </div>
}