import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { agregarAgua, deshacerAgua } from '../../db/diario'
import { leerNumero } from '../../logica/personales'
import { formatearNumero } from '../../logica/texto'

/** Vasos de agua que se llenan al tocarlos, más cantidad personalizada y deshacer. */
export function Agua({ fecha, ml, metaMl, vasoMl }: { fecha: string; ml: number; metaMl: number; vasoMl: number }) {
  const [otra, setOtra] = useState(false)
  const [cantidad, setCantidad] = useState('')
  const vasos = Math.max(1, Math.ceil(metaMl / vasoMl))
  const llenos = Math.floor(ml / vasoMl)
  const faltan = Math.max(0, metaMl - ml)

  return (
    <section className="flex flex-col gap-2.5" aria-label="Agua">
      <div className="flex items-baseline justify-between">
        <h2 className="font-titulo text-xl font-semibold">Agua</h2>
        <span className="text-sm text-tinta-suave">Vaso de {vasoMl} ml</span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(12, Math.max(vasos, llenos + 1))}, minmax(0, 1fr))` }}>
        {Array.from({ length: Math.max(vasos, llenos + 1) }, (_, i) => {
          const lleno = i < llenos
          return (
            <button
              key={i}
              type="button"
              onClick={() => (lleno ? undefined : agregarAgua(fecha, vasoMl))}
              aria-label={lleno ? `Vaso ${i + 1}, tomado` : `Tomé un vaso (${vasoMl} ml)`}
              disabled={lleno}
              className="relative h-11 w-full overflow-hidden rounded-[10px_10px_14px_14px] bg-pista transition-transform duration-100 ease-out active:scale-[0.92] disabled:cursor-default"
            >
              <span
                className="absolute inset-x-0 bottom-0 bg-cielo transition-[height] duration-300 ease-out"
                style={{ height: lleno ? '100%' : '0%' }}
              />
            </button>
          )
        })}
      </div>
      <p className="text-sm text-tinta-suave">
        {ml === 0
          ? 'Toca un vaso cada vez que tomes agua.'
          : faltan > 0
            ? `Llevas ${formatearNumero(ml / 1000, 2)} L. Te faltan ${formatearNumero(faltan / 1000, 2)} L.`
            : `¡Llegaste a tu meta! Tu cuerpo te lo agradece.`}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOtra((v) => !v)}
          className="flex min-h-10 items-center gap-1.5 rounded-full bg-pista px-4 text-sm font-bold"
        >
          <Icono nombre="agregar" tam={16} /> Otra cantidad
        </button>
        {ml > 0 && (
          <button type="button" onClick={() => deshacerAgua(fecha)} className="min-h-10 rounded-full px-3 text-sm font-bold text-tinta-suave underline">
            Deshacer
          </button>
        )}
      </div>
      {otra && (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const n = leerNumero(cantidad)
            if (n && n > 0) {
              await agregarAgua(fecha, n)
              setCantidad('')
              setOtra(false)
            }
          }}
        >
          <label className="flex h-11 flex-1 items-center rounded-full bg-pista pr-4 focus-within:ring-3 focus-within:ring-limon">
            <input
              autoFocus
              inputMode="numeric"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="500"
              aria-label="Mililitros de agua"
              className="w-full min-w-0 bg-transparent px-4 tabular-nums outline-none"
            />
            <span className="text-sm text-tinta-suave">ml</span>
          </label>
          <button type="submit" className="h-11 rounded-full bg-cielo px-5 font-bold text-noche">
            Agregar
          </button>
        </form>
      )}
    </section>
  )
}
