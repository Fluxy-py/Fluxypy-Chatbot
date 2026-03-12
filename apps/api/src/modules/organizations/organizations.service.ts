import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  generateApiKey(): string {
    return `fpy_pub_${crypto.randomBytes(16).toString('hex')}`;
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  async create(name: string) {
    let slug = this.generateSlug(name);
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return this.prisma.organization.create({
      data: {
        name,
        slug,
        apiKey: this.generateApiKey(),
        settings: {
          primaryColor: '#6366F1',
          welcomeMessage: 'Hi! How can Fluxypy Bot help you today? 🤖',
          botName: 'Fluxypy Bot',
          position: 'bottom-right',
          showBranding: true,
          allowedDomains: [],
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.organization.findUnique({ where: { apiKey } });
  }

  /**
   * Update organization settings
   */
  async updateSettings(orgId: string, updates: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { settings: true },
    });

    if (!org) {
      return null;
    }

    const currentSettings = org.settings as any || {};
    const newSettings = {
      ...currentSettings,
      ...updates,
    };

    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        settings: newSettings,
      },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });
  }
}