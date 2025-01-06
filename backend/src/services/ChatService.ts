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

// Individual member analysis (existing)
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
  cringeScore: z.number().min(0).max(10),
  cringeMoments: z.array(z.string()),
});

// New fun, qualitative schemas
const ChatSuperlativesSchema = z.object({
    awards: z.array(z.object({
        title: z.string(),
        recipient: z.string(),
        reason: z.string(),
    })),
    // Example: { title: "Chaos Agent of the Year", recipient: "Alice", reason: "Has a talent for turning any conversation about groceries into a philosophical debate about the meaning of life" }
});

const GroupVibeSchema = z.object({
    chaosLevel: z.object({
        rating: z.number().min(0).max(10),
        description: z.string(),
    }),
    personalityType: z.string(), // e.g., "Chaotic Good with a side of Meme Addiction"
    groupTraditions: z.array(z.string()), // e.g., ["Always responds to serious questions with GIFs", "Nobody acknowledges Mondays before noon"]
    collectiveQuirks: z.array(z.string()), // e.g., ["Inexplicable hatred of the 🙂 emoji", "Every conversation eventually leads to food"]
});

const MemorableGroupMomentsSchema = z.object({
    epicDiscussions: z.array(z.object({
        topic: z.string(),
        highlight: z.string(),
    })),
    runningJokes: z.array(z.object({
        joke: z.string(),
        context: z.string(),
    })),
    legendaryMisunderstandings: z.array(z.string()),
});

