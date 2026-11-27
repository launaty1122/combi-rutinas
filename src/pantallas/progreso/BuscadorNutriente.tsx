import { useMemo, useState } from 'react'
import { nombreVisible } from '../../datos/alimentos'
import { useCatalogo } from '../../datos/catalogo'
import { useAlacena } from '../../db/alacena'
import { masRicosEn } from '../../logica/progreso'
import { formatearNumero } from '../../logica/texto'
import type { Nutriente } from '../../logica/tipos'

const OPCIONES: { k: Nutriente; nombre: string; unidad: string }[] = [
  { k: 'proteina', nombre: 'Proteína', unidad: 'g' },
  { k: 'fibra', nombre: 'Fibra', unidad: 'g' },
  { k: 'hierro', nombre: 'Hierro', unidad: 'mg' },
  { k: 'calcio', nombre: 'Calcio', unidad: 'mg' },
  { k: 'potasio', nombre: 'Potasio', unidad: 'mg' },
  { k: 'vitaminaC', nombre: 'Vitamina C', unidad: 'mg' },
  { k: 'vitaminaA', nombre: 'Vitamina A', unidad: 'µg' },
]

/** Los alimentos más ricos en un nutriente (por 100 g), primero los que tienes en casa. */
export function BuscadorNutriente() {
  const catalogo = useCatalogo()
  const alacena = useAlacena() ?? []
  const [nutriente, setNutriente] = useState<Nutriente>('fibra')
  const info = OPCIONES.find((o) => o.k === nutriente)!
  const enCasa = useMemo(() => new Set(alacena.map((i) => i.alimentoId)), [alacena])
  const lista = useMemo(() => masRicosEn(catalogo.todos, nutriente, enCasa, 30), [catalogo, nutriente, enCasa])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nutriente">
        {OPCIONES.map((o) => (
          <button
            key={o.k}
            type="button"
            role="radio"
            aria-checked={nutriente === o.k}
            onClick={() => setNutriente(o.k)}
            className={`min-h-10 rounded-full px-4 text-sm font-bold ${nutriente === o.k ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : 'bg-pista'}`}
          >
            {o.nombre}
          </button>
        ))}
      </div>
      <p className="text-xs text-tinta-suave">Cantidad por cada 100 g. Ojo: 100 g de chía es mucho; una cucharada son 12 g.</p>
      <ol className="flex flex-col rounded-[22px] bg-tarjeta py-1">
        {lista.map(({ alimento, valor, enCasa: casa }) => (
          <li key={alimento.id} className="flex min-h-12 items-center gap-3 px-4 py-1.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{nombreVisible(alimento)}</span>
              {casa && <span className="mt-0.5 inline-block rounded-full bg-limon-verde px-2 text-[11px] font-bold text-noche">en tu alacena</span>}
            </span>
            <span className="shrink-0 font-bold tabular-nums">
              {formatearNumero(valor, valor < 10 ? 1 : 0)} {info.unidad}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
