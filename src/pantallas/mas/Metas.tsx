import { useState } from 'react'
import { guardarPerfil, metaAgua, type Actividad, type Perfil } from '../../db/perfil'
import { formatearNumero } from '../../logica/texto'

const ACTIVIDADES: { id: Actividad; nombre: string }[] = [
  { id: 'sedentaria', nombre: 'Sedentaria' },
  { id: 'ligera', nombre: 'Ligera (1–2 días)' },
  { id: 'moderada', nombre: 'Moderada (3–5 días)' },
  { id: 'alta', nombre: 'Alta (6–7 días)' },
]

/** Formulario de datos personales y metas diarias. */
export function FormularioMetas({ perfil, alGuardar }: { perfil: Perfil; alGuardar: () => void }) {
  const [p, setP] = useState<Perfil>(perfil)
  const [aguaAuto, setAguaAuto] = useState(perfil.metaAguaMl === null)
  const num = (k: keyof Perfil) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value.replace(',', '.'))
    setP((x) => ({ ...x, [k]: Number.isFinite(v) ? v : 0 }))
  }
  const valido = p.edad > 0 && p.alturaCm > 0 && p.pesoKg > 0 && p.metaProteina > 0 && p.metaFibra > 0

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!valido) return
        await guardarPerfil({ ...p, metaAguaMl: aguaAuto ? null : p.metaAguaMl })
        alGuardar()
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-titulo text-lg font-semibold">Metas diarias</legend>
        <Campo etiqueta="Proteína" unidad="g" valor={p.metaProteina} onChange={num('metaProteina')} ayuda="Tu rango: 90–105 g." />
        <Campo etiqueta="Fibra" unidad="g" valor={p.metaFibra} onChange={num('metaFibra')} />
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={aguaAuto} onChange={(e) => setAguaAuto(e.target.checked)} className="size-5 accent-finca" />
          Agua automática (35 ml × kg = {formatearNumero(metaAgua({ ...p, metaAguaMl: null }) / 1000, 2)} L)
        </label>
        {!aguaAuto && (
          <Campo etiqueta="Agua" unidad="ml" valor={p.metaAguaMl ?? metaAgua(p)} onChange={num('metaAguaMl')} />
        )}
        <Campo etiqueta="Tamaño de tu vaso" unidad="ml" valor={p.vasoMl} onChange={num('vasoMl')} />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-titulo text-lg font-semibold">Tus datos</legend>
        <div role="radiogroup" aria-label="Sexo" className="grid grid-cols-2 gap-1 rounded-full bg-pista p-1">
          {(['mujer', 'hombre'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={p.sexo === s}
              onClick={() => setP((x) => ({ ...x, sexo: s }))}
              className={`h-10 rounded-full text-sm font-bold capitalize ${p.sexo === s ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Campo etiqueta="Edad" unidad="años" valor={p.edad} onChange={num('edad')} />
          <Campo etiqueta="Altura" unidad="cm" valor={p.alturaCm} onChange={num('alturaCm')} />
          <Campo etiqueta="Peso" unidad="kg" valor={p.pesoKg} onChange={num('pesoKg')} />
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Actividad física
          <select
            value={p.actividad}
            onChange={(e) => setP((x) => ({ ...x, actividad: e.target.value as Actividad }))}
            className="h-12 rounded-2xl bg-pista px-3 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
          >
            {ACTIVIDADES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-tinta-suave">
          Tus datos sirven para la meta de agua y, en la Fase 2, para estimar tu gasto del día. Quedan solo en tu celular.
        </p>
      </fieldset>

      <button
        type="submit"
        disabled={!valido}
        className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45"
      >
        Guardar
      </button>
    </form>
  )
}

function Campo({
  etiqueta,
  unidad,
  valor,
  onChange,
  ayuda,
}: {
  etiqueta: string
  unidad: string
  valor: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ayuda?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-bold">
      {etiqueta}
      <span className="flex h-12 items-center rounded-2xl bg-pista pr-3 focus-within:ring-3 focus-within:ring-limon">
        <input
          inputMode="decimal"
          value={valor || ''}
          onChange={onChange}
          className="w-full min-w-0 bg-transparent px-3 text-base font-medium tabular-nums outline-none"
        />
        <span className="text-xs text-tinta-suave">{unidad}</span>
      </span>
      {ayuda && <span className="text-xs font-normal text-tinta-suave">{ayuda}</span>}
    </label>
  )
}
