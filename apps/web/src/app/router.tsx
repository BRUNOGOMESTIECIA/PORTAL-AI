import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/use-mock-auth';
import { LoadingScreen } from '../components/shared/LoadingScreen';

function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      console.warn('[Vercel Deploy] Chunk desatualizado detectado. Atualizando página...', error);
      const isReloaded = sessionStorage.getItem('chunk_reload_attempt');
      if (!isReloaded) {
        sessionStorage.setItem('chunk_reload_attempt', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

// Misc
const NotFoundPage = safeLazy(() => import('../pages/NotFoundPage'));

// Auth pages
const ClientLoginPage = safeLazy(() => import('../pages/auth/ClientLoginPage'));
const OperationalLoginPage = safeLazy(() => import('../pages/auth/OperationalLoginPage'));

// Client portal
const ClientShell = safeLazy(() => import('../portals/client/ClientShell'));
const ClientHomePage = safeLazy(() => import('../portals/client/pages/ClientHomePage'));
const ClientTicketsPage = safeLazy(() => import('../portals/client/pages/ClientTicketsPage'));
const ClientChatPage = safeLazy(() => import('../portals/client/pages/ClientChatPage'));
const ClientKbPage = safeLazy(() => import('../portals/client/pages/ClientKbPage'));
const ClientCatalogPage = safeLazy(() => import('../portals/client/pages/ClientCatalogPage'));
const ClientProfilePage = safeLazy(() => import('../portals/client/pages/ClientProfilePage'));

// Operational portal
const OperationalShell = safeLazy(() => import('../portals/operational/OperationalShell'));
const DashboardPage = safeLazy(() => import('../portals/operational/pages/DashboardPage'));
const TicketsPage = safeLazy(() => import('../portals/operational/pages/TicketsPage'));
const TicketDetailPage = safeLazy(() => import('../portals/operational/pages/TicketDetailPage'));
const ChatQueuePage = safeLazy(() => import('../portals/operational/pages/ChatQueuePage'));
const InternalChatPage = safeLazy(() => import('../portals/operational/pages/InternalChatPage'));
const KbManagePage = safeLazy(() => import('../portals/operational/pages/KbManagePage'));
const KbEditorPage = safeLazy(() => import('../portals/operational/pages/KbEditorPage'));
const ReportsPage = safeLazy(() => import('../portals/operational/pages/ReportsPage'));
const CatalogPage = safeLazy(() => import('../portals/operational/pages/CatalogPage'));
const ToolsPage = safeLazy(() => import('../portals/operational/pages/ToolsPage'));
const EquipmentMonitoringPage = safeLazy(() => import('../portals/operational/pages/EquipmentMonitoringPage'));
const PrinterMonitoringPage = safeLazy(() => import('../portals/operational/pages/PrinterMonitoringPage'));
const AdminUsersPage = safeLazy(() => import('../portals/operational/pages/admin/AdminUsersPage'));
const AdminUserDetailPage = safeLazy(() => import('../portals/operational/pages/admin/AdminUserDetailPage'));
const AdminClientsPage = safeLazy(() => import('../portals/operational/pages/admin/AdminClientsPage'));
const AdminClientDetailPage = safeLazy(() => import('../portals/operational/pages/admin/AdminClientDetailPage'));
const AdminSettingsPage = safeLazy(() => import('../portals/operational/pages/admin/AdminSettingsPage'));
const AutomationBuilderPage = safeLazy(() => import('../portals/operational/pages/admin/AutomationBuilderPage'));
const AiUsageDashboardPage = safeLazy(() => import('../portals/operational/pages/admin/AiUsageDashboardPage'));
const TvNocStandalonePage = safeLazy(() => import('../portals/operational/pages/TvNocStandalonePage'));
const TvSuppliesStandalonePage = safeLazy(() => import('../portals/operational/pages/TvSuppliesStandalonePage'));
const TvAuthorizePage = safeLazy(() => import('../portals/operational/pages/admin/TvAuthorizePage'));



function ClientGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/cliente" replace />;
  if (user.type === 'staff') return <Navigate to="/operacional/app/dashboard" replace />;
  if (user.type !== 'client') return <Navigate to="/cliente" replace />;
  return <>{children}</>;
}

function StaffGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user || user.type !== 'staff') return <Navigate to="/operacional/login" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/cliente" replace />;
  if (user.type === 'client') return <Navigate to="/portal" replace />;
  return <Navigate to="/operacional/app/dashboard" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<NotFoundPage />} />

          {/* Pareamento e Autorização de Smart TV / Videowall NOC */}
          <Route path="/tv/autorizar" element={<TvAuthorizePage />} />
          <Route path="/tv/pair" element={<TvAuthorizePage />} />

          {/* Link direto para Smart TV / Videowall NOC */}
          <Route path="/tv" element={<TvNocStandalonePage />} />
          <Route path="/tv-noc" element={<TvNocStandalonePage />} />
          <Route path="/operacional/tv" element={<TvNocStandalonePage />} />

          {/* Link direto para Smart TV Mesa de Suprimentos & Equipamentos */}
          <Route path="/tv-suprimentos" element={<TvSuppliesStandalonePage />} />
          <Route path="/tv-equipamentos" element={<TvSuppliesStandalonePage />} />
          <Route path="/operacional/tv-suprimentos" element={<TvSuppliesStandalonePage />} />

          {/* Client login — detecta empresa e redireciona ao portal */}
          <Route path="/cliente" element={<ClientLoginPage />} />

          {/* Portal do cliente (simula cliente.empresa.com/ em dev) */}
          <Route path="/portal" element={<ClientGuard><ClientShell /></ClientGuard>}>
            <Route index element={<ClientHomePage />} />
            <Route path="tickets" element={<ClientTicketsPage />} />
            <Route path="tickets/:id" element={<ClientTicketsPage />} />
            <Route path="chat" element={<ClientChatPage />} />
            <Route path="kb" element={<ClientKbPage />} />
            <Route path="catalog" element={<ClientCatalogPage />} />
            <Route path="perfil" element={<ClientProfilePage />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Route>

          {/* Portal operacional */}
          <Route path="/operacional" element={<Navigate to="/operacional/login" replace />} />
          <Route path="/operacional/login" element={<OperationalLoginPage />} />
          <Route path="/operacional/app" element={<StaffGuard><OperationalShell /></StaffGuard>}>
            <Route index element={<Navigate to="/operacional/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="chat" element={<ChatQueuePage />} />
            <Route path="internal" element={<InternalChatPage />} />
            <Route path="kb" element={<KbManagePage />} />
            <Route path="kb/:id" element={<KbEditorPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/equipment" element={<EquipmentMonitoringPage />} />
            <Route path="tools/equipment/:deviceId" element={<EquipmentMonitoringPage />} />
            <Route path="tools/printers" element={<PrinterMonitoringPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/users/new" element={<AdminUserDetailPage />} />
            <Route path="admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="admin/clients" element={<AdminClientsPage />} />
            <Route path="admin/clients/new" element={<AdminClientDetailPage />} />
            <Route path="admin/clients/:id" element={<AdminClientDetailPage />} />
            <Route path="admin/automation" element={<AutomationBuilderPage />} />
            <Route path="admin/ai-usage" element={<AiUsageDashboardPage />} />
            <Route path="admin/settings" element={<AdminSettingsPage />} />


            <Route path="*" element={<Navigate to="/operacional/app/dashboard" replace />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
