'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query/query-client';
import { LenisProvider } from './lenis-provider';
import { PageTransition } from './page-transition';

const theme = createTheme({
  primaryColor: 'green',
  defaultRadius: 'md',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '800'
  },
  colors: {
    green: [
      '#eefbf2',
      '#d8f5e1',
      '#aee8c0',
      '#7ed99d',
      '#55c97f',
      '#33b767',
      '#1f9952',
      '#177943',
      '#115f35',
      '#0b4225'
    ]
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md'
      },
      styles: {
        root: {
          fontWeight: 750
        }
      }
    },
    Paper: {
      defaultProps: {
        radius: 'md'
      }
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true
      }
    },
    Drawer: {
      defaultProps: {
        radius: 'lg'
      }
    },
    Table: {
      defaultProps: {
        verticalSpacing: 'sm',
        horizontalSpacing: 'md'
      }
    }
  }
});

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <LenisProvider>
          <PageTransition>{children}</PageTransition>
          <Notifications position="top-right" autoClose={4000} zIndex={99999} limit={5} />
        </LenisProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
