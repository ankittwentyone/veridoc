import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppLayout } from '@/components/layout'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { ScanPage } from '@/pages/Scan'
import { HistoryPage } from '@/pages/History'
import { HistoryDetailPage } from '@/pages/HistoryDetail'
import { AuditPage } from '@/pages/Audit'
import { AnalyticsPage } from '@/pages/Analytics'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AppLayout />}>
                <Route path="/app/dashboard" element={<DashboardPage />} />
                <Route path="/app/scan" element={<ScanPage />} />
                <Route path="/app/history" element={<HistoryPage />} />
                <Route path="/app/history/:id" element={<HistoryDetailPage />} />
                <Route path="/app/audit" element={<AuditPage />} />
                <Route path="/app/analytics" element={<AnalyticsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}