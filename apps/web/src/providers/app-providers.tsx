'use client';

import { MantineProvider, ScrollArea, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query/query-client';
import { LenisProvider } from './lenis-provider';
import { PageTransition } from './page-transition';

const theme = createTheme({
  primaryColor: 'teahGold',
  defaultRadius: 'md',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '800'
  },
  colors: {
    teahGold: [
      '#fff8e1',
      '#f7edc4',
      '#ebd98f',
      '#dec45a',
      '#d4b334',
      '#b8933e',
      '#9a772b',
      '#76591f',
      '#554018',
      '#35270e'
    ],
    teahCrimson: [
      '#ffecef',
      '#f8d5dc',
      '#eda5b2',
      '#e17288',
      '#d84965',
      '#9b1b30',
      '#821428',
      '#671021',
      '#4c0b18',
      '#33060f'
    ],
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
        centered: true,
        scrollAreaComponent: ScrollArea.Autosize,
        yOffset: 16,
        xOffset: 16,
        overlayProps: {
          backgroundOpacity: 0.62,
          blur: 6
        }
      },
      styles: {
        content: {
          maxHeight: 'calc(100dvh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        },
        body: {
          flex: 1,
          minHeight: 0
        }
      }
    },
    Drawer: {
      defaultProps: {
        radius: 'lg',
        scrollAreaComponent: ScrollArea.Autosize,
        overlayProps: {
          backgroundOpacity: 0.56,
          blur: 5
        }
      },
      styles: {
        content: {
          maxHeight: '100dvh',
          overflow: 'hidden'
        }
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
