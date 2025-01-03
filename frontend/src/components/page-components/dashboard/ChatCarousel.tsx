import React, { useEffect, useState } from 'react';
import { Button } from "../../shadcn/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatCard {
  title: string;
  color: string;
}

export const ChatCarousel: React.FC = () => {
  const [activeCard, setActiveCard] = useState(0);
  
  const cards: ChatCard[] = [
    { title: "Recent Activity", color: "bg-blue-200 dark:bg-blue-800" },
    { title: "Weekly Stats", color: "bg-green-200 dark:bg-green-800" },
    { title: "Monthly Overview", color: "bg-purple-200 dark:bg-purple-800" },
    { title: "Performance", color: "bg-orange-200 dark:bg-orange-800" },
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
    <div className="w-full max-w-4xl mt-6 relative">
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
                    <div className={`${card.color} w-full h-48 rounded-lg shadow-sm`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold">The Family Group Chat</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Facebook Messenger</p>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="rounded-full h-6 w-6 bg-blue-200 dark:bg-blue-800 rounded-lg shadow-sm" />
                    <p>Haji</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="rounded-full h-6 w-6 bg-blue-200 dark:bg-blue-800 rounded-lg shadow-sm" />
                    <p>Haji</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="rounded-full h-6 w-6 bg-blue-200 dark:bg-blue-800 rounded-lg shadow-sm" />
                    <p>Haji</p>
                </div>
                <div className="flex items-center gap-2">
                <div className="rounded-full h-6 w-6 bg-blue-200 dark:bg-blue-800 rounded-lg shadow-sm" />
                    <p>Haji</p>
                </div>
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