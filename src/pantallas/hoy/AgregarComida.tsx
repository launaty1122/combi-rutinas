import { useEffect, useState } from 'react'
import { BotonDictado } from '../../componentes/Dictado'
import { Icono } from '../../componentes/Icono'
import { SelectorCantidad, useSelectorCantidad } from '../../componentes/SelectorCantidad'
import { nombreVisible } from '../../datos/alimentos'
import type { Catalogo } from '../../datos/catalogo'
import { frecuentes, registrar, useComidasGuardadas } from '../../db/diario'
import { MOMENTOS } from '../../logica/diario'
import { normalizar, formatearNumero } from '../../logica/texto'
import { interpretarTexto, type ParteInterpretada } from '../../logica/texto-comida'
import type { Alimento, ItemComida, MomentoComida, Receta } from '../../logica/tipos'
import { describirCantidad } from '../../logica/unidades'
import { BuscarAlimento } from '../alacena/BuscarAlimento'
import { CrearAlimento } from '../alacena/CrearAlimento'
import { Contador } from '../recetas/CocineEsto'

type Pestana = 'buscar' | 'recetas' | 'guardadas' | 'escribir'

const NOMBRE_MANO = { palma: 'una palma', puno: 'un puño', punado: 'un puñado', pulgar: 'un pulgar' } as const

interface Props {
  fecha: string
  momentoInicial: MomentoComida
  catalogo: Catalogo
  recetas: Receta[]
  alTerminar: (mensaje: string) => void
}

const botonPrincipal =
  'h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-45'

/** Hoja para anotar lo que comiste: buscando, desde una receta, una comida guardada o escribiendo. */
export function AgregarComida({ fecha, momentoInicial, catalogo, recetas, alTerminar }: Props) {
  const [momento, setMomento] = useState<MomentoComida>(momentoInicial)
  const [pestana, setPestana] = useState<Pestana>('buscar')
  const [alimento, setAlimento] = useState<Alimento | null>(null)
  const [receta, setReceta] = useState<Receta | null>(null)
  const [creando, setCreando] = useState<string | null>(null)
  const fuentes = { alimentos: catalogo.porId, recetas: new Map(recetas.map((r) => [r.id, r])) }

  async function anotar(items: ItemComida[]) {
    let n = 0
    for (const item of items) if (await registrar(fecha, momento, item, fuentes)) n++
    const nombreMomento = MOMENTOS.find((m) => m.id === momento)?.nombre.toLowerCase()
    alTerminar(n === 1 ? `Anotado en ${nombreMomento}` : `${n} cosas anotadas en ${nombreMomento}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]" role="radiogroup" aria-label="¿En qué comida?">
        {MOMENTOS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={momento === m.id}
            onClick={() => setMomento(m.id)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors duration-150 ${
              momento === m.id ? 'text-noche' : 'bg-pista'
            }`}
            style={momento === m.id ? { background: m.color } : undefined}
          >
            {m.nombre}
          </button>
        ))}
      </div>

      {alimento ? (
        <CantidadAlimento alimento={alimento} alGuardar={(gramos) => anotar([{ tipo: 'alimento', alimentoId: alimento.id, gramos }])} alVolver={() => setAlimento(null)} />
      ) : receta ? (
        <PorcionesReceta receta={receta} alGuardar={(porciones) => anotar([{ tipo: 'receta', recetaId: receta.id, porciones }])} alVolver={() => setReceta(null)} />
      ) : creando !== null ? (
        <CrearAlimento
          nombreInicial={creando}
          alGuardar={(a) => {
            setCreando(null)
            setAlimento(a)
          }}
        />
      ) : (
        <>
          <div role="tablist" className="grid grid-cols-4 gap-1 rounded-full bg-pista p-1">
            {(
              [
                ['buscar', 'Buscar'],
                ['recetas', 'Recetas'],
                ['guardadas', 'Guardadas'],
                ['escribir', 'Escribir'],
              ] as [Pestana, string][]
            ).map(([id, txt]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                onClick={() => setPestana(id)}
                className={`h-10 rounded-full text-[13px] font-bold transition-colors duration-200 ${
                  pestana === id ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''
                }`}
              >
                {txt}
              </button>
            ))}
          </div>

          {pestana === 'buscar' && (
            <>
              <Frecuentes catalogo={catalogo} recetas={fuentes.recetas} alAnotar={(i) => anotar([i])} />
              <BuscarAlimento catalogo={catalogo} alElegir={setAlimento} alCrear={setCreando} />
            </>
          )}
          {pestana === 'recetas' && <ElegirReceta recetas={recetas} alElegir={setReceta} />}
          {pestana === 'guardadas' && <Guardadas alAnotar={(items) => anotar(items)} />}
          {pestana === 'escribir' && <Escribir catalogo={catalogo} alMomento={setMomento} alAnotar={(items) => anotar(items)} />}
        </>
      )}
    </div>
  )
}

