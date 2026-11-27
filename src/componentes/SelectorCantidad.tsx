import { useState } from 'react'
import type { Alimento } from '../logica/tipos'
import { aGramos, enPorciones, formatearGramos } from '../logica/unidades'

/** Cantidad + unidad (g/ml o porciones del alimento). Avisa los gramos resultantes. */
export function useSelectorCantidad(alimento: Alimento, gramosIniciales?: number) {
  const base = alimento.liquido ? 'ml' : 'g'
  const ini = gramosIniciales ? enPorciones(gramosIniciales, alimento.porciones) : null
  const [unidad, setUnidad] = useState(ini ? ini.porcion.nombre : base)
  const [texto, setTexto] = useState(ini ? String(ini.cantidad) : gramosIniciales ? String(Math.round(gramosIniciales)) : '')
  const porcion = alimento.porciones.find((p) => p.nombre === unidad)
  const gramos = aGramos(Number(texto.replace(',', '.')), porcion)
  return { base, unidad, setUnidad, texto, setTexto, porcion, gramos }
}

export function SelectorCantidad({
  alimento,
  estado,
  etiqueta = '¿Cuánto?',
}: {
  alimento: Alimento
  estado: ReturnType<typeof useSelectorCantidad>
  etiqueta?: string
}) {
  const { base, unidad, setUnidad, texto, setTexto, porcion, gramos } = estado
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold">{etiqueta}</legend>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          aria-label="Cantidad"
          placeholder="0"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="h-14 w-24 rounded-2xl bg-pista px-4 font-titulo text-2xl font-semibold tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-limon"
        />
        <div className="flex flex-1 flex-wrap gap-2" role="radiogroup" aria-label="Unidad">
          {[base, ...alimento.porciones.map((p) => p.nombre)].map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={unidad === u}
              onClick={() => setUnidad(u)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold transition-colors duration-150 ${
                unidad === u ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : 'bg-pista'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      {porcion && gramos > 0 && <p className="text-sm text-tinta-suave">= {formatearGramos(gramos, alimento.liquido)}</p>}
    </fieldset>
  )
}
