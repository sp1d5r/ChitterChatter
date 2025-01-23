import React, { useState, useEffect } from 'react';
import {Button} from "../../shadcn/button"
import { ChatData } from 'shared';
import { ChevronLeft, ChevronRight, Trash2, AlertCircle, ExternalLink, Users, Activity, Trophy, MessageCircle } from 'lucide-react';
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
  icon: React.ReactNode;
  content: () => React.ReactNode;
  bgColor: string;
}

export interface ChatCarouselProps {  
  chat: ChatData;
  onDelete?: (chatId: string) => void;
}

export const ChatCarousel: React.FC<ChatCarouselProps> = ({ chat, onDelete }) => {
  const [activeCard, setActiveCard] = useState(0);
  
  const cards: ChatCard[] = [
    {
      title: "Group Insights",
      icon: <Users className="h-5 w-5" />,
      bgColor: "bg-blue-50 dark:bg-blue-950",
      content: () => {
        if (!chat.analysis || chat.analysis.status !== 'completed') {
          return <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Analysis pending...</p>
          </div>;
        }

        const sortedMembers = [...chat.analysis.results]
          .filter(m => m.redFlagScore !== undefined)
          .sort((a, b) => (b.redFlagScore ?? 0) - (a.redFlagScore ?? 0))
          .slice(0, 3);

        return (
          <div className="h-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Member Activity</h4>
              <span className="text-xs text-muted-foreground">Top Contributors</span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={sortedMembers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="memberId" tick={{ fontSize: 12 }} />
                <Bar dataKey="redFlagScore" radius={[4, 4, 0, 0]}>
                  {sortedMembers.map((_, index) => (
                    <Cell key={index} fill={`hsl(${220 + index * 20}, 100%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
    },
    {
      title: "Conversation Energy",
      icon: <Activity className="h-5 w-5" />,
      bgColor: "bg-purple-50 dark:bg-purple-950",
      content: () => {
        if (!chat.groupVibe || chat.groupVibe.status !== 'completed') {
          return <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Analysis pending...</p>
          </div>;
        }

        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold mb-2">
                {chat.groupVibe.results.chaosLevel.rating}
                <span className="text-2xl text-muted-foreground">/10</span>
              </div>
              <p className="text-sm font-medium">Energy Level</p>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-2">
              {chat.groupVibe.results.personalityType}
            </p>
          </div>
        );
      }
    },
    {
      title: "Peak Moments",
      icon: <Trophy className="h-5 w-5" />,
      bgColor: "bg-amber-50 dark:bg-amber-950",
      content: () => {
        if (!chat.memorableMoments || chat.memorableMoments.status !== 'completed' || !chat.memorableMoments.results.epicDiscussions.length || !chat.memorableMoments.results.epicDiscussions[0].topic || !chat.memorableMoments.results.epicDiscussions[0].highlight) {
          return <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Analysis pending...</p>
          </div>;
        }

        const topMoment = chat.memorableMoments.results.epicDiscussions[0];

        return (
          <div className="h-full flex flex-col">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">🔥 Hottest Discussion</h4>
                <p className="text-lg font-medium leading-tight">{topMoment.topic ?? "No topic found"}</p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {topMoment.highlight ?? "No highlight found"}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      title: "Chat Awards",
      icon: <MessageCircle className="h-5 w-5" />,
      bgColor: "bg-green-50 dark:bg-green-950",
      content: () => {
        if (!chat.superlatives || chat.superlatives.status !== 'completed') {
          return <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Analysis pending...</p>
          </div>;
        }

        const topAward = chat.superlatives.results.awards[0];
        return (
          <div className="h-full flex flex-col justify-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">🏆 Award of the Chat</p>
                <p className="text-xl font-medium leading-tight">{topAward.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Awarded to</p>
                <p className="text-lg font-medium">{topAward.recipient}</p>
              </div>
            </div>
          </div>
        );
      }
    },
  ];

  const nextCard = () => setActiveCard((prev) => (prev + 1) % cards.length);
  const prevCard = () => setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);

  useEffect(() => {
    const timer = setInterval(nextCard, 5000);
    return () => clearInterval(timer);
  }, []);

  const parseConversationType = (conversationType: string) => {
    return conversationType.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  return (
    <div className="w-full max-w-md dark:text-white">
      <div className="relative rounded-xl border bg-card p-6 shadow-sm">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 hover:bg-destructive/10"
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
              <Button variant="ghost">Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => onDelete?.(chat.id!)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">{parseConversationType(chat.conversationType ?? "")}</h2>
              <p className="text-sm text-muted-foreground dark:text-white">{chat.platform}</p>
            </div>
            
            <div className="flex -space-x-2">
              {chat.members.slice(0, 3).map((member, i) => (
                <div 
                  key={member}
                  className="h-8 w-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                  style={{ zIndex: 3 - i }}
                >
                  <span className="text-xs font-medium">{member[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeCard * 100}%)` }}
            >
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  className="w-full flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-2">
                    <div className={`rounded-lg ${card.bgColor} p-6`}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          {card.icon}
                          <h3 className="font-semibold">{card.title}</h3>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (chat.id) {
                              window.location.href = `/chat/${chat.id}`;
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="h-[180px]">
                        {card.content()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={prevCard}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1.5">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeCard === index ? 'w-4 bg-primary' : 'w-1.5 bg-primary/30'
                    }`}
                    onClick={() => setActiveCard(index)}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={nextCard}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};