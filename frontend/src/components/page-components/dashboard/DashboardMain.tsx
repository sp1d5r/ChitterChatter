import React, { useEffect, useState } from 'react';
import { ChatCarousel } from './ChatCarousel';
import { NewChatModal } from './NewChatModal';
import { ChatData } from 'shared/src/types/Chat';
import { useApi } from '../../../contexts/ApiContext';
import { useAuth } from '../../../contexts/AuthenticationProvider';
import { FirebaseDatabaseService } from 'shared';
import { Plus, Search, SlidersHorizontal, Inbox } from 'lucide-react';
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../shadcn/card";

export interface DashboardMainProps {}

export const DashboardMain: React.FC<DashboardMainProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { fetchWithAuth } = useApi();
  const { authState } = useAuth();
  const [chats, setChats] = useState<ChatData[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatData[]>([]);

  useEffect(() => {
    setFilteredChats(chats.filter(chat => chat).filter(chat => {
      const matchesSearch = chat.conversationType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.members.some(member => member.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || chat.platform === selectedPlatform;
      const matchesType = selectedType === 'all' || chat.conversationType === selectedType;
      return matchesSearch && matchesPlatform && matchesType;
        }));
  }, [searchQuery, selectedPlatform, selectedType, chats]);

  useEffect(() => {
      let unsubscribe: (() => void) | undefined;

      if (authState.user?.uid) {
          // Set up real-time listener for chats
          unsubscribe = FirebaseDatabaseService.listenToQuery<ChatData>(
              `chats/${authState.user.uid}/conversations`,
              'userId', // assuming this is the field that stores the user ID
              authState.user.uid,
              { field: 'createdAt', direction: 'desc' },
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

  const handleDeleteChat = (chatId: string) => {
      FirebaseDatabaseService.deleteDocument(`chats/${authState.user?.uid}/conversations`, chatId);
  };

  const platforms = ['WhatsApp', 'Telegram', 'Discord', 'Messenger'];
  const types = ['Family', 'Friends', 'Work', 'Other'];

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4">
        {/* Header Section - Updated styling */}
        <div className="py-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl max-w-4xl relative z-20 md:text-4xl lg:text-5xl font-bold text-left font-sans tracking-tight dark:text-white">
                Your
                <div className="relative font-chivo inline-block w-max ml-2 [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
                  <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-2 from-primary to-secondary">
                    <span>Conversations</span>
                  </div>
                  <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-primary to-secondary py-2">
                    <span>Conversations</span>
                  </div>
                </div>
              </h2>
              <p className="text-lg text-muted-foreground dark:text-white">
                Analyze and explore your chat insights
              </p>
            </div>
            <div className="flex justify-start sm:justify-end">
              <NewChatModal onFinish={handleNewChat} />
            </div>
          </div>

          {/* Quick Stats - Fixed styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="ease-in-out transition-all hover:shadow-lg bg-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <span className="">📊</span>
                    Total Conversations
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chats.length}</div>
                <p className="text-xs text-secondary mt-1 dark:text-white">
                  Across all platforms
                </p>
              </CardContent>
            </Card>
            <Card className="ease-in-out transition-all hover:shadow-lg bg-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <span className="text-2xl">⚡</span>
                    Active Analyses
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chats.filter(c => c.analysis?.status === 'processing').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1 dark:text-white">
                  Currently processing
                </p>
              </CardContent>
            </Card>
            <Card className="ease-in-out transition-all hover:shadow-lg bg-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <span className="text-2xl">👥</span>
                    Total Members
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(chats.flatMap(c => c.members)).size}
                </div>
                <p className="text-xs text-muted-foreground mt-1 dark:text-white">
                  Unique participants
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters Section - Fixed styling */}
          <div className="flex flex-col md:flex-row gap-4 bg-background border-2 p-4 rounded-lg items-center">
          <SlidersHorizontal className="h-4 w-4 dark:text-white" />
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-white" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9 bg-background border-2 hover:border-primary transition-colors dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 dark:text-white">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40 bg-background border-2 hover:border-secondary transition-colors">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map(platform => (
                    <SelectItem key={platform} value={platform.toLowerCase()}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 bg-background border-2 hover:border-secondary transition-colors">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Conversations Grid - Fixed styling */}
        {filteredChats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredChats.map((chat) => (
              <div key={chat.id} className="transform transition-all hover:scale-[1.02]">
                <ChatCarousel chat={chat} onDelete={handleDeleteChat} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-background border-2 rounded-lg border-dashed border-muted-foreground/25 dark:text-white">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4 dark:text-white" />
            <h3 className="text-lg font-medium">No conversations found</h3>
            <p className="text-sm text-muted-foreground mt-1 dark:text-white">
              Try adjusting your filters or start a new analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};