import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { CATEGORIAS } from '../../datos/categorias'
import { guardarAlimentoPersonal } from '../../db/alimentos'
import { nuevoId } from '../../db/db'
import { crearAlimentoPersonal, leerNumero } from '../../logica/personales'
import { LeerTablaFoto } from './LeerTablaFoto'
import type { Alimento, CategoriaAlimento, Nutriente } from '../../logica/tipos'

const CAMPOS: { k: Nutriente; nombre: string; unidad: string; principal?: boolean }[] = [
  { k: 'kcal', nombre: 'Energía', unidad: 'kcal', principal: true },
  { k: 'proteina', nombre: 'Proteína', unidad: 'g', principal: true },
  { k: 'carbohidratos', nombre: 'Carbohidratos', unidad: 'g', principal: true },
  { k: 'fibra', nombre: 'Fibra', unidad: 'g', principal: true },
  { k: 'grasa', nombre: 'Grasas totales', unidad: 'g', principal: true },
  { k: 'grasaSaturada', nombre: 'Grasas saturadas', unidad: 'g' },
  { k: 'sodio', nombre: 'Sodio', unidad: 'mg' },
  { k: 'calcio', nombre: 'Calcio', unidad: 'mg' },
  { k: 'hierro', nombre: 'Hierro', unidad: 'mg' },
  { k: 'potasio', nombre: 'Potasio', unidad: 'mg' },
  { k: 'vitaminaC', nombre: 'Vitamina C', unidad: 'mg' },
  { k: 'vitaminaA', nombre: 'Vitamina A', unidad: 'µg' },
]

/**
 * Crear un alimento propio copiando la tabla nutricional del empaque.
 * En Brasil la tabla trae "por porción" y "por 100 g": se puede usar cualquiera.
 */
export function CrearAlimento({
  nombreInicial = '',
  inicial,
  plantilla,
  alGuardar,
}: {
  nombreInicial?: string
  /** Para editar un alimento propio que ya existe. */
  inicial?: Alimento
  /** Datos para empezar (por ejemplo, de un código de barras); los valores son por 100 g. */
  plantilla?: { nombre: string; n: Alimento['n']; porcion?: { nombre: string; gramos: number } }
  alGuardar: (a: Alimento) => void
}) {
  const base0 = inicial ?? (plantilla ? { nombre: plantilla.nombre, n: plantilla.n, porciones: plantilla.porcion ? [plantilla.porcion] : [] } : undefined)
  const [nombre, setNombre] = useState(base0?.nombre ?? nombreInicial)
  const [categoria, setCategoria] = useState<CategoriaAlimento>(inicial?.categoria ?? 'otros')
  const [base, setBase] = useState<'100' | 'porcion'>('100')
  const [gramosPorcion, setGramosPorcion] = useState(base0?.porciones[0] ? String(base0.porciones[0].gramos) : '')
  const [nombrePorcion, setNombrePorcion] = useState(base0?.porciones[0]?.nombre ?? '')
  const [liquido, setLiquido] = useState(!!inicial?.liquido)
  const [valores, setValores] = useState<Partial<Record<Nutriente, string>>>(() =>
    base0 ? Object.fromEntries(CAMPOS.map((c) => [c.k, base0.n[c.k] === null ? '' : String(base0.n[c.k])])) : {},
  )
  const [verMas, setVerMas] = useState(false)

  const gPorcion = leerNumero(gramosPorcion) ?? 0
  const gramosBase = base === '100' ? 100 : gPorcion
  const valido = nombre.trim() !== '' && gramosBase > 0 && CAMPOS.some((c) => leerNumero(valores[c.k]) !== null)

  async function guardar() {
    const porciones = nombrePorcion.trim() && gPorcion > 0 ? [{ nombre: nombrePorcion.trim(), gramos: gPorcion }] : []
    const a = crearAlimentoPersonal(
      { nombre, categoria, gramosBase, valores, porciones, liquido },
      inicial?.id ?? nuevoId('p-'),
    )
    await guardarAlimentoPersonal(a)
    alGuardar(a)
  }

  const u = liquido ? 'ml' : 'g'
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (valido) guardar()
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Nombre
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej.: Whey de mi marca"
          className="h-12 rounded-2xl bg-pista px-4 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Categoría
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as CategoriaAlimento)}
          className="h-12 rounded-2xl bg-pista px-3 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={liquido} onChange={(e) => setLiquido(e.target.checked)} className="size-5 accent-finca" />
        Es líquido (se mide en ml)
      </label>

      <LeerTablaFoto
        alLeer={(t) => {
          setValores((v) => ({ ...v, ...t.valores }))
          setBase(t.base === 'por100' ? '100' : 'porcion')
          if (t.gramosPorcion) {
            setGramosPorcion(String(t.gramosPorcion))
            setNombrePorcion((n) => n || '1 porción')
          }
        }}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-bold">Porción (como dice el empaque)</legend>
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          <input
            value={nombrePorcion}
            onChange={(e) => setNombrePorcion(e.target.value)}
            placeholder="1 scoop, 1 pote…"
            aria-label="Nombre de la porción"
            className="h-12 rounded-2xl bg-pista px-4 font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
          />
          <label className="flex h-12 items-center rounded-2xl bg-pista pr-3 focus-within:ring-3 focus-within:ring-limon">
            <input
              value={gramosPorcion}
              onChange={(e) => setGramosPorcion(e.target.value)}
              inputMode="decimal"
              placeholder="30"
              aria-label={`Gramos de la porción (${u})`}
              className="w-full min-w-0 bg-transparent px-3 text-right font-medium outline-none"
            />
            <span className="text-sm text-tinta-suave">{u}</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-bold">Los valores que vas a copiar son…</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-full bg-pista p-1">
          {(
            [
              ['100', `por 100 ${u}`],
              ['porcion', 'por porción'],
            ] as const
          ).map(([id, txt]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={base === id}
              onClick={() => setBase(id)}
              className={`h-10 rounded-full text-sm font-bold ${base === id ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''}`}
            >
              {txt}
            </button>
          ))}
        </div>
        {base === 'porcion' && gPorcion <= 0 && (
          <p className="text-sm text-tinta-suave">Escribe arriba cuántos {u} tiene la porción.</p>
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        {CAMPOS.filter((c) => c.principal || verMas).map((c) => (
          <label key={c.k} className="flex flex-col gap-1 text-[13px] font-bold">
            {c.nombre}
            <span className="flex h-11 items-center rounded-2xl bg-pista pr-3 focus-within:ring-3 focus-within:ring-limon">
              <input
                value={valores[c.k] ?? ''}
                onChange={(e) => setValores((v) => ({ ...v, [c.k]: e.target.value }))}
                inputMode="decimal"
                placeholder="sin dato"
                className="w-full min-w-0 bg-transparent px-3 text-base font-medium outline-none placeholder:text-tinta-suave/70"
              />
              <span className="text-xs text-tinta-suave">{c.unidad}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="button" onClick={() => setVerMas((v) => !v)} className="self-start text-sm font-bold underline underline-offset-2">
        {verMas ? 'Menos nutrientes' : 'Más nutrientes (sodio, calcio, hierro…)'}
      </button>
      <p className="text-xs text-tinta-suave">Lo que dejes vacío queda como "sin dato", nunca como 0.</p>

      <button
        type="submit"
        disabled={!valido}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45"
      >
        <Icono nombre="check" tam={20} /> Guardar alimento
      </button>
    </form>
  )
}
