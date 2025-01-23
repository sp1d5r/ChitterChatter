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