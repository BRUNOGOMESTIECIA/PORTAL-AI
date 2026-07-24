import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Regras para ignorar arquivos estáticos e rotas da API/Next auth
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Extrair o hostname (ex: acme.portal.com.br ou acme.localhost:3000)
  const hostname = req.headers.get('host') || '';
  
  // Identificar o tenant_slug
  // Em localhost, remover porta se existir e verificar se não é o domínio principal
  const cleanHostname = hostname.split(':')[0];
  const isLocalhost = cleanHostname.endsWith('localhost');
  
  let tenantSlug = null;
  
  if (isLocalhost) {
    if (cleanHostname !== 'localhost') {
      tenantSlug = cleanHostname.replace('.localhost', '');
    }
  } else {
    // Em prod, assumindo portal.com.br
    const domain = 'portal.com.br';
    if (cleanHostname.endsWith(domain) && cleanHostname !== domain) {
      tenantSlug = cleanHostname.replace(`.${domain}`, '');
    }
  }

  // Se identificou um tenant e não estamos numa rota já reescrita
  if (tenantSlug && !url.pathname.startsWith(`/${tenantSlug}`)) {
    // Reescrever a requisição para a pasta app/[tenant]/...
    const newUrl = new URL(`/${tenantSlug}${url.pathname}`, req.url);
    
    // Adicionar o slug em um cabeçalho para uso interno (opcional)
    const response = NextResponse.rewrite(newUrl);
    response.headers.set('X-Tenant-Slug', tenantSlug);
    return response;
  }
  
  return NextResponse.next();
}
