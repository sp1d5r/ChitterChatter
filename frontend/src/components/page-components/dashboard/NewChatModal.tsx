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
import { Plus, Check, Upload, Users, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ChatData } from "shared";
import { WhatsAppChatParser, ParsedWhatsAppChat, ChatAnalyticsService } from "../../../utils/chat-parsers/WhatsAppChatParser";
import { Slider } from "../../shadcn/slider";
import { format } from "date-fns";
import JSZip from 'jszip';

interface Steps {
    title: string;
    subtitle: string;
    completed: boolean;
}

interface AnimationState {
  isProcessing: boolean;
  currentAnimationStep: number;
}

export interface NewChatModalProps {
    onFinish: (chatData: ChatData) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onFinish }) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [chatData, setChatData] = useState<ChatData>({
    platform: null,
    conversationType: null,
    chatFile: null,
    members: []
  });
  const [animationState, setAnimationState] = useState<AnimationState>({
    isProcessing: false,
    currentAnimationStep: 0,
  });
  const [detectedNames, setDetectedNames] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [parsedChat, setParsedChat] = useState<ParsedWhatsAppChat | null>(null);
  const [messageRange, setMessageRange] = useState<[number, number]>([0, 2000]);
  const [chatContext, setChatContext] = useState<string>('');
  
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
        title: "Select Members",
        subtitle: "Select members to analyze",
        completed: chatData.members.length > 0
    },
    {
        title: "Add Context",
        subtitle: "Help us understand your chat better",
        completed: !!chatContext
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

  const handleFileUpload = async (file: File) => {
    setError(null);
    
    let textContent: string;
    
    try {
      if (file.name.endsWith('.zip')) {
        const zip = new JSZip();
        const zipContents = await zip.loadAsync(file);
        
        // Find the first .txt file in the ZIP
        const txtFile = Object.values(zipContents.files).find(f => 
          f.name.endsWith('.txt') && !f.dir
        );
        
        if (!txtFile) {
          setError('No text file found in the ZIP archive.');
          return;
        }
        
        textContent = await txtFile.async('string');
      } else if (file.name.endsWith('.txt')) {
        textContent = await file.text();
      } else {
        setError('Please upload a .txt file or a ZIP archive containing a chat export.');
        return;
      }
      
      if (chatData.platform === 'whatsapp' && !WhatsAppChatParser.validateFormat(textContent)) {
        setError('Invalid WhatsApp chat format. Please ensure you\'ve exported the chat correctly from WhatsApp.');
        return;
      }
      
      setFilePreview(textContent);
      
      if (chatData.platform === 'whatsapp') {
        const parsed = WhatsAppChatParser.parse(textContent);
        setParsedChat(parsed);
        setDetectedNames(Array.from(parsed.uniqueSenders));
        const totalMessages = parsed.messages.length;
        setMessageRange([Math.max(0, totalMessages - 2000), totalMessages]);
      }
      
      // Create a new File object with the extracted text content
      const newFile = new File([textContent], file.name.endsWith('.zip') ? '_chat.txt' : file.name, {
        type: 'text/plain'
      });
      
      setChatData(prev => ({ ...prev, chatFile: newFile }));
      handleNext();
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Error processing file. Please try again.');
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitAnimation = async () => {
    if (!parsedChat) return;

    // Generate analytics before creating the file
    const analytics = ChatAnalyticsService.analyzeChat(
      parsedChat.messages.slice(messageRange[0], messageRange[1])
        .filter(msg => chatData.members.includes(msg.sender))
    );

    // Generate filtered chat file with context
    const filteredChatFile = WhatsAppChatParser.generateFilteredChatFile(
      parsedChat,
      chatData.members,
      messageRange,
      chatContext
    );

    const finalChatData = {
      ...chatData,
      chatFile: filteredChatFile,
      messageRange,
      context: chatContext,
      analytics // Include the pre-computed analytics
    };
    
    setAnimationState({ isProcessing: true, currentAnimationStep: 0 });
    const processingPromise = onFinish(finalChatData);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnimationState(prev => ({ ...prev, currentAnimationStep: 1 }));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnimationState(prev => ({ ...prev, currentAnimationStep: 2 }));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnimationState(prev => ({ ...prev, currentAnimationStep: 3 }));
    
    await Promise.all([
      processingPromise,
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
    
    setOpen(false);
    resetModalState();
    setAnimationState({ isProcessing: false, currentAnimationStep: 0 });
  };

  const resetModalState = () => {
    setCurrentStep(0);
    setChatData({
      platform: null,
      conversationType: null,
      chatFile: null,
      members: []
    });
    setChatContext('');
    setAnimationState({
      isProcessing: false,
      currentAnimationStep: 0,
    });
  };

  const getHighlightedText = (text: string) => {
    if (!text || !chatData.members.length) return text;
    
    let highlightedText = text;
    chatData.members.forEach(member => {
      const originalName = detectedNames.includes(member) ? member : member;
      const regex = new RegExp(`\\[\\d{2}/\\d{2}/\\d{2},\\s\\d{2}:\\d{2}:\\d{2}\\]\\s${originalName}:`, 'g');
      highlightedText = highlightedText.replace(regex, match => 
        `<span class="bg-primary/20">${match}</span>`
      );
    });
    
    return highlightedText;
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetModalState();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button 
          className="h-auto w-full justify-start text-left max-w-[350px]"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center">
            <div className="mr-3 text-2xl"><Plus /></div>
            <div>
              <div className="font-bold">Create New Conversation</div>
              <div className="text-sm text-secondary dark:text-white/70">Analyse a new conversation.</div>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="!sm:max-w-[95vw] md:max-w-[90%] lg:max-w-[80%] h-[90vh] dark:text-white flex flex-col md:flex-row p-0 overflow-hidden border-0">
        <motion.div 
          className={`${
            animationState.isProcessing ? 'w-full' : 'w-full md:w-[250px]'
          } bg-gradient-to-b from-primary to-accent p-4 flex flex-col gap-4 py-6 relative`}
          animate={{ width: animationState.isProcessing ? '100%' : 'auto' }}
          transition={{ duration: 0.5 }}
        >
          {!animationState.isProcessing && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                    <p className="text-xl md:text-2xl font-bold text-black dark:text-white">Steps</p>
                    <p className="text-sm text-muted-foreground dark:text-white/70">Follow the steps to create a new analysis.</p>
                </div>
              </div>
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-row gap-2 items-center text-black min-w-fit">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-black flex items-center justify-center dark:text-white dark:border-white">
                      {index < currentStep ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="w-3 h-3 md:w-4 md:h-4" />
                        </motion.div>
                      ) : (
                        <p className="hidden md:block text-sm md:text-base font-bold text-black dark:text-white">{index + 1}</p>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="hidden md:block text-sm md:text-base font-bold text-black dark:text-white">{step.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {animationState.isProcessing && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              
              <motion.div className="text-center w-full relative h-[100px]">
                {[
                  `Selected ${chatData.platform} as your platform`,
                  `Picked ${chatData.conversationType} conversation type`,
                  `Added ${chatData.members.length} members to analyze`,
                  "Securely processing your chat, sit tight while we work our magic"
                ].map((text, index) => (
                  <motion.p
                    key={index}
                    className="absolute left-0 right-0 text-xl font-bold text-black px-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: animationState.currentAnimationStep === index ? 1 : 0,
                      y: animationState.currentAnimationStep === index ? 0 : 
                         animationState.currentAnimationStep > index ? -10 : 10
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {text}
                  </motion.p>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {!animationState.isProcessing && (
          <motion.div 
            className="flex-1 h-full p-4 py-6 flex flex-col gap-2 overflow-y-auto"
            exit={{ opacity: 0 }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold text-black dark:text-white">
                {steps[currentStep].title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground dark:text-white/70">
                {steps[currentStep].subtitle}
              </DialogDescription>
            </DialogHeader>
          
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-4 py-4 flex-1 overflow-y-auto"
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
                    disabled
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Facebook Messenger</span>
                      <span className="text-sm text-muted-foreground">Connect your Messenger account</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={chatData.platform === 'discord' ? 'default' : 'outline'}
                    className="h-auto p-4 justify-start"
                    disabled
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
                      <span className="text-sm text-muted-foreground dark:text-white/70">Analyze conversations with your partner</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={chatData.conversationType === 'friends' ? 'default' : 'outline'}
                    className="h-auto p-4 justify-start"
                    onClick={() => handleTypeSelect('friends')}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Friends</span>
                      <span className="text-sm text-muted-foreground dark:text-white/70">Analyze group or individual chats with friends</span>
                    </div>
                  </Button>

                  <Button 
                    variant={chatData.conversationType === 'family' ? 'default' : 'outline'}
                    className="h-auto p-4 justify-start"
                    onClick={() => handleTypeSelect('family')}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Family</span>
                      <span className="text-sm text-muted-foreground dark:text-white/70">Analyze group or individual chats with family members</span>
                    </div>
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 dark:text-white text-center cursor-pointer transition-colors ${
                      error ? 'border-red-500' : 'hover:border-primary'
                    }`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      handleFileUpload(file);
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.txt,.zip';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleFileUpload(file);
                      };
                      input.click();
                    }}
                  >
                    <Upload className={`mx-auto h-12 w-12 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                    <p className="mt-2 text-black dark:text-white">
                      {chatData.chatFile ? 
                        chatData.chatFile.name : 
                        'Drag and drop your chat export here or click to browse'
                      }
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground dark:text-white/70">
                      Supports .txt files or .zip archives containing chat exports
                    </p>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                      <X className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {chatData.platform === 'whatsapp' && (
                    <div className="text-sm text-muted-foreground dark:text-white/70 mt-2">
                      <p className="font-medium text-black dark:text-white ">How to export your WhatsApp chat:</p>
                      <ol className="list-decimal list-inside mt-1 space-y-1 dark:text-white">
                        <li>Open the chat in WhatsApp</li>
                        <li>Tap the three dots menu (⋮)</li>
                        <li>Select 'More' → 'Export chat'</li>
                        <li>Choose 'Without media'</li>
                        <li>Save the exported .txt file</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <Users className="h-6 w-6" />
                    <p className="text-lg font-medium text-black dark:text-white">Select Members</p>
                    <p className="text-sm text-muted-foreground dark:text-white/70 w-full mt-2">
                      Select the members you want to analyze from the detected names in your chat. These are the exact names as they appear in your messages.
                    </p>
                  </div>

                  {parsedChat && parsedChat.messages.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-black dark:text-white mb-2">Message Range Selection</p>
                      <div className="space-y-4">
                        <div className="relative pt-6">
                          <Slider
                            defaultValue={[messageRange[0], messageRange[1]]}
                            min={0}
                            max={parsedChat.messages.length}
                            step={1}
                            minStepsBetweenThumbs={100}
                            onValueChange={(value: number[]) => setMessageRange([value[0], value[1]])}
                            className="my-4"
                            value={[messageRange[0], messageRange[1]]}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground dark:text-white/70">
                          <div>
                            <p>From: {parsedChat.messages[messageRange[0]] ? 
                              format(parsedChat.messages[messageRange[0]].timestamp, 'PPP') : 
                              'No messages'}</p>
                            <p className="text-xs text-muted-foreground dark:text-white/50">Message {messageRange[0]} of {parsedChat.messages.length}</p>
                          </div>
                          <div className="text-right">
                            <p>To: {parsedChat.messages[messageRange[1] - 1] ? 
                              format(parsedChat.messages[messageRange[1] - 1].timestamp, 'PPP') : 
                              'No messages'}</p>
                            <p className="text-xs text-muted-foreground dark:text-white/50">Message {messageRange[1]} of {parsedChat.messages.length}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-white/70">
                          Selected {messageRange[1] - messageRange[0]} messages for analysis
                        </p>
                      </div>
                    </div>
                  )}

                  {detectedNames.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium text-black dark:text-white">Detected Names</p>
                        <p className="text-sm text-muted-foreground dark:text-white/70">
                          Click on the names to select or deselect them for analysis. Names are shown exactly as they appear in your chat.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(detectedNames).map((name) => (
                          <Button
                            key={name}
                            variant={chatData.members.includes(name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setChatData(prev => ({
                                ...prev,
                                members: prev.members.includes(name)
                                  ? prev.members.filter(m => m !== name)
                                  : [...prev.members, name]
                              }));
                            }}
                            className="flex items-center gap-2"
                          >
                            {name}
                            {chatData.members.includes(name) && (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/70 mt-4">
                        <p>Selected {chatData.members.length} of {detectedNames.length} members</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground dark:text-white/70">
                      No names detected in the chat. Please ensure your chat file contains messages.
                    </div>
                  )}
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <div className="text-2xl">💭</div>
                    <p className="text-lg font-medium">Add Context</p>
                    <p className="text-sm text-muted-foreground dark:text-white/70 w-full mt-2">
                      Help us understand your chat better by providing some context. This could include:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground dark:text-white/70 ml-4 space-y-1">
                      <li>How do you know these people?</li>
                      <li>What brings you together? (e.g., college friends, work team, family group)</li>
                      <li>Any significant events or inside jokes we should know about?</li>
                      <li>What kind of analysis are you most interested in?</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      className="w-full h-32 p-3 rounded-md border-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about this chat and what you'd like to learn from it..."
                      value={chatContext}
                      onChange={(e) => setChatContext(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground dark:text-white/70">
                      This context helps our AI better understand the dynamics and relationships in your chat.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="flex flex-row gap-2 mt-auto pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button 
                className="ml-auto"
                onClick={() => {
                  if (currentStep === steps.length - 1) {
                    handleSubmitAnimation();
                  } else {
                    handleNext();
                  }
                }}
                disabled={
                  (currentStep === 0 && !chatData.platform) ||
                  (currentStep === 1 && !chatData.conversationType) ||
                  (currentStep === 2 && !chatData.chatFile)
                }
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};