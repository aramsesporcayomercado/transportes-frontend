import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '../shared/components/layout/PrivateRoute'
import { RoleGuard }    from '../shared/components/layout/RoleGuard'

// Pages — se irán moviendo a features/ en tareas siguientes
// Por ahora importamos de pages/ para no romper nada
import LoginPage           from '../pages/LoginPage'
import { DashboardPage }   from '../pages/DashboardPage'
import { ViajeDetailPage } from '../pages/ViajeDetailPage'
import OperadoresPage      from '../pages/OperadorPage'
import NanobotPage         from '../pages/NanobotPage'

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