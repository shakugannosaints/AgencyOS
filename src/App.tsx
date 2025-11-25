import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { AppShell } from '@/app/layouts/app-shell'
import { DashboardPage } from '@/modules/dashboard/pages/dashboard-page'
import { AgentsPage } from '@/modules/agents/pages/agents-page'
import { MissionsPage } from '@/modules/missions/pages/missions-page'
import { AnomaliesPage } from '@/modules/anomalies/pages/anomalies-page'
import { ReportsPage } from '@/modules/reports/pages/reports-page'

export default function App() {
  return (
    <AppProviders>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="missions" element={<MissionsPage />} />
            <Route path="anomalies" element={<AnomaliesPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProviders>
  )
}
