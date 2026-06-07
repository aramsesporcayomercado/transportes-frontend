import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '../shared/components/layout/PrivateRoute'
import { RoleGuard }    from '../shared/components/layout/RoleGuard'
import LoginPage           from '../features/login/pages/LoginPage'
import { DashboardPage }   from '../features/dashboard/pages/DashboardPage'
import { ViajeDetailPage } from '../features/viajes/page/ViajeDetailPage'
import NanobotPage         from '../features/nanobot/page/NanobotPage'
import { OperadoresPage } from '../features/operadores'

const ADMIN_LOG = ['superadmin', 'logistica']
const TODOS     = ['superadmin', 'logistica', 'operador', 'cliente']

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <RoleGuard rolesPermitidos={ADMIN_LOG}>
              <DashboardPage />
            </RoleGuard>
          </PrivateRoute>
        }/>

        <Route path="/viajes/:id" element={
          <PrivateRoute>
            <RoleGuard rolesPermitidos={TODOS}>
              <ViajeDetailPage />
            </RoleGuard>
          </PrivateRoute>
        }/>

        <Route path="/operadores" element={
          <PrivateRoute>
            <RoleGuard rolesPermitidos={ADMIN_LOG}>
              <OperadoresPage />
            </RoleGuard>
          </PrivateRoute>
        }/>

        <Route path="/nanobot" element={
          <PrivateRoute>
            <RoleGuard rolesPermitidos={TODOS}>
              <NanobotPage />
            </RoleGuard>
          </PrivateRoute>
        }/>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}