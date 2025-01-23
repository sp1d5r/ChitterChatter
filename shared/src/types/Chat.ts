import { Identifiable } from "../services/database/DatabaseInterface";
import { z } from "zod";

// Individual analysis types
interface MemberAnalysis {
  memberId: string;
  redFlagScore: number;
  redFlagReasons: string[];
  toxicityScore: number;
  sentimentScore: number;
  topicAnalysis: Array<{
    topic: string;
    frequency: number;
  }>;
  quirks: string[];
  funnyScore: number;
  funnyMoments: string[];
  cringeScore: number;
  cringeMoments: string[];
}

interface ChatSuperlatives {
  awards: Array<{
    title: string;
    recipient: string;
    reason: string;
  }>;
}

interface GroupVibe {
  chaosLevel: {
    rating: number;
    description: string;
  };
  personalityType: string;
  groupTraditions: string[];
  collectiveQuirks: string[];
}

interface MemorableMoments {
  epicDiscussions: Array<{
    topic: string;
    highlight: string;
  }>;
  runningJokes: Array<{
    joke: string;
    context: string;
  }>;
  legendaryMisunderstandings: string[];
}

interface AnalysisResult<T> {
  results: T;
  analyzedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface MessageTimelineData {
  hourly: Record<number, number>;  // 0-23 hours
  daily: Record<string, number>;   // Mon-Sun
}

export interface MemberStats {
  messageCount: number;
  topEmojis: Array<{ emoji: string; count: number }>;
  averageMessageLength: number;
  estimatedTimeSpent: number; // in minutes
  topWords: Array<{ word: string; count: number }>;
}

export interface GroupStats {
  totalMessages: number;
  topEmojis: Array<{ emoji: string; count: number }>;
  laughCount: number;
  topWords: Array<{ word: string; count: number }>;
  timeline: MessageTimelineData;
}

export interface ChatAnalytics {
  groupStats: GroupStats;
  memberStats: Record<string, MemberStats>;
}

export interface ChatData extends Identifiable {
  platform: string | null;
  conversationType: string | null;
  chatFile: File | null;
  members: string[];
  contentPreview?: string;
  messageCount?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt?: Date;
  
  // Analysis results
  analysis?: AnalysisResult<MemberAnalysis[]>;
  superlatives?: AnalysisResult<ChatSuperlatives>;
  groupVibe?: AnalysisResult<GroupVibe>;
  memorableMoments?: AnalysisResult<MemorableMoments>;
  analytics?: ChatAnalytics;
}

// Update the ProcessedChatData type to include analytics
export type ProcessedChatData = Omit<ChatData, 'chatFile'> & {
    chatContent: string;
    analytics?: ChatAnalytics; // Make analytics optional
};

// Add validation schema for analytics
export const ChatAnalyticsSchema = z.object({
    groupStats: z.object({
        totalMessages: z.number(),
        topEmojis: z.array(z.object({
            emoji: z.string(),
            count: z.number()
        })),
        laughCount: z.number(),
        topWords: z.array(z.object({
            word: z.string(),
            count: z.number()
        })),
        timeline: z.object({
            hourly: z.record(z.string(), z.number()),
            daily: z.record(z.string(), z.number())
        })
    }),
    memberStats: z.record(z.string(), z.object({
        messageCount: z.number(),
        topEmojis: z.array(z.object({
            emoji: z.string(),
            count: z.number()
        })),
        averageMessageLength: z.number(),
        estimatedTimeSpent: z.number(),
        topWords: z.array(z.object({
            word: z.string(),
            count: z.number()
        }))
    }))
});