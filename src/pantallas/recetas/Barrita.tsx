import type { Disponibilidad } from '../../logica/disponibilidad'

const COLOR = {
  tengo: '#165F47',
  poco: '#F2923B',
  falta: 'rgba(16, 37, 30, 0.15)',
}

/** Barrita de disponibilidad: un segmento por ingrediente (sin contar básicos). */
export function Barrita({ d, sobreColor = true }: { d: Disponibilidad; sobreColor?: boolean }) {
  const segmentos = d.detalle.filter((x) => x.estado !== 'basico')
  const etiqueta =
    d.total === 0
      ? 'Solo lleva básicos'
      : `Tienes ${d.tengo} de ${d.total} ingredientes${d.faltantes === 1 ? ', te falta 1' : ''}`
  return (
    <div className="flex items-center gap-2.5" role="img" aria-label={etiqueta}>
      <div className="flex flex-1 gap-1">
        {segmentos.map((s) => (
          <span
            key={s.alimentoId}
            className="h-2.5 flex-1 rounded-full"
            style={{ background: s.estado === 'falta' && !sobreColor ? 'var(--pista)' : COLOR[s.estado as keyof typeof COLOR] }}
          />
        ))}
        {segmentos.length === 0 && <span className="h-2.5 flex-1 rounded-full" style={{ background: COLOR.tengo }} />}
      </div>
      <span className="text-sm font-extrabold tabular-nums">
        {d.tengo}/{d.total}
      </span>
    </div>
  )
}
