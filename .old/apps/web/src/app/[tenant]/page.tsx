import { notFound } from 'next/navigation';
import PortalUI from './PortalUI';

async function getTenantInfo(slug: string) {
  try {
    const res = await fetch('http://localhost:8002/api/v1/tenant-info', {
      headers: {
        'X-Tenant-Slug': slug,
      },
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar dados do tenant:', error);
    return null;
  }
}

export default async function TenantPage(props: { params: Promise<{ tenant: string }> }) {
  const params = await props.params;
  const tenantData = await getTenantInfo(params.tenant);
  
  if (!tenantData) {
    notFound();
  }

  // Passar dados reais do tenant quando disponíveis. Por enquanto mockamos a cor.
  return (
    <PortalUI tenantName={params.tenant} primaryColor="#3b82f6" />
  );
}