function CantidadAlimento({ alimento, alGuardar, alVolver }: { alimento: Alimento; alGuardar: (g: number) => void; alVolver: () => void }) {
  const c = useSelectorCantidad(alimento, alimento.porciones[0]?.gramos)
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (c.gramos > 0) alGuardar(c.gramos)
      }}
    >
      <p className="font-titulo text-xl font-semibold">{nombreVisible(alimento)}</p>
      <SelectorCantidad alimento={alimento} estado={c} etiqueta="¿Cuánto comiste?" />
      <button type="submit" disabled={c.gramos <= 0} className={botonPrincipal}>
        Anotar
      </button>
      <button type="button" onClick={alVolver} className="h-11 font-bold text-tinta-suave">
        Elegir otro
      </button>
    </form>
  )
}

function PorcionesReceta({ receta, alGuardar, alVolver }: { receta: Receta; alGuardar: (p: number) => void; alVolver: () => void }) {
  const [porciones, setPorciones] = useState(1)
  const [medias, setMedias] = useState(false)
  const valor = medias ? porciones - 0.5 : porciones
  return (
    <div className="flex flex-col gap-5">
      <p className="font-titulo text-xl font-semibold">{receta.nombre}</p>
      <div className="flex items-center justify-between gap-3 rounded-[24px] bg-pista p-2 pl-5">
        <span className="font-bold">¿Cuántas porciones?</span>
        <Contador valor={porciones} alCambiar={setPorciones} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={medias} onChange={(e) => setMedias(e.target.checked)} className="size-5 accent-finca" />
        Fue media porción menos ({formatearNumero(valor, 1)} en total)
      </label>
      <button type="button" disabled={valor <= 0} onClick={() => alGuardar(valor)} className={botonPrincipal}>
        Anotar
      </button>
      <button type="button" onClick={alVolver} className="h-11 font-bold text-tinta-suave">
        Elegir otra
      </button>
    </div>
  )
}

