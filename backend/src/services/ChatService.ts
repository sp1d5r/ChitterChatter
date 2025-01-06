import { ChatData, FirebaseDatabaseService, ClaudeService } from "shared";
import crypto from 'crypto';
import { z } from 'zod';

// Create a new type for processed chat data without the file
type ProcessedChatData = Omit<ChatData, 'chatFile'> & {
    chatContent: string;
};

// Type for what we actually store in Firestore
interface StoredChatMetadata {
    id: string;
    userId: string;
    platform: string;
    conversationType: string;
    members: string[];
    contentPreview: string;
    createdAt: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    messageCount?: number;
    // Add any other metadata you want to track
}

// Define detailed analysis schemas
const MemberAnalysisSchema = z.object({
  memberId: z.string(),
  redFlagScore: z.number().min(0).max(10),
  redFlagReasons: z.array(z.string()),
  toxicityScore: z.number().min(0).max(10),
  sentimentScore: z.number().min(-1).max(1),
  topicAnalysis: z.array(z.object({
    topic: z.string(),
    frequency: z.number(),
  })),
  quirks: z.array(z.string()),
  funnyScore: z.number().min(0).max(10),
  funnyMoments: z.array(z.string()),
});

const ChatAnalysisSchema = z.array(MemberAnalysisSchema);

export class ChatService {
    private claudeService: ClaudeService;

    constructor() {
        this.claudeService = new ClaudeService({
            apiKey: process.env.CLAUDE_API_KEY!,
        });
    }

    async createChat(
        userId: string, 
        chatData: ProcessedChatData
    ): Promise<StoredChatMetadata> {
        // Generate a preview of the chat content (first 100 chars)
        const contentPreview = chatData.chatContent.substring(0, 100) + '...';
        
        // Create metadata object for Firestore
        const chatMetadata: StoredChatMetadata = {
            id: crypto.randomUUID(),
            userId,
            platform: chatData.platform || 'whatsapp',
            conversationType: chatData.conversationType || 'group',
            members: chatData.members,
            contentPreview,
            createdAt: new Date(),
            status: 'pending',
            messageCount: chatData.chatContent.split('\n').length, // Rough estimate
        };
        

        // Store initial metadata
        await FirebaseDatabaseService.addDocument(
            `chats/${userId}/conversations/`,
            chatMetadata,
            (docId)=>{
                console.log('Upload Success:', docId);
                // Trigger analysis asynchronously
                this.analyzeChatAndUpdateMetadata(userId, docId, chatData)
                .catch(error => console.error('Chat analysis failed:', error));

            },
            (error)=>{
                console.log('Upload Failed:', error);
            }
        );
        return chatMetadata;
    }

    private trimChatContent(content: string, maxTokens = 30000): string {
        // Split by message boundaries (assuming they're separated by newlines)
        const messages = content.split('\r\n');
        
        // Start from the most recent messages
        let trimmedContent = '';
        let currentSize = 0;
        
        // Work backwards from the most recent messages
        for (let i = messages.length - 1; i >= 0; i--) {
            const messageSize = messages[i].length;
            if (currentSize + messageSize > maxTokens) {
                break;
            }
            currentSize += messageSize;
            trimmedContent = messages[i] + '\r\n' + trimmedContent;
        }
        
        return trimmedContent.trim();
    }

    private async analyzeChatAndUpdateMetadata(
        userId: string,
        chatId: string,
        chatData: ProcessedChatData
    ) {
        const trimmedContent = this.trimChatContent(chatData.chatContent);
        
        const systemPrompt = `
            You are a witty chat analyzer with a great sense of humor! Your job is to find the funny quirks and entertaining patterns in chat conversations. Think of yourself as a comedy detective looking for amusing behavioral patterns.
            
            For each participant, evaluate with a fun twist:
            1. Red Flag Score (0-10):
               - Look for hilarious dating red flags like "uses too many emojis 🤪"
               - Spot people who say "literally" literally too much
               - Notice if they're weirdly obsessed with their cat
               - Give funny reasons for any scores (the more ridiculous the better!)
            
            2. Toxicity Score (0-10):
               - More about sass levels than actual toxicity
               - Are they the group's designated drama queen?
               - Do they use passive-aggressive "k" responses?
            
            3. Sentiment Score (-1 to 1):
               - Are they the group's eternal optimist or resident grump?
               - Do they respond to everything with memes?
            
            4. Topic Analysis:
               - What random topics do they always circle back to?
               - Do they somehow always bring up their ex?
               - Track their weird obsessions
            
            5. Quirks:
               - List their funny chat habits
               - Do they always type in ALL CAPS?
               - Never use punctuation?
               - Send voice messages at 3 AM?
            
            6. Funny Score (0-10):
               - How intentionally (or unintentionally) funny are they?
               - Are they the group's comedian or comic relief?
            
            7. Funny Moments:
               - Capture their best unintentionally hilarious moments
               - Note any running jokes they've started
               - Record their most memorable quotes

            Remember: Keep it light and fun! We're looking for endearing quirks and amusing patterns, not serious issues.
            
            Return results in this JSON format (no additional text):
            [
                {
                    "memberId": "string",
                    "redFlagScore": number,
                    "redFlagReasons": ["uses comic sans in work emails", "thinks pineapple belongs on pizza"],
                    "toxicityScore": number,
                    "sentimentScore": number,
                    "topicAnalysis": [{"topic": "string", "frequency": number}],
                    "quirks": ["types 'hehe' after everything hehe", "sends good morning texts at midnight"],
                    "funnyScore": number,
                    "funnyMoments": ["that time they tried to explain NFTs to grandma"]
                }
            ]
        `;

        try {
            const analysis = await this.claudeService.query(
                [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: `${trimmedContent} \n\n. Please perform a comprehensive analysis of this chat history between ${chatData.members.join(', ')}. You are to return  Return results in this JSON format:
            [
                {
                    "memberId": "string",
                    "redFlagScore": number,
                    "redFlagReasons": ["reason1", "reason2"],
                    "toxicityScore": number,
                    "sentimentScore": number,
                    "topicAnalysis": [
                        {"topic": "string", "frequency": number}
                    ]
                }
            ]
                  return an array of JSON objects with in the correct format and types. Just return the object itself, as this will be used for further parsing. 
            `
                    }]
                }],
                ChatAnalysisSchema,
                systemPrompt
            );

            // Update the chat metadata with analysis results using your Firebase service
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    analysis: {
                        results: analysis,
                        analyzedAt: new Date(),
                        status: 'completed'
                    }
                },
                () => {
                    // Success callback
                    console.log('Analysis stored successfully');
                    this.handleHighRiskScores(userId, chatId, analysis);
                },
                (error) => {
                    // Error callback
                    console.error('Failed to store analysis:', error);
                }
            );

        } catch (error) {
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    analysis: {
                        status: 'failed',
                        error: (error as Error).message
                    }
                },
                undefined,
                (error) => console.error('Failed to update error status:', error)
            );
        }
    }

    private handleHighRiskScores(
        userId: string,
        chatId: string,
        analysis: z.infer<typeof ChatAnalysisSchema>
    ) {
        const highRiskMembers = analysis.filter(member => 
            member.redFlagScore > 7 || member.toxicityScore > 7
        );

        if (highRiskMembers.length > 0) {
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    highRiskAlert: {
                        members: highRiskMembers,
                        detectedAt: new Date()
                    }
                },
                () => console.log('High risk alert stored'),
                (error) => console.error('Failed to store high risk alert:', error)
            );
        }
    }
}
