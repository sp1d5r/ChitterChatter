import { z } from "zod"; // For runtime type validation

interface ClaudeConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: Array<{
    type: "text" | "image";
    text?: string;
    source?: {
      type: "base64";
      media_type: string;
      data: string;
    };
  }>;
}

export class ClaudeService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config: ClaudeConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl || "https://api.anthropic.com/v1/messages";
    this.model = config.model || "claude-3-5-sonnet-20241022";
  }

  async query<T>(
    messages: ClaudeMessage[],
    responseSchema: z.ZodType<T>,
    systemPrompt?: string,
    maxRetries = 3
  ): Promise<T> {
    const headers = {
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    };

    const payload = {
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    };

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.content[0]?.text;
        
        // Try to parse the response as JSON if it's a JSON string
        let parsedContent: any;
        try {
          parsedContent = JSON.parse(this.cleanJsonString(content));
        } catch {
          parsedContent = content;
        }

        // Validate against the schema
        const result = responseSchema.safeParse(parsedContent);
        
        if (result.success) {
          return result.data;
        } else {
          lastError = new Error(`Validation error: ${result.error.message}`);
          continue; // Retry on validation failure
        }
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries - 1) break;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw lastError || new Error("Failed to get valid response from Claude");
  }

  private cleanJsonString(content: string): string {
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.slice(7);
    }
    if (content.endsWith("```")) {
      content = content.slice(0, -3);
    }
    return content.trim();
  }
}