function Frecuentes({
  catalogo,
  recetas,
  alAnotar,
}: {
  catalogo: Catalogo
  recetas: Map<string, Receta>
  alAnotar: (i: ItemComida) => void
}) {
  const [lista, setLista] = useState<ItemComida[]>([])
  useEffect(() => {
    frecuentes().then(setLista)
  }, [])
  if (lista.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold">Lo que más comes (un toque y queda anotado)</p>
      <div className="flex flex-wrap gap-2">
        {lista.map((i) => {
          const a = i.tipo === 'alimento' ? catalogo.porId.get(i.alimentoId) : undefined
          const r = i.tipo === 'receta' ? recetas.get(i.recetaId) : undefined
          if (!a && !r) return null
          const texto = a
            ? `${nombreVisible(a)} · ${describirCantidad(i.tipo === 'alimento' ? i.gramos : 0, a.porciones, a.liquido)}`
            : `${r!.nombre} · ${i.tipo === 'receta' ? i.porciones : 1} porc.`
          return (
            <button
              key={a?.id ?? r!.id}
              type="button"
              onClick={() => alAnotar(i)}
              className="min-h-10 rounded-full bg-verde-claro px-4 text-left text-sm font-semibold text-noche"
            >
              {texto}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ElegirReceta({ recetas, alElegir }: { recetas: Receta[]; alElegir: (r: Receta) => void }) {
  const [q, setQ] = useState('')
  const lista = recetas
    .filter((r) => normalizar(r.nombre).includes(normalizar(q)))
    .sort((a, b) => Number(!!b.favorita) - Number(!!a.favorita) || a.nombre.localeCompare(b.nombre, 'es'))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-13 items-center gap-3 rounded-full bg-pista px-5">
        <Icono nombre="buscar" className="text-tinta-suave" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar receta"
          aria-label="Buscar receta"
          className="min-w-0 flex-1 bg-transparent py-3.5 outline-none placeholder:text-tinta-suave"
        />
      </label>
      <ul className="flex flex-col">
        {lista.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => alElegir(r)} className="flex w-full items-center gap-2 rounded-2xl px-2 py-2.5 text-left font-semibold active:bg-pista">
              {r.favorita && <Icono nombre="corazon" relleno tam={16} className="text-chili" />}
              {r.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Guardadas({ alAnotar }: { alAnotar: (items: ItemComida[]) => void }) {
  const guardadas = useComidasGuardadas()
  if (guardadas.length === 0) {
    return (
      <p className="px-1 text-sm text-tinta-suave">
        Todavía no tienes comidas guardadas. En Hoy, en cualquier comida, toca "Guardar" para volverla tu combinación de siempre.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {guardadas.map((g) => (
        <li key={g.id}>
          <button
            type="button"
            onClick={() => alAnotar(g.items)}
            className="flex w-full items-center justify-between gap-3 rounded-[20px] bg-tarjeta px-4 py-3 text-left"
          >
            <span>
              <span className="block font-bold">{g.nombre}</span>
              <span className="block text-[13px] text-tinta-suave">{g.items.length} cosas</span>
            </span>
            <Icono nombre="agregar" />
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Escribir lo que comiste en una frase; la app propone y tú confirmas. */
function Escribir({
  catalogo,
  alMomento,
  alAnotar,
}: {
  catalogo: Catalogo
  alMomento: (m: MomentoComida) => void
  alAnotar: (items: ItemComida[]) => void
}) {
  const [texto, setTexto] = useState('')
  const [partes, setPartes] = useState<ParteInterpretada[] | null>(null)
  // Índice de la parte que se está buscando a mano (cuando no la encontró o no era).
  const [buscandoParte, setBuscandoParte] = useState<number | null>(null)

  if (partes && buscandoParte !== null) {
    const p = partes[buscandoParte]
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">
          Busca el alimento para <strong>"{p.texto}"</strong>
        </p>
        <BuscarAlimento
          catalogo={catalogo}
          consultaInicial={
            // La primera palabra con sentido: "pollo teriyaki" → "pollo"; "un bowl de quinoa" → "quinoa".
            p.texto
              .split(' ')
              .find((w) => w.length > 2 && !/^\d/.test(w) && !['una', 'uno', 'bowl', 'plato', 'porcion', 'del', 'con'].includes(w)) ?? ''
          }
          alElegir={(a) => {
            const porcion = a.porciones[0]
            const fraccion = porcion?.nombre.startsWith('½') ? 0.5 : porcion?.nombre.startsWith('¼') ? 0.25 : 1
            setPartes(
              partes.map((x, k) =>
                k === buscandoParte
                  ? {
                      ...x,
                      alimento: a,
                      aproximado: false,
                      // Si dijiste cuánto en gramos se respeta; si no, una porción del alimento elegido.
                      gramos: x.seguro && x.alimento ? x.gramos : porcion ? (x.cantidad * porcion.gramos) / fraccion : x.gramos,
                      seguro: x.seguro && !!x.alimento ? true : !!porcion,
                    }
                  : x,
              ),
            )
            setBuscandoParte(null)
          }}
        />
        <button type="button" onClick={() => setBuscandoParte(null)} className="h-11 font-bold text-tinta-suave">
          Volver
        </button>
      </div>
    )
  }

  if (partes) {
    const validas = partes.filter((p) => p.alimento && p.gramos > 0)
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-tinta-suave">Revisa y corrige si hace falta:</p>
        <ul className="flex flex-col gap-2">
          {partes.map((p, i) => (
            <li key={i} className="rounded-[20px] bg-tarjeta px-4 py-3">
              <p className="text-[13px] text-tinta-suave">"{p.texto}"</p>
              {p.alimento ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-bold">{nombreVisible(p.alimento)}</span>
                  <label className="flex h-10 w-28 items-center rounded-xl bg-pista pr-2 focus-within:ring-3 focus-within:ring-limon">
                    <input
                      inputMode="decimal"
                      value={String(p.gramos)}
                      onChange={(e) => {
                        const g = Number(e.target.value.replace(',', '.'))
                        setPartes(partes.map((x, k) => (k === i ? { ...x, gramos: Number.isFinite(g) ? g : 0, seguro: true } : x)))
                      }}
                      aria-label={`Gramos de ${nombreVisible(p.alimento)}`}
                      className="w-full min-w-0 bg-transparent px-2 text-right tabular-nums outline-none"
                    />
                    <span className="text-xs text-tinta-suave">{p.alimento.liquido ? 'ml' : 'g'}</span>
                  </label>
                </div>
              ) : (
                <p className="mt-1 text-sm font-bold">No encontré este alimento.</p>
              )}
              {p.aproximado && p.alimento && (
                <p className="mt-1 text-xs font-bold">No tengo "{p.texto}" tal cual: puse lo más parecido. Revísalo.</p>
              )}
              {p.mano && p.alimento && (
                <p className="mt-1 text-xs">
                  Medida con la mano ({NOMBRE_MANO[p.mano]}): unos {Math.round(p.gramos)} {p.alimento.liquido ? 'ml' : 'g'}. Cada mano es distinta: ajústalo si quieres.
                </p>
              )}
              {!p.seguro && p.alimento && <p className="mt-1 text-xs font-bold">Revisa la cantidad: es un cálculo aproximado.</p>}
              <button
                type="button"
                onClick={() => setBuscandoParte(i)}
                className={`mt-2 flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold ${
                  p.alimento ? 'bg-pista' : 'bg-noche text-crema dark:bg-limon-verde dark:text-noche'
                }`}
              >
                <Icono nombre="buscar" tam={14} /> {p.alimento ? 'Buscar otro' : 'Buscarlo'}
              </button>
              {p.alternativas.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="self-center text-xs text-tinta-suave">¿O era…?</span>
                  {p.alternativas.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setPartes(partes.map((x, k) => (k === i ? { ...x, alimento: a, alternativas: [p.alimento!, ...p.alternativas.filter((y) => y !== a)].filter(Boolean) } : x)))}
                      className="min-h-9 rounded-full bg-pista px-3 text-xs font-semibold"
                    >
                      {nombreVisible(a)}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={validas.length === 0}
          onClick={() => alAnotar(validas.map((p) => ({ tipo: 'alimento', alimentoId: p.alimento!.id, gramos: p.gramos })))}
          className={botonPrincipal}
        >
          Anotar {validas.length === 1 ? '1 cosa' : `${validas.length} cosas`}
        </button>
        <button type="button" onClick={() => setPartes(null)} className="h-11 font-bold text-tinta-suave">
          Volver a escribir
        </button>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        const r = interpretarTexto(texto, catalogo.buscar)
        if (r.momento) alMomento(r.momento)
        setPartes(r.partes)
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">¿Qué comiste?</span>
        <textarea
          autoFocus
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Ej.: dos huevos y una tajada de pan en el desayuno"
          className="rounded-[20px] bg-pista px-4 py-3 outline-none placeholder:text-tinta-suave focus-visible:ring-3 focus-visible:ring-limon"
        />
      </label>
      <BotonDictado alTexto={(t) => setTexto(t)} />
      <p className="text-xs text-tinta-suave">
        Escríbelo todo junto, como lo dirías: "3 cucharadas de arroz, ensalada y 2 pedazos de cerdo". Si no sabes cuánto, usa tu mano: <strong>palma</strong> (carne), <strong>puño</strong> (≈ 1 taza), <strong>puñado</strong> o <strong>pulgar</strong> (grasas).
      </p>
      <button type="submit" disabled={!texto.trim()} className={botonPrincipal}>
        Entender
      </button>
    </form>
  )
}
