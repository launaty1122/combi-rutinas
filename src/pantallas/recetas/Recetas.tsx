import { useMemo, useState } from 'react'
import { Hoja } from '../../componentes/Hoja'
import { Icono, Mancha } from '../../componentes/Icono'
import { Pantalla } from '../../componentes/Pantalla'
import { GRUPOS_ETIQUETAS, NOMBRE_ETIQUETA } from '../../datos/etiquetas'
import { NOMBRE_ETIQUETA as NOMBRE_OBJETIVO } from '../../logica/etiquetas'
import { filtrarRecetas, TIEMPOS, type Modo } from '../../logica/filtros'
import { formatearNumero } from '../../logica/texto'
import { href } from '../../rutas'
import { Barrita } from './Barrita'
import { colorDeReceta, useRecetasCompletas, type RecetaCompleta } from './datos'

const OBJETIVOS = Object.entries(NOMBRE_OBJETIVO).map(([id, nombre]) => ({ id: `objetivo:${id}`, nombre }))

function nombreFiltro(id: string): string {
  if (id === 'favoritas') return 'Favoritas'
  return (
    NOMBRE_ETIQUETA.get(id) ??
    TIEMPOS.find((t) => t.id === id)?.nombre ??
    OBJETIVOS.find((o) => o.id === id)?.nombre ??
    id
  )
}

// Atajos visibles sin abrir "Filtros".
const ATAJOS = ['favoritas', 'tiempo:20', 'objetivo:alta-en-proteina', 'tipo:batido', 'cocina:brasileña', 'cocina:colombiana']

