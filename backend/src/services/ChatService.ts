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

// Split the schemas into two parts
const MemberBasicAnalysisSchema = z.object({
  memberId: z.string(),
  redFlagScore: z.number().min(0).max(10),
  redFlagReasons: z.array(z.string()),
  toxicityScore: z.number().min(0).max(10),
  sentimentScore: z.number().min(-1).max(1),
  topicAnalysis: z.array(z.object({
    topic: z.string(),
    frequency: z.number(),
  })),
});

const MemberPersonalityAnalysisSchema = z.object({
  memberId: z.string(),
  quirks: z.array(z.string()),
  funnyScore: z.number().min(0).max(10),
  funnyMoments: z.array(z.string()),
  cringeScore: z.number().min(0).max(10),
  cringeMoments: z.array(z.string()),
});

// Create array schemas for both
const MemberBasicAnalysesSchema = z.array(MemberBasicAnalysisSchema);
const MemberPersonalityAnalysesSchema = z.array(MemberPersonalityAnalysisSchema);

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
        
        // Store metadata and run analysis concurrently
        await Promise.all([
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations/`,
                chatMetadata.id,
                chatMetadata,
                ()=>{
                    console.log('Upload Success:', chatMetadata.id);
                },
                (error)=>{
                    console.log('Upload Failed:', error);
                }
            ),
            this.analyzeChatAndUpdateMetadata(userId, chatMetadata.id, chatData)
        ]);

        return chatMetadata;
    }

    private trimChatContent(content: string, maxTokens = 30000, maxLineLength = 500): string {
        // Split by message boundaries
        const messages = content.split('\r\n');
        
        // Start from the most recent messages
        let trimmedContent = '';
        let currentSize = 0;
        
        // Work backwards from the most recent messages
        for (let i = messages.length - 1; i >= 0; i--) {
            // Trim individual message if too long
            let message = messages[i];
            if (message.length > maxLineLength) {
                message = message.substring(0, maxLineLength) + '...';
            }
            
            const messageSize = message.length;
            if (currentSize + messageSize > maxTokens) {
                break;
            }
            
            currentSize += messageSize;
            trimmedContent = message + '\r\n' + trimmedContent;
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
                this.analyzeGroupVibe(userId, chatId, trimmedContent),
                this.analyzeMemorableMoments(userId, chatId, trimmedContent)
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

    private async analyzeGroupVibe(userId: string, chatId: string, content: string) {
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

    private async analyzeMemorableMoments(userId: string, chatId: string, content: string) {
        const systemPrompt = `
            You are a legendary chat historian with an eye for the most entertaining moments! Your mission is to 
            document the greatest hits, running jokes, and hilarious misunderstandings that make this group unique.

            Search for and document these key elements:

            1. Epic Discussions:
               - Wild topic derailments that were pure gold
               - Conversations that started normal but ended bizarrely
               - Late-night philosophical debates about mundane things
               - Heated discussions about trivial matters
               - Times when the group collectively went down a rabbit hole

            2. Running Jokes:
               - Inside jokes that keep evolving
               - Recurring memes or references
               - Catchphrases that stuck
               - Ongoing bits that keep getting callbacks
               - Accidental traditions that became permanent

            3. Legendary Misunderstandings:
               - Hilarious communication fails
               - Times when two people were having completely different conversations
               - Autocorrect disasters that created new meanings
               - Emoji interpretations gone wrong
               - Messages taken hilariously out of context

            Make sure each entry is:
            - Actually funny (not just "you had to be there")
            - Specific enough to be memorable
            - Captures the essence of why it was entertaining
            - References actual chat content
            - Explains any necessary context

            You MUST return your analysis in this EXACT JSON format (no additional text):
            {
                "epicDiscussions": [
                    {
                        "topic": "string",
                        "highlight": "string"
                    }
                ],
                "runningJokes": [
                    {
                        "joke": "string",
                        "context": "string"
                    }
                ],
                "legendaryMisunderstandings": string[]
            }`;

        try {
            const analysis = await this.claudeService.query(
                [{
                    role: "user",
                    content: [{
                        type: "text",
                        text: `${content} \n\n Please analyze this chat history and identify the most memorable moments. 
                        Return results in this exact JSON format:
                        {
                            "epicDiscussions": [
                                {
                                    "topic": "string",
                                    "highlight": "string"
                                }
                            ],
                            "runningJokes": [
                                {
                                    "joke": "string",
                                    "context": "string"
                                }
                            ],
                            "legendaryMisunderstandings": ["misunderstanding1", "misunderstanding2"]
                        }
                        Return only the JSON object itself, as this will be used for further parsing.`
                    }]
                }],
                MemorableGroupMomentsSchema,
                systemPrompt
            );

            // Update the chat metadata with memorable moments results
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    memorableMoments: {
                        results: analysis,
                        analyzedAt: new Date(),
                        status: 'completed'
                    }
                },
                () => {
                    console.log('Memorable moments analysis stored successfully');
                },
                (error) => {
                    console.error('Failed to store memorable moments analysis:', error);
                }
            );

            return analysis;

        } catch (error) {
            FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    memorableMoments: {
                        status: 'failed',
                        error: (error as Error).message
                    }
                },
                undefined,
                (error) => console.error('Failed to update memorable moments error status:', error)
            );
            throw error;
        }
    }

    private async analyzeMemberBehaviors(userId: string, chatId: string, content: string, members: string[]) {
        try {
            // First analysis: Basic metrics
            const basicAnalysis = await this.analyzeMemberBasicMetrics(content, members);
            
            // Second analysis: Personality traits
            const personalityAnalysis = await this.analyzeMemberPersonality(content, members);

            // Merge results for each member
            const combinedAnalysis = members.map(memberId => {
                const basic = basicAnalysis.find(b => b.memberId === memberId) || {};
                const personality = personalityAnalysis.find(p => p.memberId === memberId) || {};
                return { ...basic, ...personality };
            });

            // Update Firebase
            await FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    analysis: {
                        results: combinedAnalysis,
                        analyzedAt: new Date(),
                        status: 'completed'
                    }
                }
            );

        } catch (error) {
            await FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations`,
                chatId,
                {
                    analysis: {
                        status: 'failed',
                        error: (error as Error).message
                    }
                }
            );
        }
    }

    private async analyzeMemberBasicMetrics(content: string, members: string[]) {
        const systemPrompt = `
            You are analyzing chat participants' basic metrics. For each member, evaluate:
            
            1. Red Flag Score (0-10):
               - Look for hilarious dating red flags
               - Give funny reasons for scores
            
            2. Toxicity Score (0-10):
               - More about sass levels than actual toxicity
            
            3. Sentiment Score (-1 to 1):
               - Are they the group's optimist or resident grump?
            
            4. Topic Analysis:
               - What topics do they frequently discuss?
               - Track their recurring themes

            You MUST return your analysis in this EXACT JSON format (no additional text):
            [
                {
                    "memberId": "string",
                    "redFlagScore": number,
                    "redFlagReasons": ["reason1", "reason2"],
                    "toxicityScore": number,
                    "sentimentScore": number,
                    "topicAnalysis": [
                        {
                            "topic": "string",
                            "frequency": number
                        }
                    ]
                }
            ]`;

        return await this.claudeService.query(
            [{
                role: "user",
                content: [{
                    type: "text",
                    text: `${content}\n\nAnalyze these members: ${members.join(', ')}. Return results in this exact JSON format:
                    [
                        {
                            "memberId": "string",
                            "redFlagScore": number,
                            "redFlagReasons": ["reason1", "reason2"],
                            "toxicityScore": number,
                            "sentimentScore": number,
                            "topicAnalysis": [
                                {
                                    "topic": "string",
                                    "frequency": number
                                }
                            ]
                        }
                    ]
                    Return only the JSON array itself, as this will be used for further parsing.`
                }]
            }],
            MemberBasicAnalysesSchema,
            systemPrompt
        );
    }

    private async analyzeMemberPersonality(content: string, members: string[]) {
        const systemPrompt = `
            You are analyzing chat participants' personality traits. For each member, evaluate:
            
            1. Quirks:
               - List their funny chat habits
               - Note their unique behaviors
            
            2. Funny Score (0-10) and Moments:
               - How intentionally or unintentionally funny are they?
               - Capture their best hilarious moments
            
            3. Cringe Score (0-10) and Moments:
               - Rate and document their most cringe-worthy moments
               - Note any memorable awkward situations

            You MUST return your analysis in this EXACT JSON format (no additional text):
            [
                {
                    "memberId": "string",
                    "quirks": ["quirk1", "quirk2"],
                    "funnyScore": number,
                    "funnyMoments": ["moment1", "moment2"],
                    "cringeScore": number,
                    "cringeMoments": ["moment1", "moment2"]
                }
            ]`;

        return await this.claudeService.query(
            [{
                role: "user",
                content: [{
                    type: "text",
                    text: `${content}\n\nAnalyze these members: ${members.join(', ')}. Return results in this exact JSON format:
                    [
                        {
                            "memberId": "string",
                            "quirks": ["quirk1", "quirk2"],
                            "funnyScore": number,
                            "funnyMoments": ["moment1", "moment2"],
                            "cringeScore": number,
                            "cringeMoments": ["moment1", "moment2"]
                        }
                    ]
                    Return only the JSON array itself, as this will be used for further parsing.`
                }]
            }],
            MemberPersonalityAnalysesSchema,
            systemPrompt
        );
    }

}
