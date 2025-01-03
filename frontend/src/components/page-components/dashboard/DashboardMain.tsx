import React from 'react';
import { Button } from "../../shadcn/button";
import { Plus } from "lucide-react";
import { motion } from 'framer-motion';
import { ChatCarousel } from './ChatCarousel';

export interface DashboardMainProps {

}

export const DashboardMain : React.FC<DashboardMainProps> = () => {
    return <div className="w-full h-full dark:text-white flex flex-col gap-2">
        <h1 className='text-4xl font-bold '>Your Conversations</h1>
        <p>Check out your conversations here. You can also create a new conversation by clicking the button below.</p>

        <div className="flex justify-start items-center gap-2 flex-wrap lg:flex-no-wrap overflow-x-scroll my-2">
            <DashboardButton icon={<Plus />} text="Create New Conversation" subtext="Analyse a new conversation." />
        </div>

        <div className="flex gap-2 flex-wrap">
            <ChatCarousel />
            <ChatCarousel />
        </div>
    </div>
}

interface DashboardButtonProps {
    icon: React.ReactNode;
    text: string;
    subtext: string;
    beta?: boolean;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ icon, text, subtext, beta = false }) => {
    const fadeIn = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.7 }
      };

    return (
        <Button variant="outline" className="h-auto w-full justify-start text-left max-w-[350px] ">
            <motion.div {...fadeIn} className="flex items-center">
                <div className="mr-3 text-2xl">{icon}</div>
                <div>
                    <div className="font-bold flex items-center">
                        {text}
                        {beta && <span className="ml-2 px-1 py-0.5 text-xs bg-purple-600 rounded">Beta</span>}
                    </div>
                    <div className="text-sm text-muted-foreground text-wrap">{subtext}</div>
                </div>
            </motion.div>
        </Button>
    );
}
