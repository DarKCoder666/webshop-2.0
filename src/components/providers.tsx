"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { WebshopSettingsProvider } from './providers/webshop-settings-provider';
import { GlobalThemeProvider } from './providers/global-theme-provider';
import { GlobalThemeCSSProvider } from './providers/global-theme-css-provider';
import { useLanguageStore } from '@/lib/stores/language-store';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Initialize language store to ensure it hydrates early (read only, no render change)
  useLanguageStore(state => state.language);
  return (
    <QueryClientProvider client={queryClient}>
      <WebshopSettingsProvider>
        <GlobalThemeProvider>
          <GlobalThemeCSSProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            <ReactQueryDevtools initialIsOpen={false} />
          </GlobalThemeCSSProvider>
        </GlobalThemeProvider>
      </WebshopSettingsProvider>
    </QueryClientProvider>
  );
}
