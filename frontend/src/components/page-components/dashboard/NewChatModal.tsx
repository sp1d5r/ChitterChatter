import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "../../shadcn/dialog";
import { Button } from "../../shadcn/button";
import { Plus } from "lucide-react";

interface Steps {
    title: string;
    subtitle: string;
    completed: boolean;
}


export const NewChatModal: React.FC = () => {
const steps: Steps[] = [
    {
        title: "Upload Chat",
        subtitle: "Upload a WhatsApp chat export",
        completed: false
    },
    {
        title: "Select Message Type",
        subtitle: "pick a message type to analyse",
        completed: false
    },
    {
        title: "Add Members",
        subtitle: "Add the members of the conversation",
        completed: false
    }
]   


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
                            <p className="font-bold">{index + 1}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="font-bold">{step.title}</p>
                        </div>
                    </div>
                ))
            }
        </div>
        <div className="w-[80%] h-[80vh] p-4 py-6 flex flex-col gap-2">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Create New Analysis</DialogTitle>
                <DialogDescription>
                    Start analyzing a new conversation by selecting your platform and uploading your chat.
                </DialogDescription>
            </DialogHeader>
        
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">WhatsApp</span>
                        <span className="text-sm text-muted-foreground">Upload a WhatsApp chat export</span>
                    </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Facebook Messenger</span>
                        <span className="text-sm text-muted-foreground">Connect your Messenger account</span>
                    </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Discord</span>
                        <span className="text-sm text-muted-foreground">Connect your Discord server</span>
                    </div>
                    </Button>
                </div>
            </div>

            <div className="flex flex-row gap-2 flex-1" />

            <div className="flex flex-row gap-2 w-full justify-between items-center">
                <Button variant="destructive">
                    <p className="font-bold">Cancel</p>
                </Button>
                <Button>
                    <p className="font-bold">Next</p>
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};