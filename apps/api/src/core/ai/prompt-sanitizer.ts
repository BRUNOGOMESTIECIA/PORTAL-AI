import { Logger } from '@nestjs/common';

const logger = new Logger('PromptSanitizer');

// Patterns known to be used in prompt injection attacks
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context)/gi,
  /forget\s+(everything|all|previous)/gi,
  /you\s+are\s+now\s+(a\s+)?(new|different|another)/gi,
  /system\s*prompt/gi,
  /\[SYSTEM\]/gi,
  /\<\s*system\s*\>/gi,
  /act\s+as\s+(if\s+you\s+are|a\s+)?(?:dan|jailbreak|unrestricted|evil|unfiltered)/gi,
  /jailbreak/gi,
  /do\s*anything\s*now/gi,
  /bypass\s+(safety|restrictions?|guidelines?|filters?)/gi,
  /pretend\s+(that\s+)?(you\s+)?(are|have\s+no)/gi,
  /reveal\s+(your\s+)?(system\s+prompt|instructions?|training)/gi,
  /output\s+(your\s+)?(initial\s+)?(system\s+|base\s+)?(prompt|instructions?)/gi,
  /what\s+(are|were)\s+your\s+(exact\s+)?(instructions?|system\s+prompt)/gi,
];

export interface SanitizationResult {
  sanitized: string;
  detected: boolean;
  matchedPatterns: string[];
}

export function sanitizePrompt(input: string, maxChars: number = 4000): SanitizationResult {
  if (!input || typeof input !== 'string') {
    return { sanitized: '', detected: false, matchedPatterns: [] };
  }

  const matchedPatterns: string[] = [];
  let sanitized = input.trim();

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      matchedPatterns.push(pattern.source);
    }
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
  }

  if (matchedPatterns.length > 0) {
    logger.warn(`Prompt injection attempt detected. Patterns: ${matchedPatterns.join(', ')}`);
    // Sanitize: replace injection attempts with a placeholder
    for (const pattern of INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[CONTEÚDO REMOVIDO]');
      pattern.lastIndex = 0;
    }
  }

  // Truncate to max chars
  if (sanitized.length > maxChars) {
    sanitized = sanitized.slice(0, maxChars);
  }

  return {
    sanitized,
    detected: matchedPatterns.length > 0,
    matchedPatterns,
  };
}
