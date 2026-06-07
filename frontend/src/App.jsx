import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './shared/context/AuthContext'
import { PrivateRoute }    from './shared/components/layout/PrivateRoute'
import { RoleGuard }       from './shared/components/layout/RoleGuard'
import LoginPage           from './pages/LoginPage'
import { DashboardPage }   from './pages/DashboardPage'
import { ViajeDetailPage } from './pages/ViajeDetailPage'
import OperadoresPage from './pages/OperadorPage'
import NanobotPage from './pages/NanobotPage'

// Grupos de roles — los defines una vez aquí y los reutilizas abajo
// Si mañana agregas un rol nuevo, solo cambias estas constantes
const ADMIN_LOG  = ['superadmin', 'logistica']
const SOLO_ADMIN = ['superadmin']
const STAFF      = ['superadmin', 'logistica', 'operador']
const TODOS      = ['superadmin', 'logistica', 'operador', 'cliente']

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Pública — sin protección */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirige la raíz al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard — solo admin y logística */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <DashboardPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          {/* Detalle de viaje — todos los roles */}
          <Route path="/viajes/:id" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={TODOS}>
                <ViajeDetailPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/operadores" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <OperadoresPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/nanobot" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <NanobotPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          {/* <Route path="/viajes" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={STAFF}>
                <ViajesPage />
              </RoleGuard>
            </PrivateRoute>
          } /> */}

          {/* Las siguientes rutas están comentadas hasta que
              existan sus páginas — las descomentamos en Día 2 y 3 */}

          {/*
          <Route path="/viajes" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={STAFF}>
                <ViajesPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          

          <Route path="/flotillas" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <FlotillasPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/clientes" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <ClientesPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/incidencias" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <IncidenciasPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/usuarios" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={SOLO_ADMIN}>
                <UsuariosPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/reportes" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={ADMIN_LOG}>
                <ReportesPage />
              </RoleGuard>
            </PrivateRoute>
          } />

          <Route path="/nanobot" element={
            <PrivateRoute>
              <RoleGuard rolesPermitidos={TODOS}>
                <NanobotPage />
              </RoleGuard>
            </PrivateRoute>
          } />
          */}

          {/* Cualquier ruta desconocida — al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}