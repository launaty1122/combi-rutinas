import { useState } from 'react'
import { nombreVisible } from '../../datos/alimentos'
import type { Alimento } from '../../logica/tipos'
import { hoyISO } from '../../logica/fechas'
import { aGramos, enPorciones, formatearGramos } from '../../logica/unidades'

export interface DatosItem {
  gramos: number
  compradoEl?: string
  venceEl?: string
  basico: boolean
}

interface Props {
  alimento: Alimento
  inicial?: Partial<DatosItem>
  textoGuardar: string
  alGuardar: (d: DatosItem) => void
  /** Botones extra al final (por ejemplo, "Quitar de la alacena"). */
  extra?: React.ReactNode
}

/** Formulario de cantidad, unidad y fechas para un alimento de la alacena. */
export function FormularioItem({ alimento, inicial, textoGuardar, alGuardar, extra }: Props) {
  const unidadBase = alimento.liquido ? 'ml' : 'g'
  // Si la cantidad inicial es un número redondo de alguna porción, se muestra así.
  const enPorc = inicial?.gramos ? enPorciones(inicial.gramos, alimento.porciones) : null
  const [unidad, setUnidad] = useState<string>(enPorc ? enPorc.porcion.nombre : unidadBase)
  const [cantidad, setCantidad] = useState<string>(
    enPorc ? String(enPorc.cantidad) : inicial?.gramos ? String(Math.round(inicial.gramos)) : '',
  )
  const [compradoEl, setCompradoEl] = useState(inicial?.compradoEl ?? hoyISO())
  const [venceEl, setVenceEl] = useState(inicial?.venceEl ?? '')
  const [basico, setBasico] = useState(inicial?.basico ?? false)

  const porcion = alimento.porciones.find((p) => p.nombre === unidad)
  const numero = Number(cantidad.replace(',', '.'))
  const gramos = aGramos(numero, porcion)
  const valido = gramos > 0

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valido) return
        alGuardar({ gramos, compradoEl: compradoEl || undefined, venceEl: venceEl || undefined, basico })
      }}
    >
      <div>
        <p className="font-titulo text-xl leading-tight font-semibold">{nombreVisible(alimento)}</p>
        {alimento.alias.length > 0 && <p className="mt-0.5 text-sm text-tinta-suave">{alimento.nombre}</p>}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">¿Cuánto hay?</legend>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            aria-label="Cantidad"
            placeholder="0"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="h-14 w-28 rounded-2xl bg-pista px-4 font-titulo text-2xl font-semibold tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-limon"
          />
          <div className="flex flex-1 flex-wrap gap-2" role="radiogroup" aria-label="Unidad">
            {[unidadBase, ...alimento.porciones.map((p) => p.nombre)].map((u) => (
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
        {porcion && valido && <p className="text-sm text-tinta-suave">= {formatearGramos(gramos, alimento.liquido)}</p>}
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Comprado
          <input
            type="date"
            value={compradoEl}
            onChange={(e) => setCompradoEl(e.target.value)}
            className="h-12 rounded-2xl bg-pista px-3 font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Vence (opcional)
          <input
            type="date"
            value={venceEl}
            onChange={(e) => setVenceEl(e.target.value)}
            className="h-12 rounded-2xl bg-pista px-3 font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-pista px-4 py-3">
        <input type="checkbox" checked={basico} onChange={(e) => setBasico(e.target.checked)} className="size-5 accent-finca" />
        <span className="text-sm">
          <strong>Es un básico</strong>
          <span className="block text-tinta-suave">Como la sal o el aceite: no cuenta como faltante en las recetas.</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={!valido}
        className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-45"
      >
        {textoGuardar}
      </button>
      {extra}
    </form>
  )
}
