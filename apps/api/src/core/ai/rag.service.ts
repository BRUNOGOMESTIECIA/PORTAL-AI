import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { getTenantDataSource } from '../database/tenant.context';

export interface RagSearchResult {
  chunkText: string;
  articleId: string;
  articleTitle: string;
  similarity: number;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(private readonly aiService: AiService) {}

  async search(
    query: string,
    userId: string,
    topK: number = 5,
  ): Promise<RagSearchResult[]> {
    const ds = getTenantDataSource();

    try {
      const { embedding } = await this.aiService.embed(query);
      const embeddingStr = `[${embedding.join(',')}]`;

      const results = await ds.query(
        `
        SELECT
          e.chunk_text,
          e.article_id,
          a.title AS article_title,
          1 - (e.embedding <=> $1::vector) AS similarity
        FROM ai_kb_embeddings e
        JOIN kb_articles a ON a.id = e.article_id
        WHERE a.status = 'published' AND a.is_public = true
        ORDER BY e.embedding <=> $1::vector
        LIMIT $2
      `,
        [embeddingStr, topK],
      );

      if (results.length > 0) {
        return results.map((r: any) => ({
          chunkText: r.chunk_text,
          articleId: r.article_id,
          articleTitle: r.article_title,
          similarity: parseFloat(r.similarity || '0.8'),
        }));
      }
    } catch (err: any) {
      this.logger.log('[RagService] Usando busca relacional por palavras-chave na KB (modo sem API Key).');
    }


    // Fallback: busca tradicional relacional ILIKE na tabela kb_articles
    try {
      const kwResults = await ds.query(
        `SELECT id AS article_id, title AS article_title, content AS chunk_text
         FROM kb_articles
         WHERE status = 'published' AND is_public = true
           AND (title ILIKE $1 OR content ILIKE $1)
         LIMIT $2`,
        [`%${query}%`, topK],
      );

      return kwResults.map((r: any) => ({
        chunkText: r.chunk_text,
        articleId: r.article_id,
        articleTitle: r.article_title,
        similarity: 0.9,
      }));
    } catch {
      return [];
    }
  }


  async indexArticle(articleId: string, content: string): Promise<void> {
    const ds = getTenantDataSource();
    const chunks = this.chunkText(content);

    // Delete existing embeddings for this article
    await ds.query(`DELETE FROM ai_kb_embeddings WHERE article_id = $1`, [articleId]);

    // Insert new embeddings
    for (let i = 0; i < chunks.length; i++) {
      const { embedding } = await this.aiService.embed(chunks[i]);
      const embeddingStr = `[${embedding.join(',')}]`;

      await ds.query(
        `INSERT INTO ai_kb_embeddings (article_id, chunk_index, chunk_text, embedding)
         VALUES ($1, $2, $3, $4::vector)
         ON CONFLICT (article_id, chunk_index) DO UPDATE
           SET chunk_text = EXCLUDED.chunk_text,
               embedding = EXCLUDED.embedding,
               updated_at = now()`,
        [articleId, i, chunks[i], embeddingStr],
      );
    }

    await ds.query(
      `UPDATE kb_articles SET embedding_updated_at = now() WHERE id = $1`,
      [articleId],
    );

    this.logger.log(`Indexed ${chunks.length} chunks for article ${articleId}`);
  }

  buildRagPrompt(question: string, context: RagSearchResult[]): string {
    if (context.length === 0) {
      return `Você é um assistente de suporte técnico. Responda a seguinte pergunta:\n\n${question}`;
    }

    const contextText = context
      .map((r, i) => `[Fonte ${i + 1}: ${r.articleTitle}]\n${r.chunkText}`)
      .join('\n\n');

    return `Você é um assistente de suporte técnico. Use as informações abaixo para responder a pergunta do usuário.
Se a resposta não estiver nas fontes, diga que não encontrou informação e sugira abrir um chamado.
Responda sempre em português brasileiro.

FONTES DE CONHECIMENTO:
${contextText}

PERGUNTA DO USUÁRIO:
${question}`;
  }

  private chunkText(text: string, chunkSize: number = 512, overlap: number = 64): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let i = 0;

    while (i < words.length) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
      i += chunkSize - overlap;
    }

    return chunks.filter((c) => c.trim().length > 0);
  }
}
