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
            const [memberAnalysis, superlatives, groupVibe, memorableMoments] = await Promise.all([
                this.analyzeMemberBehaviors(trimmedContent, chatData.members),
                this.analyzeSuperlatives(trimmedContent, chatData.members),
                this.analyzeGroupVibe(trimmedContent),
                this.analyzeMemorableMoments(trimmedContent)
            ]);

            const analysis = {
                memberAnalysis,
                superlatives,
                groupVibe,
                memorableMoments
            };

            await this.storeAnalysisResults(userId, chatId, analysis);
        } catch (error) {
            await this.handleAnalysisError(userId, chatId, error);
        }
    }

    private async analyzeSuperlatives(content: string, members: string[]) {
        const systemPrompt = `
            You're a chat group's personal awards show host! Your job is to hand out funny, 
            creative superlative awards to chat members. Think yearbook superlatives meets 
            comedy awards show.

            Examples of awards:
            - "Master of Derailing Conversations in the Best Way"
            - "Honorary Professor of GIF Responses"
            - "Champion of Reviving Dead Chats at 3 AM"
            - "Most Likely to Turn Any Discussion into a Food Debate"
            
            For each award:
            - Be specific and reference actual chat patterns
            - Include a funny reason why they won
            - Keep it light and playful
            - Focus on unique behaviors and running jokes

            Return only the JSON, no additional text.
        `;

        return await this.claudeService.query(
            [{ role: "user", content: [{ type: "text", text: content }] }],
            ChatSuperlativesSchema,
            systemPrompt
        );
    }

    private async analyzeGroupVibe(content: string) {
        const systemPrompt = `
            You're a chat group personality analyst with a sense of humor! Analyze this group's 
            collective vibe and quirks. Don't focus on numbers or statistics - instead, capture 
            the essence of how this group interacts.

            Look for:
            - The group's "personality type" (be creative and funny)
            - Weird traditions that have formed
            - Collective quirks and habits
            - Inside jokes and references
            - How chaos manifests in this group

            Keep it light, fun, and focused on the unique dynamics that make this group special.
            Return only the JSON, no additional text.
        `;

        return await this.claudeService.query(
            [{ role: "user", content: [{ type: "text", text: content }] }],
            GroupVibeSchema,
            systemPrompt
        );
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

    private async analyzeMemberBehaviors(content: string, members: string[]) {
        const systemPrompt = `
            You're a comedy-focused chat analyst looking for the funny quirks and patterns 
            of each chat member! Think of yourself as a friendly roast master who points 
            out everyone's endearing quirks.

            For each member, look for:
            - Hilarious "red flags" like:
              * Uses way too many emojis in a row 😂🤣😂🤣😂
              * Sends voice messages at 3 AM
              * Responds to serious questions with memes
              * Types everything in ALL CAPS
            
            - Funny patterns like:
              * Always manages to relate any topic back to their pet
              * Has a catchphrase they overuse
              * Sends the same reaction GIF to everything
              * Takes 5 business days to respond, then sends 20 messages in a row

            - Memorable quirks like:
              * Never uses punctuation but somehow uses perfect grammar
              * Autocorrect always changes the same word and they never fix it
              * Types "haha" with a different number of "ha"s each time

            Keep it light and playful! We're celebrating the weird and wonderful things 
            that make each person unique in the chat.

            Return only the JSON, no additional text.
        `;

        return await this.claudeService.query(
            [{ role: "user", content: [{ type: "text", text: content }] }],
            z.array(MemberAnalysisSchema),
            systemPrompt
        );
    }

    private async storeAnalysisResults(
        userId: string, 
        chatId: string, 
        analysis: z.infer<typeof CompleteChatAnalysisSchema>
    ) {
        try {
            await FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations/${chatId}`,
                {
                    analysis,
                    status: 'completed',
                    updatedAt: new Date()
                }
            );
        } catch (error) {
            console.error('Failed to store analysis results:', error);
            throw error;
        }
    }

    private async handleAnalysisError(userId: string, chatId: string, error: any) {
        console.error('Analysis failed:', error);
        
        try {
            await FirebaseDatabaseService.updateDocument(
                `chats/${userId}/conversations/${chatId}`,
                {
                    status: 'failed',
                    error: error.message,
                    updatedAt: new Date()
                }
            );
        } catch (storeError) {
            console.error('Failed to store error state:', storeError);
        }
        
        throw error;
    }
}
