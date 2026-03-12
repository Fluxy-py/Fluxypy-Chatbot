import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface UpdateSettingsDto {
  primaryColor?: string;
  botName?: string;
  welcomeMessage?: string;
  position?: string;
  showBranding?: boolean;
  allowedDomains?: string[];
}

@Controller('org')
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private organizationsService: OrganizationsService) {}

  /**
   * PATCH /api/v1/org/settings
   * Update organization settings (authenticated users only)
   */
  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  async updateSettings(
    @Request() req: any,
    @Body() updates: UpdateSettingsDto,
  ) {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new BadRequestException('Organization ID not found in token');
    }

    // Validate domain list if provided
    if (updates.allowedDomains) {
      if (!Array.isArray(updates.allowedDomains)) {
        throw new BadRequestException(
          'allowedDomains must be an array',
        );
      }

      // Validate each domain format
      for (const domain of updates.allowedDomains) {
        if (typeof domain !== 'string' || !domain.trim()) {
          throw new BadRequestException(
            'Each domain must be a non-empty string',
          );
        }
      }
    }

    try {
      const result = await this.organizationsService.updateSettings(
        orgId,
        updates,
      );

      if (!result) {
        throw new BadRequestException('Organization not found');
      }

      this.logger.log(`Settings updated for org ${orgId}`);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Error updating settings for org ${orgId}: ${error.message}`,
      );
      throw error;
    }
  }
}
