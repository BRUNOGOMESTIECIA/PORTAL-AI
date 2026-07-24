import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { getTenantDataSource } from '../../core/database/tenant.context';
import { RagService } from '../../core/ai/rag.service';
import { AuditService } from '../audit/audit.service';
import { AuditActorType, KbArticleStatus } from '@portal/shared';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    private readonly ragService: RagService,
    private readonly auditService: AuditService,
  ) {}

  async search(query: string, userId: string) {
    const ds = getTenantDataSource();
    // First try vector search, fallback to full-text
    const vectorResults = await this.ragService.search(query, userId, 10);
    if (vectorResults.length > 0) return vectorResults;

    return ds.query(
      `SELECT id, title, excerpt, category_id, published_at,
              ts_rank(content_vector, plainto_tsquery('portuguese', $1)) AS rank
       FROM kb_articles
       WHERE status = 'published' AND content_vector @@ plainto_tsquery('portuguese', $1)
       ORDER BY rank DESC LIMIT 10`,
      [query],
    );
  }

  async findAll(status?: KbArticleStatus, categoryId?: string) {
    const ds = getTenantDataSource();
    const conds: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    if (status) { conds.push(`a.status = $${idx++}`); params.push(status); }
    if (categoryId) { conds.push(`a.category_id = $${idx++}`); params.push(categoryId); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    return ds.query(`SELECT a.*, c.name AS category_name, u.name AS author_name
      FROM kb_articles a
      LEFT JOIN kb_categories c ON c.id = a.category_id
      LEFT JOIN users u ON u.id = a.author_id
      ${where} ORDER BY a.updated_at DESC`, params);
  }

  async findBySlug(slug: string) {
    const ds = getTenantDataSource();
    const rows = await ds.query(
      `UPDATE kb_articles SET views = views + 1 WHERE slug = $1 AND status = 'published' RETURNING *`,
      [slug],
    );
    if (!rows.length) throw new NotFoundException('Artigo não encontrado');
    return rows[0];
  }

  async create(data: { title: string; content: string; categoryId: string; authorId: string; isPublic?: boolean }) {
    const ds = getTenantDataSource();
    const slug = this.toSlug(data.title);
    const [article] = await ds.query(
      `INSERT INTO kb_articles (title, slug, content, category_id, author_id, is_public, status)
       VALUES ($1,$2,$3,$4,$5,$6,'draft') RETURNING *`,
      [data.title, slug, data.content, data.categoryId, data.authorId, data.isPublic ?? true],
    );
    // Update FTS vector
    await this.updateContentVector(article.id, data.content);
    return article;
  }

  async submitForReview(articleId: string, authorId: string) {
    const ds = getTenantDataSource();
    await ds.query(
      `UPDATE kb_articles SET status = 'pending_review', submitted_for_review_at = now()
       WHERE id = $1 AND author_id = $2 AND status = 'draft'`,
      [articleId, authorId],
    );
  }

  async approve(articleId: string, reviewerId: string, notes?: string) {
    const ds = getTenantDataSource();
    const [article] = await ds.query(
      `UPDATE kb_articles SET status = 'published', reviewer_id = $1, reviewed_at = now(),
        review_notes = $2, published_at = now()
       WHERE id = $3 AND status = 'pending_review' RETURNING *`,
      [reviewerId, notes ?? null, articleId],
    );
    if (!article) throw new NotFoundException('Artigo não encontrado ou não está aguardando revisão');

    // Index for RAG
    await this.ragService.indexArticle(articleId, article.content);
    return article;
  }

  async reject(articleId: string, reviewerId: string, notes: string) {
    const ds = getTenantDataSource();
    await ds.query(
      `UPDATE kb_articles SET status = 'draft', reviewer_id = $1, reviewed_at = now(), review_notes = $2
       WHERE id = $3 AND status = 'pending_review'`,
      [reviewerId, notes, articleId],
    );
  }

  private async updateContentVector(articleId: string, content: string) {
    const ds = getTenantDataSource();
    await ds.query(
      `UPDATE kb_articles SET content_vector = to_tsvector('portuguese', $1) WHERE id = $2`,
      [content, articleId],
    );
  }

  private toSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 100)
      + '-' + Date.now().toString(36);
  }
}
