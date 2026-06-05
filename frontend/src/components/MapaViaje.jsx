import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

const MAP_CONTAINER = { width: '100%', height: '420px' }
const DEFAULT_CENTER = { lat: 32.5027, lng: -117.0037 }  // Tijuana

export function MapaViaje({ ubicacion }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  })

  if (!isLoaded) {
    return (
      <div className="rounded-lg animate-pulse"
           style={{ height: 420, background: 'var(--color-surface-2)' }} />
    )
  }

  const center = ubicacion
    ? { lat: ubicacion.lat, lng: ubicacion.lng }
    : DEFAULT_CENTER

  return (
    <div className="rounded-lg overflow-hidden"
         style={{ border: '1px solid var(--color-border)' }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER}
        center={center}
        zoom={13}
        options={{
          styles: darkMapStyle,   // ver abajo
          disableDefaultUI: false,
        }}
      >
        {ubicacion && (
          <Marker
            position={{ lat: ubicacion.lat, lng: ubicacion.lng }}
            title={`${ubicacion.velocidad ?? 0} km/h`}
          />
        )}
      </GoogleMap>
    </div>
  )
}

// Estilo oscuro para que el mapa sea coherente con el tema
const darkMapStyle = [
  { elementType: 'geometry',        stylers: [{ color: '#1A1D27' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
  { featureType: 'road',            elementType: 'geometry', stylers: [{ color: '#2E3347' }] },
  { featureType: 'water',           elementType: 'geometry', stylers: [{ color: '#0F1117' }] },
  { featureType: 'poi',             stylers: [{ visibility: 'off' }] },
]