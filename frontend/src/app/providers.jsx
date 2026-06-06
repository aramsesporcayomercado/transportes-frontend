import { AuthProvider } from '../shared/context/AuthContext'

// QueryClient se agrega cuando se instale @tanstack/react-query (Fase futura)
export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}