// Combined analysis type
const CompleteChatAnalysisSchema = z.object({
    memberAnalysis: z.array(MemberAnalysisSchema),
    superlatives: ChatSuperlativesSchema,
    groupVibe: GroupVibeSchema,
    memorableMoments: MemorableGroupMomentsSchema,
});

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
        try {
            const trimmedContent = this.trimChatContent(chatData.chatContent);
            
            // Split analysis into separate focused functions
            await Promise.all([
                this.analyzeMemberBehaviors(userId, chatId, trimmedContent, chatData.members),
                this.analyzeSuperlatives(userId, chatId, trimmedContent, chatData.members),
                this.analyzeGroupVibe(trimmedContent, userId, chatId),
                this.analyzeMemorableMoments(trimmedContent)
            ]);

        } catch (error) {
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    overallAnalysis: {
                        status: 'failed',
                        error: (error as Error).message
                    }
                },
                undefined,
                (error) => console.error('Failed to update analysis error status:', error)
            );
        }
    }

    private async analyzeSuperlatives(userId:string, chatId:string, content: string, members: string[]) {
        const systemPrompt = `
            You are a hilarious chat awards show host analyzing group conversations! Your job is to hand out creative, 
            funny superlative awards that capture the essence of each chat member's unique contributions.

            For each member, look for:
            1. Signature Moves:
               - Their go-to conversation tactics
               - Unique ways they derail discussions
               - Special powers (like summoning the group at 3 AM)

            2. Notable Achievements:
               - Most memorable chat contributions
               - Accidental traditions they've started
               - Special skills (like expert GIF timing)

            3. Award Categories to Consider:
               - "Master of [Specific Chat Behavior]"
               - "Honorary Professor of [Recurring Topic]"
               - "Champion of [Unique Group Role]"
               - "Most Likely to [Characteristic Behavior]"

            Make each award:
            - Specific to observed behavior
            - Genuinely funny and playful
            - Reference actual chat patterns
            - Include a humorous explanation

            You MUST return your analysis in this EXACT JSON format (no additional text):
            {
                "awards": [
                    {
                        "title": "string",
                        "recipient": "string",
                        "reason": "string"
                    }
                ]
            }`;

        try {
            const analysis = await this.claudeService.query(
                [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: `${content} \n\n Please analyze this chat history between ${members.join(', ')} and create amusing superlative awards. Return results in this exact JSON format:
                        {
                            "awards": [
                                {
                                    "title": "string",
                                    "recipient": "string",
                                    "reason": "string"
                                }
                            ]
                        }
                        Return only the JSON object itself, as this will be used for further parsing.`
                    }]
                }],
                ChatSuperlativesSchema,
                systemPrompt
            );

            // Update the chat metadata with superlatives results
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    superlatives: {
                        results: analysis,
                        analyzedAt: new Date(),
                        status: 'completed'
                    }
                },
                () => {
                    console.log('Superlatives analysis stored successfully');
                },
                (error) => {
                    console.error('Failed to store superlatives analysis:', error);
                }
            );

            return analysis;

        } catch (error) {
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    superlatives: {
                        status: 'failed',
                        error: (error as Error).message
                    }
                },
                undefined,
                (error) => console.error('Failed to update superlatives error status:', error)
            );
            throw error;
        }
    }

    private async analyzeGroupVibe(content: string, userId: string, chatId: string) {
        const systemPrompt = `
            You are a professional chat group anthropologist with a PhD in Vibeology! Your mission is to 
            analyze this group's collective personality and document their unique social ecosystem.

            Evaluate the following with humor and insight:

            1. Chaos Level (0-10):
               - How often do conversations go completely off the rails?
               - Does the group thrive in chaos or maintain order?
               - What kinds of chaos are most common? (Example: "3AM philosophical debates about cereal")
               - Provide a witty description of the chaos level

            2. Group Personality Type:
               - Create a creative D&D-style alignment (e.g., "Chaotic Supportive")
               - Add funny modifiers (e.g., "with a side of meme addiction")
               - Consider their collective energy (e.g., "Extremely Online Energy")
               - Make it specific to observed behavior

            3. Group Traditions:
               - Document their weird but endearing habits
               - Note any accidental rituals that have formed
               - Identify unique greeting/farewell patterns
               - Spot recurring events or themes
               - Look for unusual timing patterns

            4. Collective Quirks:
               - Group-wide obsessions
               - Shared vocabulary or inside references
               - Common derailment patterns
               - Unique reaction patterns
               - Special group superpowers

            You MUST return your analysis in this EXACT JSON format (no additional text):
            {
                "chaosLevel": {
                    "rating": number (0-10),
                    "description": "string"
                },
                "personalityType": "string",
                "groupTraditions": string[],
                "collectiveQuirks": string[]
            }`;

        try {
            const analysis = await this.claudeService.query(
                [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: `${content} \n\n Please analyze this chat history and determine the group's collective vibe. 
                        Return results in this exact JSON format:
                        {
                            "chaosLevel": {
                                "rating": number (0-10),
                                "description": "string"
                            },
                            "personalityType": "string",
                            "groupTraditions": ["tradition1", "tradition2"],
                            "collectiveQuirks": ["quirk1", "quirk2"]
                        }
                        Return only the JSON object itself, as this will be used for further parsing.`
                    }]
                }],
                GroupVibeSchema,
                systemPrompt
            );

            // Update the chat metadata with group vibe results
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    groupVibe: {
                        results: analysis,
                        analyzedAt: new Date(),
                        status: 'completed'
                    }
                },
                () => {
                    console.log('Group vibe analysis stored successfully');
                },
                (error) => {
                    console.error('Failed to store group vibe analysis:', error);
                }
            );

            return analysis;

        } catch (error) {
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    groupVibe: {
                        status: 'failed',
                        error: (error as Error).message
                    }
                },
                undefined,
                (error) => console.error('Failed to update group vibe error status:', error)
            );
            throw error;
        }
    }

    private async analyzeMemorableMoments(content: string) {
        const systemPrompt = `
            You're a chat group's historian and keeper of legendary moments! Your job is to 
            identify and document the most entertaining, memorable, or absurd moments from 
            this chat history.

            Look for:
            - Epic Discussions: Those wild conversations that started about one thing and 
              ended up somewhere completely different
            - Running Jokes: The inside jokes that keep evolving and coming back
            - Legendary Misunderstandings: Those beautiful moments where wires got crossed 
              in the most entertaining ways

            Examples:
            - Epic Discussion: "The Great Pizza Debate that somehow turned into a 3-hour 
              philosophical discussion about whether hotdogs are sandwiches"
            - Running Joke: "The time someone typo'd 'hello' as 'hewwo' and now everyone 
              talks like that when they're being dramatic"
            - Legendary Misunderstanding: "When Alice thought Bob was talking about his cat 
              for 20 messages but Bob was actually talking about his new car"

            Focus on the funny and absurd! Return only the JSON, no additional text.
        `;

        return await this.claudeService.query(
            [{ role: "user", content: [{ type: "text", text: content }] }],
            MemorableGroupMomentsSchema,
            systemPrompt
        );
    }

    private async analyzeMemberBehaviors(userId:string, chatId:string, content: string, members: string[]) {
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
        
        8. Cringe Score (0-10):
           - How cringe-worthy are they?
           - Are they the group's designated cringe master?
           - Do they always send embarrassing photos?
           - Give funny reasons for any scores (the more ridiculous the better!)
        
        9. Cringe Moments:
           - Capture their most cringe-worthy moments
           - Note any running jokes they've started
           - Record their most memorable quotes

        You MUST return your analysis in this EXACT JSON format (no additional text):
        [
            {
                "memberId": "string",
                "redFlagScore": number (0-10),
                "redFlagReasons": string[],
                "toxicityScore": number (0-10),
                "sentimentScore": number (-1 to 1),
                "topicAnalysis": [
                    {
                        "topic": "string",
                        "frequency": number
                    }
                ],
                "quirks": string[],
                "funnyScore": number (0-10),
                "funnyMoments": string[],
                "cringeScore": number (0-10),
                "cringeMoments": string[]
            }
        ]`;

        try {
            const analysis = await this.claudeService.query(
                [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: `${content} \n\n. Please perform a comprehensive analysis of this chat history between ${members.join(', ')}. You are to return  Return results in this JSON format:
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
                "quirks": string[],
                "funnyScore": number (0-10),
                "funnyMoments": string[],
                "cringeScore": number (0-10),
                "cringeMoments": string[]
                }
            ]
                  return an array of JSON objects with in the correct format and types. Just return the object itself, as this will be used for further parsing. 
            `
                    }]
                }],
                MemberAnalysisSchema,
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

}
