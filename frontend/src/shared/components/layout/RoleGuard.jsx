import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export function RoleGuard({ rolesPermitidos, children }) {
  const { user } = useContext(AuthContext)

  if (!user) return <Navigate to="/login" replace />

  if (!rolesPermitidos.includes(user.rol)) {
    return <Navigate to={defaultRouteByRole(user.rol)} replace />
  }

  return children
}

function defaultRouteByRole(rol) {
  switch (rol) {
    case 'superadmin': return '/dashboard'
    case 'logistica':  return '/dashboard'
    case 'operador':   return '/viajes'
    case 'cliente':    return '/nanobot'
    default:           return '/login'
  }
}