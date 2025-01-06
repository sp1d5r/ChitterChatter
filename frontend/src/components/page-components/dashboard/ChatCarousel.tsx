import React, { useEffect, useState } from 'react';
import { Button } from "../../shadcn/button";
import { ChatData } from 'shared';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../shadcn/dialog";

interface ChatCard {
  title: string;
  content: () => React.ReactNode;
}

export interface ChatCarouselProps {  
    chat: ChatData;
    onDelete?: (chatId: string) => void;
}

export const ChatCarousel: React.FC<ChatCarouselProps> = ({ chat, onDelete }) => {
  const [activeCard, setActiveCard] = useState(0);
  
  const cards: ChatCard[] = [
    {
      title: "Member Analysis",
      content: () => {
        if (!chat.analysis) return <p>Analysis not started</p>;
        if (chat.analysis.status === 'failed') return <p>Error: {chat.analysis.error}</p>;
        if (chat.analysis.status === 'pending' || chat.analysis.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }

        // Sort members by red flag score
        const sortedMembers = [...chat.analysis.results]
          .filter(m => m.redFlagScore !== undefined)
          .sort((a, b) => (b.redFlagScore ?? 0) - (a.redFlagScore ?? 0))
          .slice(0, 3); // Top 3 members

        return (
          <div className="h-full">
            <p className="text-sm mb-2">Top Red Flags 🚩</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={sortedMembers}>
                <XAxis dataKey="memberId" />
                <Bar dataKey="redFlagScore" fill="#ef4444">
                  {sortedMembers.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? '#ef4444' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
    },
    {
      title: "Group Vibe",
      content: () => {
        if (!chat.groupVibe) return <p>Analysis not started</p>;
        if (chat.groupVibe.status === 'failed') return <p>Error: {chat.groupVibe.error}</p>;
        if (chat.groupVibe.status === 'pending' || chat.groupVibe.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }

        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2">
              {chat.groupVibe.results.chaosLevel.rating}/10
            </div>
            <p className="text-sm text-center">Chaos Level</p>
            <p className="text-xs text-muted-foreground mt-2">
              {chat.groupVibe.results.personalityType}
            </p>
          </div>
        );
      }
    },
    {
      title: "Memorable Moments",
      content: () => {
        if (!chat.memorableMoments) return <p>Analysis not started</p>;
        if (chat.memorableMoments.status === 'failed') return <p>Error: {chat.memorableMoments.error}</p>;
        if (chat.memorableMoments.status === 'pending' || chat.memorableMoments.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }

        const topMoment = chat.memorableMoments.results.epicDiscussions[0];
        return (
          <div className="h-full flex flex-col justify-center">
            <p className="text-sm font-medium mb-1">Top Discussion 🔥</p>
            <p className="text-lg mb-1">{topMoment.topic}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {topMoment.highlight}
            </p>
          </div>
        );
      }
    },
    {
      title: "Superlatives",
      content: () => {
        if (!chat.superlatives) return <p>Analysis not started</p>;
        if (chat.superlatives.status === 'failed') return <p>Error: {chat.superlatives.error}</p>;
        if (chat.superlatives.status === 'pending' || chat.superlatives.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }

        const topAward = chat.superlatives.results.awards[0];
        return (
          <div className="h-full flex flex-col justify-center">
            <p className="text-sm font-medium mb-1">🏆 Top Award</p>
            <p className="text-lg mb-1">{topAward.title}</p>
            <p className="text-sm">Goes to: {topAward.recipient}</p>
          </div>
        );
      }
    },
  ];

  const nextCard = () => {
    setActiveCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  useEffect(() =>{
    const timer = setInterval(() => {
      nextCard();
    }, 5000);

    return () => clearInterval(timer);
  }, [])

  return (
    <div className="w-full max-w-4xl relative">
      <div className="relative rounded-lg border p-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Chat</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  const closeEvent = new Event('close');
                  e.currentTarget.dispatchEvent(closeEvent);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (onDelete && chat.id) {
                    onDelete(chat.id);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col md:flex-row items-center">
          <div className="overflow-hidden mx-8 mb-8 w-full">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${activeCard * 100}%)` }}
            >
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-4">
                    <h3 className="font-medium">{card.title}</h3>
                    <div className="w-full h-48 rounded-lg p-4 border">
                      {card.content()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold">{chat.conversationType}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{chat.platform}</p>
            <div className="flex items-center gap-2 flex-wrap">
                {chat.members.map((member) => (
                    <div className="flex items-center gap-2">
                        <div className="rounded-full h-6 w-6 bg-blue-200 dark:bg-blue-800 rounded-lg shadow-sm" />
                        <p>{member}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 z-10"
            onClick={prevCard}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {cards.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeCard === index ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              onClick={() => setActiveCard(index)}
            />
          ))}

        <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 z-10"
            onClick={nextCard}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};