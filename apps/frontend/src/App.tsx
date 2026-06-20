import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { ThemeContextProvider } from './theme/ThemeProvider';
import { router } from './router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SnackbarProvider } from './components/SnackbarProvider';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Box, CircularProgress, Typography } from '@mui/material';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

function FullPageSpinner() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <SnackbarProvider>
          <ErrorBoundary>
            <Suspense fallback={<FullPageSpinner />}>
              <OfflineIndicator />
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </SnackbarProvider>
      </ThemeContextProvider>
      {import.meta.env.DEV && <ReactQueryDevtools position="right" />}
    </QueryClientProvider>
  );
}