import client from './client'

export const getViajes   = (params = {}) => client.get('/viajes/',             { params }).then(r => r.data)
export const getViaje    = (id)           => client.get(`/viajes/${id}/`).then(r => r.data)
export const getUbicacion = (id)          => client.get(`/viajes/${id}/ubicacion/`).then(r => r.data)
export const getBitacora  = (id)          => client.get(`/viajes/${id}/bitacora/`).then(r => r.data)