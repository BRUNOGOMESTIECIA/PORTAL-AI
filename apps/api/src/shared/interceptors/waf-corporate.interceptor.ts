import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

// Padrões de Injeção SQL OWASP
const SQLI_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))(\s)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))(\s)*(union|select|insert|update|delete|drop|alter|create|truncate)(\s)+/i,
  /UNION(\s)+SELECT/i,
  /SELECT\s+.*\s+FROM/i,
  /OR\s+['"]?1['"]?\s*=\s*['"]?1/i,
  /DROP\s+TABLE/i,
  /INSERT\s+INTO/i,
];

// Padrões de Cross-Site Scripting (XSS)
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
  /onmouseover\s*=/i,
  /<iframe\b/i,
  /<embed\b/i,
  /<object\b/i,
];

// Padrões de Path Traversal
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//i,
  /\.\.\\/i,
  /%2e%2e%2f/i,
  /%2e%2e\//i,
  /\.\.%2f/i,
];

@Injectable()
export class WafCorporateInterceptor implements NestInterceptor {
  private readonly logger = new Logger('CorporateWAF');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // 1. Inspeciona a URL / Query Params
    const rawUrl = req.originalUrl || req.url || '';
    this.inspectContent(rawUrl, 'URL/Query', clientIp, req.method);

    // 2. Inspeciona o Corpo da Requisição (Body Payload)
    if (req.body && typeof req.body === 'object') {
      const bodyString = JSON.stringify(req.body);
      this.inspectContent(bodyString, 'JSON_Body', clientIp, req.method);
    }

    return next.handle();
  }

  private inspectContent(content: string, source: string, ip: string | string[], method: string): void {
    if (!content) return;

    // 1. Detecção de Path Traversal
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(content)) {
        this.logAndBlock('PathTraversal', source, ip, method, content);
      }
    }

    // 2. Detecção de SQL Injection
    for (const pattern of SQLI_PATTERNS) {
      if (pattern.test(content)) {
        this.logAndBlock('SQL_Injection', source, ip, method, content);
      }
    }

    // 3. Detecção de XSS
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(content)) {
        this.logAndBlock('Cross_Site_Scripting_XSS', source, ip, method, content);
      }
    }
  }

  private logAndBlock(threatType: string, source: string, ip: string | string[], method: string, snippet: string): never {
    const truncatedSnippet = snippet.length > 80 ? `${snippet.substring(0, 80)}...` : snippet;
    this.logger.warn(
      `🚨 [WAF L7 BLOCKED] Ameaça: ${threatType} | Origem: ${source} | IP: ${ip} | Método: ${method} | Trecho: ${truncatedSnippet}`,
    );

    throw new ForbiddenException({
      statusCode: 403,
      error: 'Forbidden',
      message: `Requisição bloqueada pelo WAF Corporativo Layer 7. Motivo: Detecção de padrão suspeito (${threatType}).`,
      incidentId: `WAF-${Date.now()}`,
    });
  }
}
