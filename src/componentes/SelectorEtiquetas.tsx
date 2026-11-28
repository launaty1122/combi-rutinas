import type { GrupoEtiquetas } from '../datos/etiquetas'

/** Chips de etiquetas por grupo (cocina, momento, tipo…). Se usa al editar y al crear recetas. */
export function SelectorEtiquetas({
  grupos,
  elegidas,
  alAlternar,
}: {
  grupos: GrupoEtiquetas[]
  elegidas: string[]
  alAlternar: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {grupos.map((g) => (
        <fieldset key={g.id}>
          <legend className="mb-2 font-titulo text-lg font-semibold">{g.nombre}</legend>
          <div className="flex flex-wrap gap-2">
            {g.opciones.map((o) => {
              const on = elegidas.includes(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => alAlternar(o.id)}
                  className={`min-h-10 rounded-full px-4 text-sm font-bold ${on ? 'bg-limon-verde text-noche' : 'bg-pista'}`}
                >
                  {o.nombre}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
