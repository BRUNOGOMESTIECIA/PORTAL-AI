import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { sanitizePrompt } from './prompt-sanitizer';
import { PlatformAlertEntity } from '../database/master/entities/platform-alert.entity';
import { AiTokenUsageEntity } from '../database/master/entities/ai-token-usage.entity';
import { PlatformAlertType } from '@portal/shared';
import { getTenantContext } from '../database/tenant.context';

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  latencyMs: number;
  wasFallback: boolean;
}

export interface EmbeddingResult {
  embedding: number[];
  inputTokens: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly timeoutMs: number;
  private readonly maxInputChars: number;
  private readonly model: string;
  private readonly embeddingModel: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(PlatformAlertEntity)
    private readonly alertRepo: Repository<PlatformAlertEntity>,
    @InjectRepository(AiTokenUsageEntity)
    private readonly tokenUsageRepo: Repository<AiTokenUsageEntity>,
  ) {
    this.openai = new OpenAI({ apiKey: config.get('AI_API_KEY', '') });
    this.timeoutMs = config.get<number>('AI_TIMEOUT_MS', 10000);
    this.maxInputChars = config.get<number>('AI_MAX_INPUT_CHARS', 4000);
    this.model = config.get('AI_MODEL', 'gpt-4o');
    this.embeddingModel = config.get('AI_EMBEDDING_MODEL', 'text-embedding-3-small');
  }

  async complete(
    messages: AiMessage[],
    opts?: { tenantId?: string; maxTokens?: number },
  ): Promise<AiCompletionResult> {
    const ctx = this.safeGetTenantContext();
    const tenantId = opts?.tenantId ?? ctx?.tenantId;

    if (!ctx?.aiEnabled) {
      return this.fallbackResult('IA desativada para este tenant', tenantId);
    }

    // Sanitize all user messages
    const sanitized = messages.map((m) => {
      if (m.role === 'user') {
        const { sanitized: clean, detected } = sanitizePrompt(m.content, this.maxInputChars);
        if (detected) {
          this.logger.warn(`Prompt injection detected (tenant: ${tenantId})`);
        }
        return { ...m, content: clean };
      }
      return m;
    });

    const start = Date.now();
    try {
      const result = await Promise.race([
        this.openai.chat.completions.create({
          model: ctx?.aiModel ?? this.model,
          messages: sanitized,
          max_tokens: opts?.maxTokens ?? 1024,
        }),
        this.createTimeout(),
      ]);

      const completion = result as OpenAI.ChatCompletion;
      const latencyMs = Date.now() - start;
      const inputTokens = completion.usage?.prompt_tokens ?? 0;
      const outputTokens = completion.usage?.completion_tokens ?? 0;

      if (tenantId) {
        await this.trackTokenUsage(tenantId, inputTokens, outputTokens);
      }

      return {
        content: completion.choices[0]?.message?.content ?? '',
        inputTokens,
        outputTokens,
        model: completion.model,
        latencyMs,
        wasFallback: false,
      };
    } catch (err: unknown) {
      const msg = (err as Error).message;
      this.logger.error(`AI completion failed: ${msg}`);
      await this.createFallbackAlert(tenantId, msg);
      return this.fallbackResult(msg, tenantId);
    }
  }

  async embed(text: string): Promise<EmbeddingResult> {
    const { sanitized } = sanitizePrompt(text, this.maxInputChars);
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: sanitized,
    });
    return {
      embedding: response.data[0].embedding,
      inputTokens: response.usage?.prompt_tokens ?? 0,
    };
  }

  private createTimeout(): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), this.timeoutMs),
    );
  }

  private async createFallbackAlert(tenantId: string | undefined, message: string): Promise<void> {
    try {
      await this.alertRepo.save(
        this.alertRepo.create({
          type: PlatformAlertType.AI_FALLBACK,
          tenantId: tenantId ?? null,
          message: `AI service unavailable: ${message}`,
        }),
      );
    } catch {
      // Don't throw if alert creation fails
    }
  }

  private async trackTokenUsage(
    tenantId: string,
    inputTokens: number,
    outputTokens: number,
  ): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    try {
      await this.tokenUsageRepo
        .createQueryBuilder()
        .insert()
        .into(AiTokenUsageEntity)
        .values({ tenantId, year, month, inputTokens, outputTokens })
        .orUpdate(['input_tokens', 'output_tokens', 'updated_at'], ['tenant_id', 'year', 'month'])
        .execute();
    } catch {
      // Non-critical, don't propagate
    }
  }

  private fallbackResult(reason: string, _tenantId?: string): AiCompletionResult {
    return {
      content: '',
      inputTokens: 0,
      outputTokens: 0,
      model: 'fallback',
      latencyMs: 0,
      wasFallback: true,
    };
  }

  private safeGetTenantContext() {
    try {
      return getTenantContext();
    } catch {
      return null;
    }
  }
}
