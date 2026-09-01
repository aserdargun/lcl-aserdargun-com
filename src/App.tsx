import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import type { Locale } from '@/i18n/locale'
import { BenchmarksPage } from '@/pages/BenchmarksPage'
import { ChangesPage } from '@/pages/ChangesPage'
import { ComparePage } from '@/pages/ComparePage'
import { DevicesPage } from '@/pages/DevicesPage'
import { HomePage } from '@/pages/HomePage'
import { MethodologyPage } from '@/pages/MethodologyPage'
import { ModelsPage } from '@/pages/ModelsPage'
import { WorkbenchPage } from '@/pages/WorkbenchPage'

function LocalizedShell() {
  const { locale } = useParams()
  if (locale !== 'tr' && locale !== 'en') return <Navigate to="/tr" replace />
  return <AppShell locale={locale as Locale} />
}

export function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/tr" replace />} />
    <Route path="/:locale" element={<LocalizedShell />}>
      <Route index element={<HomePage />} />
      <Route path="build" element={<WorkbenchPage />} />
      <Route path="models" element={<ModelsPage />} />
      <Route path="devices" element={<DevicesPage />} />
      <Route path="benchmarks" element={<BenchmarksPage />} />
      <Route path="compare" element={<ComparePage />} />
      <Route path="changes" element={<ChangesPage />} />
      <Route path="methodology" element={<MethodologyPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/tr" replace />} />
  </Routes>
}

export default AppRoutes
