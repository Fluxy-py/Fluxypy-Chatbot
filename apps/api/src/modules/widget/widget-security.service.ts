import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { URL } from 'url';

interface SessionData {
  orgId: string;
  apiKeyId: string;
  domain: string;
  expiresAt: number;
}

@Injectable()
export class WidgetSecurityService {
  private readonly logger = new Logger(WidgetSecurityService.name);
  private sessionTokens = new Map<string, SessionData>();

  constructor(private prisma: PrismaService) {
    // Clean up expired tokens every 30 minutes
    this.startTokenCleanupInterval();
  }

  /**
   * Extract domain from origin or referer header
   * Removes 'www.' prefix for consistent comparison
   */
  extractDomain(originOrReferer: string): string {
    try {
      if (!originOrReferer) {
        throw new Error('No origin/referer');
      }

      const url = new URL(originOrReferer);
      let hostname = url.hostname.toLowerCase();

      // Remove 'www.' prefix for comparison
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }

      return hostname;
    } catch (error) {
      this.logger.warn(`Failed to extract domain from: ${originOrReferer}`);
      throw new ForbiddenException('Invalid origin/referer format');
    }
  }

  /**
   * Check if request domain matches allowed domains
   * Supports wildcards: *.example.com matches sub.example.com
   */
  private isDomainAllowed(
    requestDomain: string,
    allowedDomains: string[],
  ): boolean {
    // Always allow localhost and 127.0.0.1 for development
    if (
      requestDomain === 'localhost' ||
      requestDomain === '127.0.0.1' ||
      requestDomain.startsWith('localhost:') ||
      requestDomain.startsWith('127.0.0.1:')
    ) {
      return true;
    }

    // If no allowedDomains specified, allow any domain (security handled here)
    if (!allowedDomains || allowedDomains.length === 0) {
      return true;
    }

    const cleanRequestDomain = requestDomain.startsWith('www.')
      ? requestDomain.substring(4)
      : requestDomain;

    for (const domain of allowedDomains) {
      const cleanDomain = domain.startsWith('www.')
        ? domain.substring(4)
        : domain;

      // Exact match
      if (cleanRequestDomain === cleanDomain) {
        return true;
      }

      // Wildcard match: *.example.com matches sub.example.com
      if (cleanDomain.startsWith('*.')) {
        const baseDomain = cleanDomain.substring(2);
        if (cleanRequestDomain.endsWith(baseDomain)) {
          // Ensure it's a proper subdomain match
          const prefix = cleanRequestDomain.substring(
            0,
            cleanRequestDomain.length - baseDomain.length,
          );
          if (prefix.endsWith('.') || prefix === '') {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Validate API key and create a session token
   */
  async validateAndCreateSession(
    apiKey: string,
    requestDomain: string,
  ): Promise<{ sessionToken: string; expiresIn: number; config: any }> {
    // 1. Find the organization by API key
    const org = await this.prisma.organization.findUnique({
      where: { apiKey },
      select: {
        id: true,
        status: true,
        settings: true,
      },
    });

    if (!org || org.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or inactive API key');
    }

    // 2. Check domain whitelist
    const settings = org.settings as any;
    const allowedDomains = settings?.allowedDomains || [];

    if (!this.isDomainAllowed(requestDomain, allowedDomains)) {
      this.logger.warn(
        `Domain ${requestDomain} not authorized for org ${org.id}`,
      );
      throw new ForbiddenException('Domain not authorized');
    }

    // 3. Generate session token
    const sessionToken = 'fpy_st_' + crypto.randomBytes(32).toString('hex');
    const expiresIn = 7200; // 2 hours in seconds

    // 4. Store session token
    this.sessionTokens.set(sessionToken, {
      orgId: org.id,
      apiKeyId: 'api_key_id', // Placeholder since we're using string key
      domain: requestDomain,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    // 5. Extract config to return
    const config = {
      botName: settings?.botName || 'Fluxypy Bot',
      primaryColor: settings?.primaryColor || '#6366F1',
      welcomeMessage:
        settings?.welcomeMessage ||
        'Hi! How can I help you today?',
      position: settings?.position || 'bottom-right',
      showBranding: settings?.showBranding !== false,
    };

    this.logger.log(
      `Session created for org ${org.id} from domain ${requestDomain}`,
    );

    return {
      sessionToken,
      expiresIn,
      config,
    };
  }

  /**
   * Validate a session token and return its data
   */
  validateSessionToken(
    token: string,
    requestDomain: string,
  ): SessionData {
    // 1. Look up token
    const session = this.sessionTokens.get(token);

    if (!session) {
      throw new UnauthorizedException(
        'Invalid or expired session token',
      );
    }

    // 2. Check expiration
    if (Date.now() > session.expiresAt) {
      this.sessionTokens.delete(token);
      throw new UnauthorizedException('Session expired');
    }

    // 3. Check domain match
    const cleanRequestDomain = requestDomain.startsWith('www.')
      ? requestDomain.substring(4)
      : requestDomain;
    const cleanSessionDomain = session.domain.startsWith('www.')
      ? session.domain.substring(4)
      : session.domain;

    if (cleanRequestDomain !== cleanSessionDomain) {
      throw new ForbiddenException('Domain mismatch');
    }

    this.logger.debug(`Session validated for org ${session.orgId}`);

    return session;
  }

  /**
   * Start interval to clean up expired tokens every 30 minutes
   */
  private startTokenCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let deletedCount = 0;

      for (const [token, session] of this.sessionTokens.entries()) {
        if (now > session.expiresAt) {
          this.sessionTokens.delete(token);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        this.logger.debug(
          `Cleaned up ${deletedCount} expired session tokens`,
        );
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Get total count of active sessions (for monitoring)
   */
  getActiveSessionCount(): number {
    const now = Date.now();
    let count = 0;

    for (const session of this.sessionTokens.values()) {
      if (now <= session.expiresAt) {
        count++;
      }
    }

    return count;
  }
}
