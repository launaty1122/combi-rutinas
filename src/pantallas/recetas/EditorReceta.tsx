import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { SelectorCantidad, useSelectorCantidad } from '../../componentes/SelectorCantidad'
import { SelectorEtiquetas } from '../../componentes/SelectorEtiquetas'
import { nombreVisible } from '../../datos/alimentos'
import type { Catalogo } from '../../datos/catalogo'
import { nuevoId } from '../../db/db'
import { useGruposEtiquetas } from '../../db/etiquetas'
import { borrarReceta, guardarReceta } from '../../db/recetas'
import { nutricionReceta } from '../../logica/nutricion'
import { formatearNumero } from '../../logica/texto'
import type { Alimento, IngredienteReceta, Receta } from '../../logica/tipos'
import { formatearGramos, nombrePorcion } from '../../logica/unidades'
import { BuscarAlimento } from '../alacena/BuscarAlimento'
import { Contador } from './CocineEsto'

const botonPrincipal =
  'h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-45'
const campo = 'rounded-2xl bg-pista px-4 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon'

/**
 * Crear o editar una receta a mano, sin IA: nombre, porciones, ingredientes
 * (con el mismo buscador y las mismas cantidades de toda la app), pasos, textico y etiquetas.
 * La ficha nutricional se calcula sola mientras escribes.
 */
