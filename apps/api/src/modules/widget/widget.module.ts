import { Module } from '@nestjs/common';
import { WidgetSecurityService } from './widget-security.service';
import { WidgetSecurityController } from './widget-security.controller';
import { ChatService } from '../chat/chat.service';
import { GeminiService } from '../../common/services/gemini.service';
import { PineconeService } from '../../common/services/pinecone.service';
import { RateLimitService } from '../../common/services/rate-limit.service';

@Module({
  controllers: [WidgetSecurityController],
  providers: [
    WidgetSecurityService,
    ChatService,
    GeminiService,
    PineconeService,
    RateLimitService,
  ],
  exports: [WidgetSecurityService],
})
export class WidgetModule {}
