import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import { formatDate } from '../../lib/utils';
import { sanitizeHtml } from '../../lib/sanitize';

export default function KbArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useQuery({
    queryKey: ['kb', 'article', slug],
    queryFn: () => apiGet<any>(`/kb/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) return <div className="flex h-48 items-center justify-center text-muted-foreground">Carregando…</div>;
  if (!article) return <div className="flex h-48 items-center justify-center text-muted-foreground">Artigo não encontrado</div>;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Publicado em {formatDate(article.published_at ?? article.created_at)} · {article.views} visualizações
        </p>
      </header>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
    </article>
  );
}