export function Recetas({ alAgregar }: { alAgregar: () => void }) {
  const recetas = useRecetasCompletas()
  const [texto, setTexto] = useState('')
  const [modo, setModo] = useState<Modo>('todas')
  const [etiquetas, setEtiquetas] = useState<string[]>([])
  const [verFiltros, setVerFiltros] = useState(false)

  const visibles = useMemo(
    () => (recetas ? (filtrarRecetas(recetas, { texto, modo, etiquetas }) as RecetaCompleta[]) : []),
    [recetas, texto, modo, etiquetas],
  )
  const alternar = (id: string) =>
    setEtiquetas((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))

  const chips = [...new Set([...etiquetas, ...ATAJOS])]
  const cuantasPuedo = recetas?.filter((r) => r.disponibilidad.completa).length ?? 0

  return (
    <Pantalla
      ruta="recetas"
      titulo="Recetas"
      subtitulo={recetas ? `${recetas.length} recetas · puedes cocinar ${cuantasPuedo} ya` : ' '}
      alAgregar={alAgregar}
      cabecera={
        <label className="flex h-13 items-center gap-3 rounded-full bg-hoja px-5 text-tinta">
          <Icono nombre="buscar" className="text-tinta-suave" />
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca por nombre o ingrediente"
            aria-label="Buscar recetas"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-tinta-suave"
          />
        </label>
      }
    >
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="Mostrar" className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-1 rounded-full bg-pista p-1">
          {(
            [
              ['todas', 'Todas'],
              ['puedo', 'Puedo cocinar ya'],
              ['falta1', 'Me falta 1'],
            ] as [Modo, string][]
          ).map(([id, txt]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={modo === id}
              onClick={() => setModo(id)}
              className={`h-10 rounded-full text-sm font-bold transition-colors duration-200 ${
                modo === id ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''
              }`}
            >
              {txt}
            </button>
          ))}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setVerFiltros(true)}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-noche px-4 text-sm font-bold text-crema dark:bg-crema dark:text-noche"
          >
            Filtros{etiquetas.length > 0 ? ` · ${etiquetas.length}` : ''}
          </button>
          {chips.map((id) => {
            const on = etiquetas.includes(id)
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => alternar(id)}
                className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors duration-150 ${
                  on ? 'bg-limon-verde text-noche' : 'bg-pista'
                }`}
              >
                {nombreFiltro(id)}
              </button>
            )
          })}
        </div>

        {recetas && visibles.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center">
            <p className="font-titulo text-xl font-semibold">
              {modo === 'puedo' ? 'Todavía no hay recetas completas' : 'Nada por aquí'}
            </p>
            <p className="text-tinta-suave">
              {modo === 'puedo'
                ? 'Agrega lo que tienes en la alacena, o mira "Me falta 1": a veces un solo ingrediente te separa de una receta.'
                : 'Prueba quitando algún filtro o buscando otra palabra.'}
            </p>
            {etiquetas.length > 0 && (
              <button type="button" onClick={() => setEtiquetas([])} className="h-11 rounded-full bg-pista px-5 font-bold">
                Quitar filtros
              </button>
            )}
          </div>
        )}

        <ul className="flex flex-col gap-3">
          {visibles.map((r) => (
            <li key={r.receta.id}>
              <TarjetaReceta r={r} />
            </li>
          ))}
        </ul>
      </div>

      <Hoja abierta={verFiltros} titulo="Filtros" alCerrar={() => setVerFiltros(false)}>
        <div className="flex flex-col gap-5">
          <GrupoFiltro titulo="Favoritas" opciones={[{ id: 'favoritas', nombre: 'Solo favoritas' }]} elegidas={etiquetas} alternar={alternar} />
          <GrupoFiltro titulo="Tiempo" opciones={TIEMPOS} elegidas={etiquetas} alternar={alternar} />
          <GrupoFiltro titulo="Objetivo" opciones={OBJETIVOS} elegidas={etiquetas} alternar={alternar} />
          {GRUPOS_ETIQUETAS.map((g) => (
            <GrupoFiltro key={g.id} titulo={g.nombre} opciones={g.opciones} elegidas={etiquetas} alternar={alternar} />
          ))}
          <div className="sticky bottom-0 -mx-5 flex gap-2 bg-hoja px-5 pt-2 pb-1">
            <button type="button" onClick={() => setEtiquetas([])} className="h-13 flex-1 rounded-full bg-pista py-3.5 font-bold">
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setVerFiltros(false)}
              className="h-13 flex-[2] rounded-full bg-limon-verde py-3.5 font-titulo text-lg font-semibold text-noche"
            >
              Ver {recetas ? visibles.length : ''} recetas
            </button>
          </div>
        </div>
      </Hoja>
    </Pantalla>
  )
}

function GrupoFiltro({
  titulo,
  opciones,
  elegidas,
  alternar,
}: {
  titulo: string
  opciones: { id: string; nombre: string }[]
  elegidas: string[]
  alternar: (id: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-titulo text-lg font-semibold">{titulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const on = elegidas.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => alternar(o.id)}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors duration-150 ${
                on ? 'bg-limon-verde text-noche' : 'bg-pista'
              }`}
            >
              {o.nombre}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function TarjetaReceta({ r }: { r: RecetaCompleta }) {
  const color = colorDeReceta(r.receta.id)
  const cocina = r.receta.etiquetas.find((e) => e.startsWith('cocina:'))
  const prot = r.nutricion.porPorcion.proteina
  const fibra = r.nutricion.porPorcion.fibra
  const destacado =
    prot !== null && prot >= 15
      ? `${formatearNumero(prot, 0)} g proteína`
      : fibra !== null
        ? `${formatearNumero(fibra, 0)} g fibra`
        : ''
  return (
    <a
      href={href('recetas', r.receta.id)}
      className="relative flex flex-col gap-2 overflow-hidden rounded-[30px] px-5 py-4 text-noche transition-transform duration-150 ease-out active:scale-[0.98]"
      style={{ background: color.fondo }}
    >
      <span className="pointer-events-none absolute -top-10 -right-9 w-32" style={{ color: color.mancha }}>
        <Mancha className="w-32" />
      </span>
      <span className="relative text-[13px] font-bold">
        {[cocina && NOMBRE_ETIQUETA.get(cocina), `${r.receta.minutos} min`, destacado].filter(Boolean).join(' · ')}
      </span>
      <span className="relative flex items-start gap-2 pr-14 font-titulo text-[21px] leading-tight font-semibold">
        {r.receta.nombre}
        {r.receta.favorita && (
          <span className="mt-1 shrink-0 text-chili" aria-label="Favorita">
            <Icono nombre="corazon" tam={18} relleno />
          </span>
        )}
      </span>
      <div className="relative flex items-center gap-3">
        <div className="flex-1">
          <Barrita d={r.disponibilidad} />
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-noche text-crema">
          <Icono nombre="flecha" tam={18} />
        </span>
      </div>
    </a>
  )
}
