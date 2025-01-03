import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "../../shadcn/dialog";
import { Button } from "../../shadcn/button";
import { Plus, Check, Upload, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../../shadcn/input";

interface Steps {
    title: string;
    subtitle: string;
    completed: boolean;
}

interface ChatData {
  platform: string | null;
  conversationType: string | null;
  chatFile: File | null;
  members: string[];
}

export const NewChatModal: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [chatData, setChatData] = useState<ChatData>({
    platform: null,
    conversationType: null,
    chatFile: null,
    members: []
  });
  const [newMember, setNewMember] = useState('');
  
  const steps: Steps[] = [
    {
        title: "Select Platform",
        subtitle: "Choose your chat platform",
        completed: !!chatData.platform
    },
    {
        title: "Conversation Type",
        subtitle: "What kind of conversation is this?",
        completed: !!chatData.conversationType
    },
    {
        title: "Upload Chat",
        subtitle: "Upload your chat export",
        completed: !!chatData.chatFile
    },
    {
        title: "Add Members",
        subtitle: "Add the members of the conversation",
        completed: chatData.members.length > 0
    }
  ];

  const handlePlatformSelect = (platform: string) => {
    setChatData(prev => ({ ...prev, platform }));
    handleNext();
  };

  const handleTypeSelect = (type: string) => {
    setChatData(prev => ({ ...prev, conversationType: type }));
    handleNext();
  };

  const handleFileUpload = (file: File) => {
    setChatData(prev => ({ ...prev, chatFile: file }));
    handleNext();
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleAddMember = () => {
    if (newMember.trim() && !chatData.members.includes(newMember.trim())) {
      setChatData(prev => ({
        ...prev,
        members: [...prev.members, newMember.trim()]
      }));
      setNewMember('');
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setChatData(prev => ({
      ...prev,
      members: prev.members.filter(member => member !== memberToRemove)
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto w-full justify-start text-left max-w-[350px]">
          <div className="flex items-center">
            <div className="mr-3 text-2xl"><Plus /></div>
            <div>
              <div className="font-bold">Create New Conversation</div>
              <div className="text-sm text-muted-foreground">Analyse a new conversation.</div>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[80%] dark:text-white flex flex-row p-0 overflow-hidden">
        {/* Left Side - Steps */}
        <div className="w-[20%] h-[80vh] bg-gradient-to-b from-primary to-accent p-4 flex flex-col gap-4 py-6">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                    <p className="text-2xl font-bold text-black">Steps</p>
                    <p className="text-sm text-muted-foreground">Follow the steps to create a new analysis.</p>
                </div>
            </div>
            {
                steps.map((step, index) => (
                    <div className="flex flex-row gap-2 items-center text-black">
                        <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center">
                            {index < currentStep ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Check className="w-4 h-4" />
                                </motion.div>
                            ) : (
                                <p className="font-bold">{index + 1}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-bold">{step.title}</p>
                        </div>
                    </div>
                ))
            }
        </div>

        {/* Right Side - Content */}
        <div className="w-[80%] h-[80vh] p-4 py-6 flex flex-col gap-2">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                    {steps[currentStep].title}
                </DialogTitle>
                <DialogDescription>
                    {steps[currentStep].subtitle}
                </DialogDescription>
            </DialogHeader>
        
            <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid gap-4 py-4"
            >
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 gap-4">
                        <Button 
                            variant={chatData.platform === 'whatsapp' ? 'default' : 'outline'}
                            className="h-auto p-4 justify-start"
                            onClick={() => handlePlatformSelect('whatsapp')}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">WhatsApp</span>
                                <span className="text-sm text-muted-foreground">Upload a WhatsApp chat export</span>
                            </div>
                        </Button>
                        
                        <Button 
                            variant={chatData.platform === 'messenger' ? 'default' : 'outline'}
                            className="h-auto p-4 justify-start"
                            onClick={() => handlePlatformSelect('messenger')}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">Facebook Messenger</span>
                                <span className="text-sm text-muted-foreground">Connect your Messenger account</span>
                            </div>
                        </Button>
                        
                        <Button 
                            variant={chatData.platform === 'discord' ? 'default' : 'outline'}
                            className="h-auto p-4 justify-start"
                            onClick={() => handlePlatformSelect('discord')}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">Discord</span>
                                <span className="text-sm text-muted-foreground">Connect your Discord server</span>
                            </div>
                        </Button>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="grid grid-cols-1 gap-4">
                        <Button 
                            variant={chatData.conversationType === 'significant_other' ? 'default' : 'outline'}
                            className="h-auto p-4 justify-start"
                            onClick={() => handleTypeSelect('significant_other')}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">Significant Other</span>
                                <span className="text-sm text-muted-foreground">Analyze conversations with your partner</span>
                            </div>
                        </Button>
                        
                        <Button 
                            variant={chatData.conversationType === 'friends' ? 'default' : 'outline'}
                            className="h-auto p-4 justify-start"
                            onClick={() => handleTypeSelect('friends')}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-semibold">Friends</span>
                                <span className="text-sm text-muted-foreground">Analyze group or individual chats with friends</span>
                            </div>
                        </Button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="flex flex-col gap-4">
                        <div 
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                handleFileUpload(file);
                            }}
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleFileUpload(file);
                                };
                                input.click();
                            }}
                        >
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2">
                                {chatData.chatFile ? 
                                    chatData.chatFile.name : 
                                    'Drag and drop your chat export here or click to browse'
                                }
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2 items-center mb-4">
                            <Users className="h-6 w-6" />
                            <p className="text-lg font-medium">Add conversation members</p>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter member name"
                                value={newMember}
                                onChange={(e) => setNewMember(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMember();
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button 
                                onClick={handleAddMember}
                                disabled={!newMember.trim()}
                            >
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            {chatData.members.map((member, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full"
                                >
                                    <span>{member}</span>
                                    <button
                                        onClick={() => handleRemoveMember(member)}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {chatData.members.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                No members added yet. Add at least one member to continue.
                            </p>
                        )}
                    </div>
                )}
            </motion.div>

            <div className="flex flex-row gap-2 flex-1" />

            <div className="flex flex-row gap-2 w-full justify-between items-center">
                <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={currentStep === 0}
                >
                    <p className="font-bold">Back</p>
                </Button>
                <Button 
                    onClick={handleNext}
                    disabled={
                        (currentStep === 0 && !chatData.platform) ||
                        (currentStep === 1 && !chatData.conversationType) ||
                        (currentStep === 2 && !chatData.chatFile)
                    }
                >
                    <p className="font-bold">
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </p>
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};