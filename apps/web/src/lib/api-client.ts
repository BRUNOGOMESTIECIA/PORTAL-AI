/**
 * API CLIENT CENTRALIZADO (FETCH WRAPPER)
 * 
 * Centraliza as requisições HTTP para a API NestJS (`http://localhost:3000`).
 * Injeta automaticamente os cabeçalhos de autenticação (`Authorization: Bearer <token>`)
 * e o cabeçalho de multitenancy (`X-Tenant-Slug`).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  tenantSlug?: string;
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Obtém o token JWT armazenado localmente na sessão.
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('portal_access_token') || sessionStorage.getItem('portal_access_token');
  } catch {
    return null;
  }
}

/**
 * Obtém o Tenant Slug padrão do sistema ou da sessão.
 */
export function getStoredTenantSlug(): string {
  try {
    return localStorage.getItem('portal_tenant_slug') || 'clienteabc';
  } catch {
    return 'clienteabc';
  }
}

/**
 * Executa uma requisição HTTP genérica para a API NestJS.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, tenantSlug, token, headers: customHeaders, ...customOptions } = options;

  // Monta a URL final com Query Parameters se existirem
  let url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Define cabeçalhos padrão
  const authToken = token || getStoredToken();
  const slug = tenantSlug || getStoredTenantSlug();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': slug,
    ...(customHeaders as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      ...customOptions,
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const errorMessage =
        Array.isArray(errorData?.message)
          ? errorData.message.join(', ')
          : errorData?.message || `Erro ${response.status}: Requisição falhou`;

      throw new ApiError(response.status, errorMessage, errorData);
    }

    // Trata respostas vazias (ex: 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Erros de rede/conexão offline
    throw new ApiError(0, error?.message || 'Falha de conexão com a API backend NestJS');
  }
}

/**
 * Atalhos convenientes para métodos HTTP
 */
export const apiClient = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
