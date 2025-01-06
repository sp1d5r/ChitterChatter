import { Identifiable } from "../services/database/DatabaseInterface";

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
}