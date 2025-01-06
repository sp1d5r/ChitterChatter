import React, { useEffect, useState } from 'react';
import { Button } from "../../shadcn/button";
import { ChatData } from 'shared';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatCard {
  title: string;
  color: string;
  content: () => React.ReactNode;
}

export interface ChatCarouselProps {  
    chat: ChatData;
}

export const ChatCarousel: React.FC<ChatCarouselProps> = ({ chat }) => {
  const [activeCard, setActiveCard] = useState(0);
  
  const cards: ChatCard[] = [
    {
      title: "Member Analysis",
      color: "bg-blue-200 dark:bg-blue-800",
      content: () => {
        if (!chat.analysis) return <p>Analysis not started</p>;
        if (chat.analysis.status === 'failed') return <p>Error: {chat.analysis.error}</p>;
        if (chat.analysis.status === 'pending' || chat.analysis.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }
        return (
          <div className="space-y-2">
            {chat.analysis.results.map((member) => (
              <div key={member.memberId} className="text-sm">
                <p>{member.memberId}</p>
                <p>Sentiment: {member.sentimentScore?.toFixed(2) ?? 'N/A'}</p>
                <p>Funny Score: {member.funnyScore?.toFixed(2) ?? 'N/A'}</p>
                {member.redFlagScore && (
                  <p>Red Flag Score: {member.redFlagScore.toFixed(2)}</p>
                )}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: "Group Vibe",
      color: "bg-green-200 dark:bg-green-800",
      content: () => {
        if (!chat.groupVibe) return <p>Analysis not started</p>;
        if (chat.groupVibe.status === 'failed') return <p>Error: {chat.groupVibe.error}</p>;
        if (chat.groupVibe.status === 'pending' || chat.groupVibe.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }
        return (
          <div className="space-y-2">
            <p>Chaos Level: {chat.groupVibe.results.chaosLevel.rating}/10</p>
            <p>Personality: {chat.groupVibe.results.personalityType}</p>
          </div>
        );
      }
    },
    {
      title: "Memorable Moments",
      color: "bg-purple-200 dark:bg-purple-800",
      content: () => {
        if (!chat.memorableMoments) return <p>Analysis not started</p>;
        if (chat.memorableMoments.status === 'failed') return <p>Error: {chat.memorableMoments.error}</p>;
        if (chat.memorableMoments.status === 'pending' || chat.memorableMoments.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }
        return (
          <div className="space-y-2">
            {chat.memorableMoments.results.epicDiscussions.slice(0, 2).map((discussion, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{discussion.topic}</p>
                <p>{discussion.highlight}</p>
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: "Superlatives",
      color: "bg-orange-200 dark:bg-orange-800",
      content: () => {
        if (!chat.superlatives) return <p>Analysis not started</p>;
        if (chat.superlatives.status === 'failed') return <p>Error: {chat.superlatives.error}</p>;
        if (chat.superlatives.status === 'pending' || chat.superlatives.status === 'processing') {
          return <p>Analysis in progress...</p>;
        }
        return (
          <div className="space-y-2">
            {chat.superlatives.results.awards.slice(0, 3).map((award, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{award.title}</p>
                <p>{award.recipient}</p>
              </div>
            ))}
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
    }, 2000);

    return () => clearInterval(timer);
  }, [])

  return (
    <div className="w-full max-w-4xl relative">
      <div className="relative rounded-lg border p-6">
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
                    <div className={`${card.color} w-full h-48 rounded-lg shadow-sm p-4`}>
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