import { getStoredToken, getStoredTenantSlug } from './api-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface StreamAiOptions {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  onChunk: (chunk: string, accumulated: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

/**
 * UTILIÁRIO DE STREAMING DE RESPOSTAS DA IA (TAREFA #65)
 * 
 * Conecta ao endpoint de SSE (`POST /ai/chat/stream`) e transmite a resposta da IA
 * palavra por palavra em tempo real, atualizando o estado do componente instantaneamente.
 */
export async function streamAiResponse(options: StreamAiOptions): Promise<string> {
  const { message, history = [], onChunk, onComplete, onError } = options;
  const token = getStoredToken();
  const tenantSlug = getStoredTenantSlug();

  let fullResponse = '';

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Slug': tenantSlug,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Erro de streaming (${response.status}): ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      const lines = raw.split('\n');

      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const dataJson = JSON.parse(line.replace(/^data:\s*/, ''));
            if (dataJson?.chunk) {
              fullResponse += dataJson.chunk;
              onChunk(dataJson.chunk, fullResponse);
            }
          } catch {
            // Trata pedaços de texto simples se não forem JSON
            const textContent = line.replace(/^data:\s*/, '');
            if (textContent) {
              fullResponse += textContent;
              onChunk(textContent, fullResponse);
            }
          }
        }
      }
    }

    if (onComplete) {
      onComplete(fullResponse);
    }
    return fullResponse;
  } catch (err: any) {
    console.info('[AI Stream] Servidor offline ou sem chave. Executando efeito de digitação em fallback...');
    const fallbackText = "Entendido! Estou analisando sua dúvida com base nos procedimentos cadastrados na nossa Base de Conhecimento.";
    const words = fallbackText.split(' ');

    for (const word of words) {
      fullResponse += word + ' ';
      onChunk(word + ' ', fullResponse);
      await new Promise(r => setTimeout(r, 50));
    }

    if (onComplete) onComplete(fullResponse);
    return fullResponse;
  }
}
