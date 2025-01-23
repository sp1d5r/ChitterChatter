import { ChatAnalytics, MessageTimelineData, MemberStats } from "shared";

interface WhatsAppMessage {
    timestamp: Date;
    sender: string;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    messageType: MessageType;
    mediaInfo?: MediaInfo;
  }
  
  interface MediaInfo {
    type: 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'GIF';
    caption?: string;
  }
  
  enum MessageType {
    TEXT = 'text',
    MEDIA = 'media',
    SYSTEM = 'system', // Group changes, security messages etc.
  }
  
export  interface ParsedWhatsAppChat {
    messages: WhatsAppMessage[];
    uniqueSenders: Set<string>;
    metadata: ChatMetadata;
  }
  
  interface ChatMetadata {
    startDate: Date;
    endDate: Date;
    totalMessages: number;
    mediaCount: number;
    deletedMessages: number;
    editedMessages: number;
  }
  
  export class WhatsAppChatParser {
    // Updated regex to handle more message formats
    private static messageRegex = /\[(\d{2}\/\d{2}\/\d{4}),\s(\d{2}:\d{2}:\d{2})\]\s([^:]+):\s(.+)/;
    
    // Media type indicators found in the chat
    private static mediaIdentifiers = {
      image: ['‎image omitted', 'IMG-'],
      video: ['‎video omitted', 'VID-'],
      audio: ['‎audio omitted', 'PTT-'],
      document: ['document omitted', '.pdf', '.doc', '.txt'],
      sticker: ['‎sticker omitted'],
      gif: ['‎GIF omitted']
    };
  
    static validateFormat(text: string): boolean {
      const lines = text.split('\n');
      const sampleSize = Math.min(10, lines.length);
      let validLines = 0;
      
      for (let i = 0; i < sampleSize; i++) {
        if (this.messageRegex.test(lines[i].trim())) {
          validLines++;
        }
      }
      
      return (validLines / sampleSize) >= 0.4; // Lowered threshold as some lines might be continuations
    }
  
    private static determineMessageType(content: string): {type: MessageType, mediaInfo?: MediaInfo} {
      // Check for system messages
      if (content.includes('changed the group') || 
          content.includes('added') || 
          content.includes('removed') ||
          content.includes('left') ||
          content.includes('created group')) {
        return {type: MessageType.SYSTEM};
      }
  
      // Check for media messages
      for (const [mediaType, identifiers] of Object.entries(this.mediaIdentifiers)) {
        if (identifiers.some(id => content.includes(id))) {
          return {
            type: MessageType.MEDIA,
            mediaInfo: {
              type: mediaType as MediaInfo['type'],
              caption: content.replace(/‎.*omitted/, '').trim()
            }
          };
        }
      }
  
      return {type: MessageType.TEXT};
    }
  
    static parse(text: string): ParsedWhatsAppChat {
      const messages: WhatsAppMessage[] = [];
      const uniqueSenders = new Set<string>();
      let mediaCount = 0;
      let deletedMessages = 0;
      let editedMessages = 0;
      let startDate: Date | null = null;
      let endDate: Date | null = null;
  
      // Split by message timestamp pattern instead of newlines
      const chunks = text.split(/(?=\[\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}:\d{2}\])/);
  
      
      for (const chunk of chunks) {
        const trimmedChunk = chunk.trim();
        if (!trimmedChunk) continue;
    
        const match = trimmedChunk.match(this.messageRegex);
        if (match) {
          const [_, date, time, sender, content] = match;
          
          // Parse timestamp
          const [day, month, year] = date.split('/');
          const [hour, minute, second] = time.split(':');
          const timestamp = new Date(
            parseInt(year, 10),
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            parseInt(hour, 10),
            parseInt(minute, 10),
            parseInt(second, 10)
          );
  
          // Track chat date range
          if (!startDate || timestamp < startDate) startDate = timestamp;
          if (!endDate || timestamp > endDate) endDate = timestamp;
  
          // Check message properties
          const isEdited = content.includes('‎<This message was edited>');
          const isDeleted = content.includes('This message was deleted');
          const {type: messageType, mediaInfo} = this.determineMessageType(content);
  
          // Update counters
          if (isEdited) editedMessages++;
          if (isDeleted) deletedMessages++;
          if (messageType === MessageType.MEDIA) mediaCount++;
  
          // Clean content
          let cleanContent = content
            .replace('‎<This message was edited>', '')
            .trim();
  
  
          messages.push({
            timestamp,
            sender: sender.trim(),
            content: cleanContent,
            isEdited,
            isDeleted,
            messageType,
            ...(mediaInfo && {mediaInfo})
          });
  
          uniqueSenders.add(sender.trim());
        }
      }
  
      return {
        messages,
        uniqueSenders,
        metadata: {
          startDate: startDate!,
          endDate: endDate!,
          totalMessages: messages.length,
          mediaCount,
          deletedMessages,
          editedMessages
        }
      };
    }
  
    static generateFilteredChatFile(
      parsedChat: ParsedWhatsAppChat,
      selectedMembers: string[],
      messageRange: [number, number],
      context: string
    ): File {
      const [startIdx, endIdx] = messageRange;
      const selectedMessages = parsedChat.messages
        .slice(startIdx, endIdx)
        .filter(msg => selectedMembers.includes(msg.sender));
  
      // Format messages in a clean, LLM-friendly format
      const formattedChat = selectedMessages.map(msg => {
        const date = msg.timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const time = msg.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
  
        let content = msg.content;
        if (msg.isEdited) {
          content += ' (edited)';
        }
        if (msg.isDeleted) {
          content = '<message was deleted>';
        }
        if (msg.messageType === MessageType.MEDIA) {
          content = `<shared ${msg.mediaInfo?.type}>${msg.mediaInfo?.caption ? ` with caption: ${msg.mediaInfo.caption}` : ''}`;
        }
  
        return `[${date}, ${time}] ${msg.sender}: ${content}`;
      }).join('\n');
  
      // Add metadata header for context
      const metadata = [
        '=== Chat Analysis Metadata ===',
        `Total Messages Selected: ${selectedMessages.length}`,
        `Date Range: ${selectedMessages[0].timestamp.toLocaleDateString()} to ${selectedMessages[selectedMessages.length - 1].timestamp.toLocaleDateString()}`,
        `Selected Members: ${selectedMembers.join(', ')}`,
        '\n=== Chat Context ===',
        context,
        '===========================\n\n'
      ].join('\n');
  
      const finalContent = metadata + formattedChat;
      
      // Create the file
      return new File(
        [finalContent], 
        'filtered_chat.txt', 
        { type: 'text/plain' }
      );
    }
  }

  export class ChatAnalyticsService {
    private static readonly WORDS_TO_IGNORE = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
    ]);
  
    private static readonly LAUGH_EMOJIS = new Set([
      '😂', '🤣', '😅', '😆', '😄', '😃', '😀', 'haha', 'hehe', 'lol', 'lmao'
    ]);
  
    private static readonly READING_SPEED_WPM = 200;
    private static readonly TYPING_SPEED_WPM = 40;
  
    private static getTopItems<T extends 'emoji' | 'word'>(
      counts: Record<string, number>,
      limit: number,
      type: T
    ): Array<{ [K in T]: string } & { count: number }> {
      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([item, count]) => ({ [type]: item, count } as any));
    }
  
    static analyzeChat(messages: WhatsAppMessage[]): ChatAnalytics {
      const memberStats: Record<string, MemberStats> = {};
      const emojiCounts: Record<string, number> = {};
      const wordCounts: Record<string, number> = {};
      const memberEmojiCounts: Record<string, Record<string, number>> = {};
      const memberWordCounts: Record<string, Record<string, number>> = {};
      const timeline: MessageTimelineData = {
        hourly: Object.fromEntries([...Array(24)].map((_, i) => [i, 0])),
        daily: {
          'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
          'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0
        }
      };
  
      let totalLaughs = 0;
  
      // Initialize member stats and count maps
      const uniqueMembers = new Set(messages.map(m => m.sender));
      uniqueMembers.forEach(member => {
        memberStats[member] = {
          messageCount: 0,
          topEmojis: [],
          averageMessageLength: 0,
          estimatedTimeSpent: 0,
          topWords: []
        };
        memberEmojiCounts[member] = {};
        memberWordCounts[member] = {};
      });
  
      // Process messages
      messages.forEach(msg => {
        const hour = msg.timestamp.getHours();
        const day = msg.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
        timeline.hourly[hour]++;
        timeline.daily[day]++;
  
        // Member specific stats
        const memberStat = memberStats[msg.sender];
        memberStat.messageCount++;
  
        if (msg.content) {
          // Extract and count emojis
          const emojis = this.extractEmojis(msg.content);
          emojis.forEach(emoji => {
            emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
            memberEmojiCounts[msg.sender][emoji] = (memberEmojiCounts[msg.sender][emoji] || 0) + 1;
            if (this.LAUGH_EMOJIS.has(emoji)) totalLaughs++;
          });
  
          // Extract and count words
          const words = this.extractWords(msg.content);
          words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
            memberWordCounts[msg.sender][word] = (memberWordCounts[msg.sender][word] || 0) + 1;
          });
  
          // Calculate time spent
          const timeSpent = this.calculateTimeSpent(msg.content);
          memberStat.estimatedTimeSpent += timeSpent;
          memberStat.averageMessageLength += msg.content.length;
        }
      });
  
      // Finalize member stats
      Object.entries(memberStats).forEach(([member, stats]) => {
        if (stats.messageCount > 0) {
          stats.averageMessageLength = Math.round(stats.averageMessageLength / stats.messageCount);
          stats.estimatedTimeSpent = Math.round(stats.estimatedTimeSpent);
          stats.topEmojis = this.getTopItems(memberEmojiCounts[member], 5, 'emoji');
          stats.topWords = this.getTopItems(memberWordCounts[member], 5, 'word');
        }
      });
  
      return {
        groupStats: {
          totalMessages: messages.length,
          topEmojis: this.getTopItems(emojiCounts, 10, 'emoji'),
          laughCount: totalLaughs,
          topWords: this.getTopItems(wordCounts, 10, 'word'),
          timeline
        },
        memberStats
      };
    }
  
    private static extractEmojis(text: string): string[] {
      // Updated emoji regex to better match actual emojis
      const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
      return Array.from(text.match(emojiRegex) || []);
    }
  
    private static extractWords(text: string): string[] {
      return text.toLowerCase()
        .replace(/[^\w\s]/gi, ' ') // Replace punctuation with spaces
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !this.WORDS_TO_IGNORE.has(word) &&
          !/^\d+$/.test(word) // Ignore numbers
        );
    }
  
    private static calculateTimeSpent(message: string): number {
      const wordCount = message.split(/\s+/).length;
      const readingTime = wordCount / this.READING_SPEED_WPM;
      const typingTime = wordCount / this.TYPING_SPEED_WPM;
      return readingTime + typingTime;
    }
  }