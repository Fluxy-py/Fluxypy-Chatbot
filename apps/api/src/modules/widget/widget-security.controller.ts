import {
  Controller,
  Post,
  Body,
  Headers,
  Ip,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WidgetSecurityService } from './widget-security.service';
import { ChatService } from '../chat/chat.service';
import { ChatDto } from '../chat/dto/chat.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/v1/widget')
export class WidgetSecurityController {
  private readonly logger = new Logger(WidgetSecurityController.name);

  constructor(
    private widgetSecurityService: WidgetSecurityService,
    private chatService: ChatService,
  ) {}

  /**
   * POST /api/v1/widget/init
   * Initialize widget session with API key and get session token
   * Only endpoint that accepts raw API key
   */
  @Public()
  @Post('init')
  async initWidget(
    @Body() body: { apiKey: string },
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string,
  ) {
    // 1. Validate API key is provided
    if (!body || !body.apiKey) {
      throw new BadRequestException('API key is required in request body');
    }

    // 2. Extract domain from origin or referer
    const sourceUrl = origin || referer;
    if (!sourceUrl) {
      throw new BadRequestException(
        'Origin or Referer header is required',
      );
    }

    const requestDomain = this.widgetSecurityService.extractDomain(
      sourceUrl,
    );
    this.logger.log(
      `Widget init request from domain: ${requestDomain}`,
    );

    // 3. Validate API key and create session
    const result =
      await this.widgetSecurityService.validateAndCreateSession(
        body.apiKey,
        requestDomain,
      );

    return result;
  }

  /**
   * POST /api/v1/widget/message
   * Process chat message with session token (no API key needed)
   */
  @Public()
  @Post('message')
  async chat(
    @Body() body: ChatDto & { sessionId?: string },
    @Headers('x-session-token') sessionToken?: string,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string,
    @Ip() ip?: string,
  ) {
    // 1. Validate session token
    if (!sessionToken) {
      throw new UnauthorizedException(
        'x-session-token header is required',
      );
    }

    const sourceUrl = origin || referer;
    if (!sourceUrl) {
      throw new BadRequestException(
        'Origin or Referer header is required',
      );
    }

    const requestDomain = this.widgetSecurityService.extractDomain(
      sourceUrl,
    );

    // 2. Validate session token and get session data
    let sessionData;
    try {
      sessionData = this.widgetSecurityService.validateSessionToken(
        sessionToken,
        requestDomain,
      );
    } catch (error) {
      this.logger.warn(
        `Invalid session token from ${requestDomain}: ${error.message}`,
      );
      throw error;
    }

    // 3. Process message using ChatService
    const orgId = sessionData.orgId;
    const result = await this.chatService.chat(
      orgId,
      {
        message: body.message,
        sessionId: body.sessionId,
      },
      ip,
    );

    return result;
  }

  /**
   * Health check endpoint
   */
  @Public()
  @Post('health')
  getHealth() {
    return {
      status: 'ok',
      activeSessions: this.widgetSecurityService.getActiveSessionCount(),
    };
  }
}
