import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Public } from '../../core/auth/decorators/public.decorator';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('admin.webhooks')
  findAll() { return this.webhooksService.findAll(); }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermissions('admin.webhooks')
  create(@Body() body: { name: string; url: string; events: string[] }) {
    return this.webhooksService.createEndpoint(body);
  }

  @Post('inbound')
  @Public()
  @ApiOperation({ summary: 'Receber webhook de sistema externo (bidirecional)' })
  inbound(@Body() body: any) {
    return this.webhooksService.processInbound(
      body.source ?? 'external',
      body.externalId ?? body.external_id,
      body.event ?? body.eventType,
      body,
    );
  }

  @Post('whatsapp')
  @Public()
  @ApiOperation({ summary: 'Webhook conector WhatsApp Business (Z-API / Evolution API)' })
  whatsappWebhook(@Body() body: any) {
    return this.webhooksService.processWhatsAppWebhook(body);
  }
}
