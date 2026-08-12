/**
 * PORTAL ITSM — WIDGET EMBEDDABLE LOADER SCRIPT
 * 
 * Permite incorporar o chat de atendimento em qualquer site externo.
 * Exemplo de uso:
 * <script src="http://localhost:5173/widget.js" data-tenant="clienteabc" data-company="Sua Empresa"></script>
 */

(function () {
  const currentScript = document.currentScript || Array.from(document.querySelectorAll('script')).pop();
  const tenantSlug = currentScript?.getAttribute('data-tenant') || 'clienteabc';
  const companyName = currentScript?.getAttribute('data-company') || 'Suporte ao Cliente';
  const primaryColor = currentScript?.getAttribute('data-color') || '#3b82f6';
  const serverUrl = currentScript?.getAttribute('data-server') || 'http://localhost:5173';

  console.info(`[Portal Widget] Inicializando Chat Embeddable para Tenant: ${tenantSlug}`);

  // Injeta o container DOM para o iframe/widget
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'portal-chat-widget-root';
  document.body.appendChild(widgetContainer);

  // Injeta o iframe flutuante que renderiza a aplicação leve do widget
  const iframe = document.createElement('iframe');
  iframe.src = `${serverUrl}/portal/chat?embed=true&tenant=${encodeURIComponent(tenantSlug)}&company=${encodeURIComponent(companyName)}&color=${encodeURIComponent(primaryColor)}`;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '0';
  iframe.style.right = '0';
  iframe.style.width = '420px';
  iframe.style.height = '520px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.background = 'transparent';
  iframe.style.pointerEvents = 'auto';

  widgetContainer.appendChild(iframe);
})();
