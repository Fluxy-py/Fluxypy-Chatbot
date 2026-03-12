import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  GenerativeModel,
} from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private embedModel: GenerativeModel;
  private chatModel: GenerativeModel;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');

    this.genAI = new GoogleGenerativeAI(apiKey);

    // For generating embeddings (768 dimensions)
    this.embedModel = this.genAI.getGenerativeModel({
      model: 'gemini-embedding-001',
  
    });

    // For generating chat responses
    this.chatModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite', // Fast and free tier friendly
      temperature : 0.7, // More creative responses
    });
  }

  // Convert text → vector embedding (768 numbers)
  async embedText(text: string): Promise<number[]> {
    try {
      const result = await this.embedModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.logger.error('Embedding failed:', error);
      throw error;
    }
  }

  // Embed multiple texts at once (for chunked documents)
  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    // Process in batches of 5 to avoid rate limits
    for (let i = 0; i < texts.length; i += 5) {
      const batch = texts.slice(i, i + 5);
      const results = await Promise.all(
        batch.map((text) => this.embedText(text)),
      );
      embeddings.push(...results);
      // Small delay between batches
      if (i + 5 < texts.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    return embeddings;
  }

  // Generate a chat response with context
  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    context: string,
    history: { role: string; content: string }[] = [],
  ): Promise<string> {
    try {
      const fullPrompt = `${systemPrompt}

KNOWLEDGE BASE CONTEXT:
---
${context}
---

${history.length > 0 ? 'CONVERSATION HISTORY:\n' + history.map((h) => `${h.role}: ${h.content}`).join('\n') + '\n---\n' : ''}

USER QUESTION: ${userMessage}

ANSWER:`;

      const result = await this.chatModel.generateContent(fullPrompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Generation failed:', error);
      throw error;
    }
  }
}