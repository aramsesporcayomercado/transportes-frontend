import client from './client'

export const login = async (email, password) => {
  const { data } = await client.post('/auth/login/', { email, password })

  sessionStorage.setItem('access_token', data.access)
  sessionStorage.setItem('refresh_token', data.refresh)

  return { user: data.usuario, access: data.access, refresh: data.refresh }
}

export const logout = async () => {
  try {
    await client.post('/auth/logout/')
  } finally {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
  }
}

export const getMe = () =>
  client.get('/auth/me/').then(r => r.data)