import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/use-mock-auth';
import { LoadingScreen } from '../components/shared/LoadingScreen';

// Misc
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Auth pages
const ClientLoginPage = lazy(() => import('../pages/auth/ClientLoginPage'));
const OperationalLoginPage = lazy(() => import('../pages/auth/OperationalLoginPage'));

// Client portal
const ClientShell = lazy(() => import('../portals/client/ClientShell'));
const ClientHomePage = lazy(() => import('../portals/client/pages/ClientHomePage'));
const ClientTicketsPage = lazy(() => import('../portals/client/pages/ClientTicketsPage'));
const ClientChatPage = lazy(() => import('../portals/client/pages/ClientChatPage'));
const ClientKbPage = lazy(() => import('../portals/client/pages/ClientKbPage'));
const ClientProfilePage = lazy(() => import('../portals/client/pages/ClientProfilePage'));

// Operational portal
const OperationalShell = lazy(() => import('../portals/operational/OperationalShell'));
const DashboardPage = lazy(() => import('../portals/operational/pages/DashboardPage'));
const TicketsPage = lazy(() => import('../portals/operational/pages/TicketsPage'));
const TicketDetailPage = lazy(() => import('../portals/operational/pages/TicketDetailPage'));
const ChatQueuePage = lazy(() => import('../portals/operational/pages/ChatQueuePage'));
const InternalChatPage = lazy(() => import('../portals/operational/pages/InternalChatPage'));
const KbManagePage = lazy(() => import('../portals/operational/pages/KbManagePage'));
const KbEditorPage = lazy(() => import('../portals/operational/pages/KbEditorPage'));
const ReportsPage = lazy(() => import('../portals/operational/pages/ReportsPage'));
const CatalogPage = lazy(() => import('../portals/operational/pages/CatalogPage'));
const ToolsPage = lazy(() => import('../portals/operational/pages/ToolsPage'));
const EquipmentMonitoringPage = lazy(() => import('../portals/operational/pages/EquipmentMonitoringPage'));
const PrinterMonitoringPage = lazy(() => import('../portals/operational/pages/PrinterMonitoringPage'));
const AdminUsersPage = lazy(() => import('../portals/operational/pages/admin/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('../portals/operational/pages/admin/AdminUserDetailPage'));
const AdminClientsPage = lazy(() => import('../portals/operational/pages/admin/AdminClientsPage'));
const AdminClientDetailPage = lazy(() => import('../portals/operational/pages/admin/AdminClientDetailPage'));
const AdminSettingsPage = lazy(() => import('../portals/operational/pages/admin/AdminSettingsPage'));

function ClientGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user || (user.type !== 'client' && user.type !== 'staff')) return <Navigate to="/cliente" replace />;
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

          {/* Client login — detecta empresa e redireciona ao portal */}
          <Route path="/cliente" element={<ClientLoginPage />} />

          {/* Portal do cliente (simula cliente.empresa.com/ em dev) */}
          <Route path="/portal" element={<ClientGuard><ClientShell /></ClientGuard>}>
            <Route index element={<ClientHomePage />} />
            <Route path="tickets" element={<ClientTicketsPage />} />
            <Route path="tickets/:id" element={<ClientTicketsPage />} />
            <Route path="chat" element={<ClientChatPage />} />
            <Route path="kb" element={<ClientKbPage />} />
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
            <Route path="admin/settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="/operacional/app/dashboard" replace />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
