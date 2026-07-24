import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../core/auth/guards/permission.guard';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import { UserEntity } from '../../core/database/tenant/entities/user.entity';
import { KnowledgeBaseService } from './knowledge-base.service';

@ApiTags('Knowledge Base')
@Controller('kb')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Get('search')
  @RequirePermissions('kb.view')
  @ApiOperation({ summary: 'Pesquisar na base de conhecimento (RAG + FTS)' })
  search(@Query('q') query: string, @CurrentUser() user: UserEntity) {
    return this.kbService.search(query, user.id);
  }

  @Get()
  @RequirePermissions('kb.view')
  findAll(@Query('status') status?: string, @Query('categoryId') categoryId?: string) {
    return this.kbService.findAll(status as any, categoryId);
  }

  @Get(':slug')
  @RequirePermissions('kb.view')
  findBySlug(@Param('slug') slug: string) {
    return this.kbService.findBySlug(slug);
  }

  @Post()
  @RequirePermissions('kb.write')
  create(@Body() body: any, @CurrentUser() user: UserEntity) {
    return this.kbService.create({ ...body, authorId: user.id });
  }

  @Patch(':id/submit-review')
  @RequirePermissions('kb.write')
  @ApiOperation({ summary: 'Submeter artigo para revisão' })
  submitForReview(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.kbService.submitForReview(id, user.id);
  }

  @Patch(':id/approve')
  @RequirePermissions('kb.publish')
  @ApiOperation({ summary: 'Aprovar e publicar artigo (apenas admins)' })
  approve(@Param('id') id: string, @Body() body: { notes?: string }, @CurrentUser() user: UserEntity) {
    return this.kbService.approve(id, user.id, body.notes);
  }

  @Patch(':id/reject')
  @RequirePermissions('kb.publish')
  @ApiOperation({ summary: 'Rejeitar artigo e devolver ao autor' })
  reject(@Param('id') id: string, @Body() body: { notes: string }, @CurrentUser() user: UserEntity) {
    return this.kbService.reject(id, user.id, body.notes);
  }
}
