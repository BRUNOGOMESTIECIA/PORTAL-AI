/**
 * Utilitário de sanitização robusto de HTML contra XSS (Cross-Site Scripting).
 * Utiliza o DOMParser do navegador para inspecionar a árvore DOM, removendo tags perigosas,
 * atributos com manipuladores de eventos (on*) e esquemas de URI maliciosos (javascript:, data:).
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  try {
    // 1. Usa DOMParser para transformar a string em um documento DOM inerte
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirty, 'text/html');

    // Lista de tags proibidas por risco de XSS / Injeção de Código
    const FORBIDDEN_TAGS = [
      'script', 'iframe', 'object', 'embed', 'link', 'style', 'base', 'meta', 'form', 'input', 'button', 'svg'
    ];

    // Remove todas as tags proibidas
    FORBIDDEN_TAGS.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // 2. Inspeciona todos os elementos restantes na árvore DOM
    const allElements = doc.body.querySelectorAll('*');
    allElements.forEach((el) => {
      const attrNames = el.getAttributeNames();
      for (const attrName of attrNames) {
        const lowerAttrName = attrName.toLowerCase();
        
        // Remove qualquer atributo que comece com "on" (onerror, onload, onclick, ontoggle, etc.)
        if (lowerAttrName.startsWith('on')) {
          el.removeAttribute(attrName);
          continue;
        }

        // Verifica valores de atributos de URL (href, src, action, data, formaction)
        if (['href', 'src', 'action', 'data', 'formaction'].includes(lowerAttrName)) {
          const val = (el.getAttribute(attrName) || '').trim().toLowerCase();
          // Bloqueia javascript:, data: (exceto imagens base64 seguras), vbscript:
          if (
            val.startsWith('javascript:') ||
            val.startsWith('vbscript:') ||
            (val.startsWith('data:') && !val.startsWith('data:image/'))
          ) {
            el.setAttribute(attrName, '#');
          }
        }
      }
    });

    return doc.body.innerHTML;
  } catch (e) {
    // Fallback caso o DOMParser falhe ou esteja fora do navegador
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      .replace(/href\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, (match) => {
        return /javascript:/i.test(match) ? 'href="#"' : match;
      });
  }
}
