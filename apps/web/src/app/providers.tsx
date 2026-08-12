import React from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '../hooks/use-mock-auth';
import { ThemeProvider } from '../components/theme-provider';
import { InactivityTracker } from '../components/InactivityTracker';
import { CookieConsent } from '../components/CookieConsent';

import { TicketsProvider } from '../hooks/use-tickets';
import { ChatsProvider } from '../hooks/use-chats';
import { ApiIntegrationsProvider } from '../hooks/use-api-integrations';

interface ProvidersProps { children: React.ReactNode }

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="original" storageKey="portal-theme">
      <AuthProvider>
        <ApiIntegrationsProvider>
          <TicketsProvider>
            <ChatsProvider>
              {children}
              <InactivityTracker />
              <CookieConsent />
              <Toaster position="bottom-right" richColors closeButton toastOptions={{ duration: 4000 }} />
            </ChatsProvider>
          </TicketsProvider>
        </ApiIntegrationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