export function EditorReceta({
  catalogo,
  inicial,
  alTerminar,
}: {
  catalogo: Catalogo
  inicial?: Receta
  alTerminar: (receta: Receta | null) => void
}) {
  const { grupos } = useGruposEtiquetas()
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [porciones, setPorciones] = useState(inicial?.porciones ?? 1)
  const [minutos, setMinutos] = useState(inicial ? String(inicial.minutos) : '')
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>(inicial?.ingredientes ?? [])
  const [pasos, setPasos] = useState<string[]>(inicial?.pasos.length ? inicial.pasos : [''])
  const [ficha, setFicha] = useState(inicial?.ficha ?? '')
  const [etiquetas, setEtiquetas] = useState<string[]>(inicial?.etiquetas ?? [])
  const [fuente, setFuente] = useState(inicial?.fuente ?? '')
  // Sub-pantallas: buscar un ingrediente, poner su cantidad, o editar uno existente.
  const [buscando, setBuscando] = useState(false)
  const [cantidadDe, setCantidadDe] = useState<{ alimento: Alimento; indice: number | null } | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const borrador: Pick<Receta, 'ingredientes' | 'porciones'> = { ingredientes, porciones }
  const nut = nutricionReceta(borrador, catalogo.porId).porPorcion
  const valido = nombre.trim() !== '' && ingredientes.length > 0

  if (buscando) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold">Agregar ingrediente</p>
        <BuscarAlimento
          catalogo={catalogo}
          alElegir={(a) => {
            setBuscando(false)
            setCantidadDe({ alimento: a, indice: null })
          }}
        />
        <button type="button" onClick={() => setBuscando(false)} className="h-11 font-bold text-tinta-suave">
          Volver a la receta
        </button>
      </div>
    )
  }

  if (cantidadDe) {
    const previo = cantidadDe.indice !== null ? ingredientes[cantidadDe.indice] : undefined
    return (
      <CantidadIngrediente
        alimento={cantidadDe.alimento}
        gramosIniciales={previo?.gramos}
        alGuardar={(ing) => {
          setIngredientes((lista) =>
            cantidadDe.indice === null ? [...lista, ing] : lista.map((x, k) => (k === cantidadDe.indice ? ing : x)),
          )
          setCantidadDe(null)
        }}
        alQuitar={
          cantidadDe.indice !== null
            ? () => {
                setIngredientes((lista) => lista.filter((_, k) => k !== cantidadDe.indice))
                setCantidadDe(null)
              }
            : undefined
        }
        alVolver={() => setCantidadDe(null)}
      />
    )
  }

  async function guardar() {
    if (!valido) return
    const receta: Receta = {
      ...(inicial ?? {}),
      id: inicial?.id ?? nuevoId('mia-'),
      nombre: nombre.trim(),
      porciones,
      minutos: Math.max(0, Number(minutos.replace(',', '.')) || 0),
      ingredientes,
      pasos: pasos.map((p) => p.trim()).filter(Boolean),
      ficha: ficha.trim(),
      etiquetas,
      fuente: fuente.trim() || (inicial ? inicial.fuente : 'Mi receta'),
    }
    await guardarReceta(receta)
    alTerminar(receta)
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        void guardar()
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Arepa de mi mamá" className={`h-12 ${campo}`} />
      </label>

      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Porciones que rinde</span>
          <div className="self-start rounded-full bg-pista">
            <Contador valor={porciones} alCambiar={setPorciones} />
          </div>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Minutos
          <input inputMode="numeric" value={minutos} onChange={(e) => setMinutos(e.target.value)} placeholder="20" className={`h-12 w-24 text-center tabular-nums ${campo}`} />
        </label>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="font-titulo text-lg font-semibold">Ingredientes (para toda la receta)</h3>
        {ingredientes.length > 0 && (
          <ul className="flex flex-col rounded-[22px] bg-tarjeta py-1">
            {ingredientes.map((ing, k) => {
              const a = catalogo.porId.get(ing.alimentoId)
              return (
                <li key={`${ing.alimentoId}-${k}`}>
                  <button
                    type="button"
                    onClick={() => a && setCantidadDe({ alimento: a, indice: k })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{a ? nombreVisible(a) : 'Alimento desconocido'}</span>
                      <span className="block text-[13px] text-tinta-suave">{ing.texto}</span>
                    </span>
                    <span className="text-[13px] font-bold underline underline-offset-2">editar</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <button type="button" onClick={() => setBuscando(true)} className="flex min-h-11 items-center gap-2 self-start rounded-full bg-pista px-4 text-sm font-bold">
          <Icono nombre="agregar" tam={16} /> Agregar ingrediente
        </button>
      </section>

      {ingredientes.length > 0 && (
        <div className="grid grid-cols-3 gap-2" aria-label="Por porción">
          {[
            ['Proteína', nut.proteina, 'g', '#C9C2F7'],
            ['Fibra', nut.fibra, 'g', '#AED140'],
            ['kcal', nut.kcal, '', 'var(--pista)'],
          ].map(([n, v, u, c]) => (
            <div key={n as string} className="flex flex-col items-center rounded-[20px] py-2.5" style={{ background: c as string }}>
              <span className={`font-titulo text-lg font-semibold tabular-nums ${(c as string).startsWith('#') ? 'text-noche' : ''}`}>
                {v === null ? '—' : `${formatearNumero(v as number, 0)}${u ? ` ${u}` : ''}`}
              </span>
              <span className={`text-xs font-bold ${(c as string).startsWith('#') ? 'text-noche' : ''}`}>{n} / porción</span>
            </div>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-titulo text-lg font-semibold">Preparación</h3>
        {pasos.map((p, k) => (
          <div key={k} className="flex items-start gap-2">
            <span className="mt-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-calabaza font-titulo font-semibold text-noche">{k + 1}</span>
            <textarea
              value={p}
              onChange={(e) => setPasos((l) => l.map((x, j) => (j === k ? e.target.value : x)))}
              rows={2}
              aria-label={`Paso ${k + 1}`}
              placeholder={k === 0 ? 'Ej.: Bate los huevos con una pizca de sal.' : 'Siguiente paso…'}
              className={`flex-1 py-2.5 ${campo}`}
            />
            {pasos.length > 1 && (
              <button
                type="button"
                onClick={() => setPasos((l) => l.filter((_, j) => j !== k))}
                aria-label={`Quitar paso ${k + 1}`}
                className="mt-1.5 flex size-10 items-center justify-center rounded-full text-tinta-suave"
              >
                <Icono nombre="cerrar" tam={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setPasos((l) => [...l, ''])} className="flex min-h-11 items-center gap-2 self-start rounded-full bg-pista px-4 text-sm font-bold">
          <Icono nombre="agregar" tam={16} /> Agregar paso
        </button>
      </section>

      <label className="flex flex-col gap-1.5 text-sm font-bold">
        El textico (opcional)
        <textarea
          value={ficha}
          onChange={(e) => setFicha(e.target.value)}
          rows={3}
          placeholder="Qué es y qué te aporta, con cariño. Ej.: El desayuno de los domingos: proteína para arrancar el día."
          className={`py-3 font-normal ${campo}`}
        />
      </label>

      <section className="flex flex-col gap-2">
        <h3 className="font-titulo text-lg font-semibold">Etiquetas</h3>
        <SelectorEtiquetas
          grupos={grupos}
          elegidas={etiquetas}
          alAlternar={(id) => setEtiquetas((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))}
        />
      </section>

      <label className="flex flex-col gap-1.5 text-sm font-bold">
        De dónde salió (opcional)
        <input value={fuente} onChange={(e) => setFuente(e.target.value)} placeholder="Mi mamá, TikTok de @…" className={`h-12 ${campo}`} />
      </label>

      <button type="submit" disabled={!valido} className={botonPrincipal}>
        {inicial ? 'Guardar cambios' : 'Guardar receta'}
      </button>
      {!valido && <p className="-mt-3 text-center text-xs text-tinta-suave">Ponle un nombre y al menos un ingrediente.</p>}

      {inicial &&
        (confirmarBorrado ? (
          <div role="alertdialog" aria-label="Confirmar borrado" className="flex flex-col gap-3 rounded-[22px] bg-rosa-claro p-4 text-noche">
            <p className="text-sm">
              ¿Borrar <strong>{inicial.nombre}</strong>? No se puede deshacer (salvo con un backup). Lo que ya anotaste en tu diario no se borra.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setConfirmarBorrado(false)} className="h-11 rounded-full bg-crema font-bold">
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await borrarReceta(inicial.id)
                  alTerminar(null)
                }}
                className="h-11 rounded-full bg-noche font-bold text-crema"
              >
                Borrar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmarBorrado(true)}
            className="flex h-12 items-center justify-center gap-2 rounded-full font-bold text-chili dark:text-rosa-claro"
          >
            <Icono nombre="basura" tam={20} /> Borrar receta
          </button>
        ))}
    </form>
  )
}

/** Cantidad de un ingrediente con las mismas unidades de toda la app; el texto se arma solo ("2 huevos"). */
function CantidadIngrediente({
  alimento,
  gramosIniciales,
  alGuardar,
  alQuitar,
  alVolver,
}: {
  alimento: Alimento
  gramosIniciales?: number
  alGuardar: (ing: IngredienteReceta) => void
  alQuitar?: () => void
  alVolver: () => void
}) {
  // Igual que al anotar comida: si es nuevo, empieza en 1 porción ("1 huevo", "1 taza").
  const c = useSelectorCantidad(alimento, gramosIniciales ?? alimento.porciones[0]?.gramos)
  const numero = Number(c.texto.replace(',', '.'))
  const texto = c.porcion && numero > 0 ? nombrePorcion(c.porcion.nombre, numero) : formatearGramos(c.gramos, alimento.liquido)
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (c.gramos > 0) alGuardar({ alimentoId: alimento.id, gramos: c.gramos, texto })
      }}
    >
      <p className="font-titulo text-xl font-semibold">{nombreVisible(alimento)}</p>
      <SelectorCantidad alimento={alimento} estado={c} etiqueta="¿Cuánto lleva la receta completa?" />
      <button type="submit" disabled={c.gramos <= 0} className={botonPrincipal}>
        {alQuitar ? 'Guardar' : 'Agregar a la receta'}
      </button>
      {alQuitar && (
        <button type="button" onClick={alQuitar} className="flex h-12 items-center justify-center gap-2 rounded-full font-bold text-chili dark:text-rosa-claro">
          <Icono nombre="basura" tam={20} /> Quitar ingrediente
        </button>
      )}
      <button type="button" onClick={alVolver} className="h-11 font-bold text-tinta-suave">
        Volver a la receta
      </button>
    </form>
  )
}
