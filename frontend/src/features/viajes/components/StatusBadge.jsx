const PALETTE = {
  preview:             { bg: '#1E2235', text: '#6B7280' },
  documentado:         { bg: '#1E2A3A', text: '#60A5FA' },
  aceptado:            { bg: '#1E253A', text: '#818CF8' },
  en_transito_carga:   { bg: '#2A2210', text: '#FCD34D' },
  cargado_en_transito: { bg: '#2A1A0A', text: '#FB923C' },
  llegada_destino:     { bg: '#0F2A1A', text: '#4ADE80' },
  terminado:           { bg: '#1A1D27', text: '#9CA3AF' },
  cerrado:             { bg: '#1A1D27', text: '#6B7280' },
  cancelado:           { bg: '#2A0F0F', text: '#F87171' },
}

export function StatusBadge({ status, label }) {
  const { bg, text } = PALETTE[status] ?? PALETTE.preview
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide"
          style={{ background: bg, color: text, fontFamily: 'var(--font-body)' }}>
      {label ?? status}
    </span>
  )
}