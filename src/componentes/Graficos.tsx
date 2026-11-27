import { useState } from 'react'
import { fechaCorta } from '../logica/fechas'
import { formatearNumero } from '../logica/texto'

// Gráficas pequeñas y propias (SVG), con los colores de la app y una sola serie cada una:
// línea de 2 px, puntos de 8 px con anillo del color de fondo, rejilla muy suave,
// y al tocar un punto o una barra se ve su valor y su fecha.

const ALTO = 150
const MARGEN = { arriba: 12, abajo: 22, izq: 4, der: 4 }

function Tooltip({ x, ancho, texto }: { x: number; ancho: number; texto: string }) {
  const izquierda = Math.min(Math.max(x, 50), ancho - 50)
  return (
    <div
      className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-full bg-noche px-3 py-1 text-xs font-bold whitespace-nowrap text-crema dark:bg-crema dark:text-noche"
      style={{ left: izquierda }}
      role="status"
    >
      {texto}
    </div>
  )
}

export interface PuntoGrafico {
  fecha: string
  valor: number
}

/** Línea simple (peso, una medida). */
export function GraficoLinea({ puntos, unidad, ancho = 320 }: { puntos: PuntoGrafico[]; unidad: string; ancho?: number }) {
  const [sel, setSel] = useState<number | null>(null)
  if (puntos.length === 0) return null
  const valores = puntos.map((p) => p.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const rango = max - min || 1
  const yMin = min - rango * 0.2
  const yMax = max + rango * 0.2
  const w = ancho - MARGEN.izq - MARGEN.der
  const h = ALTO - MARGEN.arriba - MARGEN.abajo
  const x = (i: number) => MARGEN.izq + (puntos.length === 1 ? w / 2 : (i / (puntos.length - 1)) * w)
  const y = (v: number) => MARGEN.arriba + h - ((v - yMin) / (yMax - yMin)) * h
  const camino = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ')

  return (
    <div className="relative pt-7">
      {sel !== null && (
        <Tooltip x={x(sel)} ancho={ancho} texto={`${formatearNumero(puntos[sel].valor, 1)} ${unidad} · ${fechaCorta(puntos[sel].fecha)}`} />
      )}
      <svg
        viewBox={`0 0 ${ancho} ${ALTO}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`Gráfica: de ${formatearNumero(puntos[0].valor, 1)} a ${formatearNumero(puntos[puntos.length - 1].valor, 1)} ${unidad}`}
      >
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={MARGEN.izq} x2={ancho - MARGEN.der} y1={MARGEN.arriba + h * t} y2={MARGEN.arriba + h * t} stroke="var(--pista)" strokeWidth="1" />
        ))}
        <path d={camino} fill="none" stroke="var(--principal)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map((p, i) => (
          <circle key={p.fecha} cx={x(i)} cy={y(p.valor)} r={sel === i ? 6 : 4} fill="var(--principal)" stroke="var(--hoja)" strokeWidth="2" />
        ))}
        <text x={MARGEN.izq} y={ALTO - 4} className="fill-tinta-suave text-[11px]">
          {fechaCorta(puntos[0].fecha)}
        </text>
        {puntos.length > 1 && (
          <text x={ancho - MARGEN.der} y={ALTO - 4} textAnchor="end" className="fill-tinta-suave text-[11px]">
            {fechaCorta(puntos[puntos.length - 1].fecha)}
          </text>
        )}
        {/* Zonas táctiles más grandes que los puntos. */}
        {puntos.map((p, i) => (
          <rect
            key={`t-${p.fecha}`}
            x={x(i) - w / Math.max(puntos.length, 2) / 2}
            y={0}
            width={w / Math.max(puntos.length, 2)}
            height={ALTO}
            fill="transparent"
            onClick={() => setSel(sel === i ? null : i)}
          />
        ))}
      </svg>
    </div>
  )
}

export interface BarraDia {
  fecha: string
  valor: number
  /** false: ese día no se anotó nada (barra vacía, no "cero"). */
  conDatos: boolean
}

/** Barras por día con la línea de la meta (proteína, fibra, agua, calorías). */
export function GraficoBarras({
  dias,
  meta,
  unidad,
  color = 'var(--principal)',
  ancho = 320,
  decimales = 0,
}: {
  dias: BarraDia[]
  meta?: number
  unidad: string
  color?: string
  ancho?: number
  decimales?: number
}) {
  const [sel, setSel] = useState<number | null>(null)
  if (dias.length === 0) return null
  const max = Math.max(meta ?? 0, ...dias.map((d) => d.valor), 1) * 1.1
  const w = ancho - MARGEN.izq - MARGEN.der
  const h = ALTO - MARGEN.arriba - MARGEN.abajo
  const paso = w / dias.length
  const anchoBarra = Math.max(3, paso - 2) // 2 px de espacio entre barras
  const y = (v: number) => MARGEN.arriba + h - (v / max) * h
  const base = MARGEN.arriba + h
  const radio = Math.min(4, anchoBarra / 2)

  return (
    <div className="relative pt-7">
      {sel !== null && (
        <Tooltip
          x={MARGEN.izq + paso * sel + paso / 2}
          ancho={ancho}
          texto={dias[sel].conDatos ? `${formatearNumero(dias[sel].valor, decimales)} ${unidad} · ${fechaCorta(dias[sel].fecha)}` : `${fechaCorta(dias[sel].fecha)}: sin registro`}
        />
      )}
      <svg viewBox={`0 0 ${ancho} ${ALTO}`} className="w-full overflow-visible" role="img" aria-label={`Gráfica de barras por día en ${unidad}`}>
        <line x1={MARGEN.izq} x2={ancho - MARGEN.der} y1={base} y2={base} stroke="var(--pista)" strokeWidth="1" />
        {dias.map((d, i) => {
          const x0 = MARGEN.izq + paso * i + (paso - anchoBarra) / 2
          if (!d.conDatos || d.valor <= 0) {
            return <rect key={d.fecha} x={x0} y={base - 3} width={anchoBarra} height={3} rx={1.5} fill="var(--pista)" />
          }
          const top = y(d.valor)
          const alto = base - top
          const r = Math.min(radio, alto)
          // Solo las esquinas de arriba redondeadas; la barra queda apoyada en la base.
          const camino = `M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + anchoBarra - r} Q${x0 + anchoBarra},${top} ${x0 + anchoBarra},${top + r} V${base} Z`
          return <path key={d.fecha} d={camino} fill={color} opacity={sel === null || sel === i ? 1 : 0.55} />
        })}
        {meta !== undefined && meta > 0 && (
          // Línea punteada de la meta (el número va en el título de la gráfica, para no tapar barras).
          <line x1={MARGEN.izq} x2={ancho - MARGEN.der} y1={y(meta)} y2={y(meta)} stroke="var(--tinta-suave)" strokeWidth="1.5" strokeDasharray="4 4">
            <title>Meta: {formatearNumero(meta, decimales)} {unidad}</title>
          </line>
        )}
        <text x={MARGEN.izq} y={ALTO - 4} className="fill-tinta-suave text-[11px]">
          {fechaCorta(dias[0].fecha)}
        </text>
        <text x={ancho - MARGEN.der} y={ALTO - 4} textAnchor="end" className="fill-tinta-suave text-[11px]">
          {fechaCorta(dias[dias.length - 1].fecha)}
        </text>
        {dias.map((d, i) => (
          <rect key={`t-${d.fecha}`} x={MARGEN.izq + paso * i} y={0} width={paso} height={ALTO} fill="transparent" onClick={() => setSel(sel === i ? null : i)} />
        ))}
      </svg>
    </div>
  )
}
