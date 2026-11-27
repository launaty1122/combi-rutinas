import { useState } from 'react'
import { Hoja } from '../../componentes/Hoja'
import { Icono, Mancha } from '../../componentes/Icono'
import { nombreVisible } from '../../datos/alimentos'
import { useCatalogo } from '../../datos/catalogo'
import { guardarEtiquetasReceta, useGruposEtiquetas } from '../../db/etiquetas'
import { useAlacena } from '../../db/alacena'
import { useBasicos, useSinCalorias } from '../../db/ajustes'
import { alternarFavorita, guardarNotas, guardarObjetivo, useReceta } from '../../db/recetas'
import { NOMBRE_ETIQUETA as NOMBRE_OBJETIVO, sugerirEtiquetas } from '../../logica/etiquetas'
import { escalarIngredientes, factorPorciones } from '../../logica/escalar'
import { carbohidratosNetos } from '../../logica/nutricion'
import { formatearNumero } from '../../logica/texto'
import type { Nutriente, Receta as TReceta } from '../../logica/tipos'
import { describirCantidad, formatearGramos } from '../../logica/unidades'
import { href } from '../../rutas'
import { CocineEsto, Contador } from './CocineEsto'
import { planearReceta, quitarPlaneada, usePlaneadas } from '../../db/mercado'
import { completarReceta, NUTRIENTES_INFO } from './datos'

export function Receta({ id }: { id: string }) {
  const receta = useReceta(id)
  if (receta === undefined) return <div className="fondo-receta min-h-dvh bg-fondo" />
  if (receta === null) {
    return (
      <div className="fondo-receta flex min-h-dvh flex-col items-center justify-center gap-4 bg-fondo p-8 text-center text-fondo-tinta">
        <p className="font-titulo text-2xl font-semibold">No encontré esta receta</p>
        <a href={href('recetas')} className="h-12 rounded-full bg-crema px-6 py-3 font-bold text-noche">
          Volver a recetas
        </a>
      </div>
    )
  }
  return <DetalleReceta key={receta.id} receta={receta} />
}

function valor(n: number | null, unidad: string, incompleto: boolean): string {
  if (n === null) return 'sin dato'
  const decimales = unidad === 'g' && n < 10 ? 1 : 0
  return `${incompleto ? '≥ ' : ''}${formatearNumero(n, decimales)}${unidad === 'kcal' ? '' : ` ${unidad}`}`
}

function DetalleReceta({ receta }: { receta: TReceta }) {
  const catalogo = useCatalogo()
  const alacena = useAlacena() ?? []
  const basicos = useBasicos()
  const sinCalorias = useSinCalorias()
  const { grupos, nombre: nombres } = useGruposEtiquetas()
  const planeada = usePlaneadas().find((p) => p.recetaId === receta.id)
  const [porciones, setPorciones] = useState(receta.porciones)
  const [verTodo, setVerTodo] = useState(false)
  const [cocinando, setCocinando] = useState(false)
  const [corrigiendo, setCorrigiendo] = useState(false)
  const [notas, setNotas] = useState(receta.notas ?? '')

  const ingredientes = escalarIngredientes(receta, porciones)
  const factor = factorPorciones(receta.porciones, porciones)
  const datos = completarReceta(receta, catalogo, alacena, basicos, ingredientes)
  const { porPorcion, incompletos } = datos.nutricion
  const etiquetasVisibles = receta.etiquetas.filter((e) => !e.startsWith('dificultad:'))
  const dificultad = receta.etiquetas.find((e) => e.startsWith('dificultad:'))
  const estadoPorAlimento = new Map(datos.disponibilidad.detalle.map((d) => [d.alimentoId, d]))

  const fichas: { k: Nutriente | 'netos'; nombre: string; v: string; fondo: string }[] = [
    { k: 'proteina', nombre: 'Proteína', v: valor(porPorcion.proteina, 'g', incompletos.has('proteina')), fondo: '#C9C2F7' },
    { k: 'fibra', nombre: 'Fibra', v: valor(porPorcion.fibra, 'g', incompletos.has('fibra')), fondo: '#AED140' },
    { k: 'netos', nombre: 'Carbos netos', v: valor(carbohidratosNetos(porPorcion), 'g', false), fondo: 'var(--pista)' },
    ...(sinCalorias
      ? []
      : [{ k: 'kcal' as const, nombre: 'kcal', v: valor(porPorcion.kcal, 'kcal', incompletos.has('kcal')), fondo: 'var(--pista)' }]),
  ]

  return (
    <div className="fondo-receta relative min-h-dvh overflow-x-hidden bg-fondo">
      <div className="relative h-52 text-fondo-tinta">
        <span className="pointer-events-none absolute -top-16 left-1/2 w-72 -translate-x-1/2 text-limon/70 dark:text-white/10">
          <Mancha className="w-72" />
        </span>
        <span className="absolute top-14 left-1/2 -translate-x-1/2">
          <Icono nombre="olla" tam={96} className="[stroke-width:1.4]" />
        </span>
        <a
          href={href('recetas')}
          aria-label="Volver a recetas"
          className="absolute top-5 left-4 flex size-12 items-center justify-center rounded-full bg-hoja text-tinta"
        >
          <Icono nombre="atras" />
        </a>
        <button
          type="button"
          onClick={() => alternarFavorita(receta.id)}
          aria-pressed={!!receta.favorita}
          aria-label={receta.favorita ? 'Quitar de favoritas' : 'Marcar como favorita'}
          className="absolute top-5 right-4 flex size-12 items-center justify-center rounded-full bg-hoja text-chili dark:text-rosa"
        >
          <Icono nombre="corazon" relleno={!!receta.favorita} />
        </button>
      </div>

      <main className="relative flex flex-col gap-5 rounded-t-hoja bg-hoja px-5 pt-6 pb-36 text-tinta">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {etiquetasVisibles.map((e) => (
              <span key={e} className="rounded-full bg-pista px-3 py-1 text-[13px] font-bold">
                {nombres.get(e) ?? e}
              </span>
            ))}
            {datos.objetivo.map((e) => (
              <span key={e} className="rounded-full bg-limon-verde px-3 py-1 text-[13px] font-bold text-noche">
                {NOMBRE_OBJETIVO[e.replace('objetivo:', '') as keyof typeof NOMBRE_OBJETIVO] ?? e}
              </span>
            ))}
            <button
              type="button"
              onClick={() => setCorrigiendo(true)}
              className="rounded-full px-2 py-1 text-[13px] font-bold text-tinta-suave underline underline-offset-2"
            >
              editar etiquetas
            </button>
          </div>
          <h1 className="font-titulo text-[28px] leading-tight font-semibold">{receta.nombre}</h1>
          <p className="text-sm font-semibold text-tinta-suave">
            {receta.minutos} min · {receta.porciones} {receta.porciones === 1 ? 'porción' : 'porciones'}
            {dificultad && nombres.get(dificultad) ? ` · ${nombres.get(dificultad)}` : ''}
          </p>
        </div>

        <div className="rounded-[26px_26px_26px_8px] bg-verde-claro px-4 py-3.5 text-noche">
          <p className="text-[15px] leading-relaxed">{receta.ficha}</p>
        </div>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-titulo text-xl font-semibold">Por porción</h2>
            <button type="button" onClick={() => setVerTodo((v) => !v)} className="text-sm font-bold underline underline-offset-2">
              {verTodo ? 'Ver menos' : 'Ver todo'}
            </button>
          </div>
          <div className={`grid gap-2 ${fichas.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {fichas.map((f) => (
              <div key={f.k} className="flex flex-col items-center rounded-[22px] px-1 py-2.5 text-center" style={{ background: f.fondo }}>
                <span
                  className={`font-titulo text-[19px] leading-tight font-semibold tabular-nums ${f.fondo.startsWith('#') ? 'text-noche' : ''}`}
                >
                  {f.v}
                </span>
                <span className={`text-xs font-bold ${f.fondo.startsWith('#') ? 'text-noche' : ''}`}>{f.nombre}</span>
              </div>
            ))}
          </div>
          {verTodo && (
            <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 rounded-[22px] bg-tarjeta px-4 py-3 text-[15px]">
              {NUTRIENTES_INFO.filter((n) => !(sinCalorias && n.k === 'kcal')).map((n) => (
                <div key={n.k} className="contents">
                  <dt>{n.nombre}</dt>
                  <dd className={`text-right tabular-nums ${porPorcion[n.k] === null ? 'text-tinta-suave' : 'font-semibold'}`}>
                    {valor(porPorcion[n.k], n.unidad, incompletos.has(n.k))}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <p className="text-xs text-tinta-suave">
            Valores aproximados, calculados con las tablas TACO y USDA.
            {incompletos.size > 0 && ' "≥" significa que a algún ingrediente le falta ese dato.'}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-titulo text-xl font-semibold">Ingredientes</h2>
            <span className="text-sm font-bold text-tinta-suave">
              {datos.disponibilidad.total === 0 ? 'Solo básicos' : `Tienes ${datos.disponibilidad.tengo} de ${datos.disponibilidad.total}`}
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {ingredientes.map((ing, n) => {
              const a = catalogo.porId.get(ing.alimentoId)
              const d = estadoPorAlimento.get(ing.alimentoId)
              const estado = d?.estado ?? 'falta'
              const cantidad = factor === 1 ? ing.texto : a ? describirCantidad(ing.gramos, a.porciones, a.liquido) : ''
              return (
                <li key={`${ing.alimentoId}-${n}`} className="flex items-center gap-3 py-1">
                  <EstadoIcono estado={estado} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{a ? nombreVisible(a) : 'Alimento desconocido'}</span>
                    <span className="block text-[13px] text-tinta-suave">
                      {cantidad}
                      {estado === 'poco' && d && (
                        <strong className="text-tinta"> · te faltan {formatearGramos(d.faltan, a?.liquido)}</strong>
                      )}
                      {estado === 'falta' && <strong className="text-tinta"> · no tienes</strong>}
                      {estado === 'basico' && ' · básico'}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        {datos.disponibilidad.faltantes > 0 || planeada ? (
          <div className="flex flex-wrap items-center gap-2 rounded-[22px] bg-tarjeta px-4 py-3">
            <p className="min-w-0 flex-1 text-sm">
              {planeada
                ? `En tu semana (${planeada.porciones} porc.): lo que falta aparece en el Mercado.`
                : 'Agrégala a tu semana y te digo en el Mercado qué te falta comprar.'}
            </p>
            <button
              type="button"
              onClick={() => (planeada && planeada.porciones === porciones ? quitarPlaneada(receta.id) : planearReceta(receta.id, porciones))}
              className={`h-11 shrink-0 rounded-full px-4 text-sm font-bold ${planeada && planeada.porciones === porciones ? 'bg-pista' : 'bg-noche text-crema dark:bg-limon-verde dark:text-noche'}`}
            >
              {planeada ? (planeada.porciones === porciones ? 'Quitar' : `Cambiar a ${porciones} porc.`) : 'Planear para el mercado'}
            </button>
          </div>
        ) : null}

        <section className="flex flex-col gap-3">
          <h2 className="font-titulo text-xl font-semibold">Preparación</h2>
          <ol className="flex flex-col gap-3">
            {receta.pasos.map((p, n) => (
              <li key={n} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-calabaza font-titulo font-semibold text-noche">
                  {n + 1}
                </span>
                <p className="pt-1 leading-relaxed">{p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-2">
          <label htmlFor="notas" className="font-titulo text-xl font-semibold">
            Mis notas
          </label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onBlur={() => guardarNotas(receta.id, notas)}
            rows={3}
            placeholder="Ej.: le puse más limón y quedó mejor."
            className="rounded-[20px] bg-pista px-4 py-3 outline-none placeholder:text-tinta-suave focus-visible:ring-3 focus-visible:ring-limon"
          />
          {receta.fuente && <p className="text-xs text-tinta-suave">Fuente: {receta.fuente}</p>}
        </section>
      </main>

      <div className="fixed inset-x-4 bottom-4 z-20 mx-auto flex h-[68px] max-w-md items-center gap-2 rounded-full bg-nav px-2 text-nav-icono shadow-[0_10px_30px_rgba(16,37,30,0.25)]">
        <Contador valor={porciones} alCambiar={setPorciones} oscuro />
        <button
          type="button"
          onClick={() => setCocinando(true)}
          className="h-[52px] flex-1 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Cociné esto
        </button>
      </div>

      <Hoja abierta={cocinando} titulo="Cociné esto" alCerrar={() => setCocinando(false)}>
        <CocineEsto
          receta={receta}
          porcionesIniciales={porciones}
          alacena={alacena}
          basicos={basicos}
          catalogo={catalogo}
          alTerminar={() => setCocinando(false)}
        />
      </Hoja>

      <Hoja abierta={corrigiendo} titulo="Etiquetas" alCerrar={() => setCorrigiendo(false)}>
        <EtiquetasReceta receta={receta} grupos={grupos} />
        <h3 className="mt-6 mb-2 font-titulo text-lg font-semibold">Objetivo</h3>
        <CorregirObjetivo receta={receta} sugeridas={sugerirEtiquetas(porPorcion).map((e) => `objetivo:${e}`)} actuales={datos.objetivo} />
      </Hoja>
    </div>
  )
}

function EstadoIcono({ estado }: { estado: string }) {
  const estilo =
    estado === 'tengo'
      ? { fondo: '#165F47', color: '#F3F5E2', icono: 'check' as const, texto: 'Lo tienes' }
      : estado === 'poco'
        ? { fondo: '#F6C817', color: '#10251E', icono: 'alerta' as const, texto: 'No te alcanza' }
        : estado === 'basico'
          ? { fondo: 'var(--pista)', color: 'var(--tinta-suave)', icono: 'check' as const, texto: 'Básico' }
          : { fondo: 'var(--pista)', color: 'var(--tinta)', icono: 'cerrar' as const, texto: 'No lo tienes' }
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full"
      style={{ background: estilo.fondo, color: estilo.color }}
      role="img"
      aria-label={estilo.texto}
    >
      <Icono nombre={estilo.icono} tam={15} className="[stroke-width:3.2]" />
    </span>
  )
}

function CorregirObjetivo({ receta, sugeridas, actuales }: { receta: TReceta; sugeridas: string[]; actuales: string[] }) {
  const [elegidas, setElegidas] = useState(actuales)
  const todas = Object.entries(NOMBRE_OBJETIVO).map(([id, nombre]) => ({ id: `objetivo:${id}`, nombre }))
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-tinta-suave">
        La app las sugiere con la ficha nutricional (proteína ≥ 20 g, fibra ≥ 6 g y carbohidratos netos ≤ 15 g por
        porción). Si no te convencen, corrígelas.
      </p>
      <div className="flex flex-wrap gap-2">
        {todas.map((o) => {
          const on = elegidas.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => setElegidas((e) => (on ? e.filter((x) => x !== o.id) : [...e, o.id]))}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${on ? 'bg-limon-verde text-noche' : 'bg-pista'}`}
            >
              {o.nombre}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={() => guardarObjetivo(receta.id, elegidas)}
        className="h-13 rounded-full bg-limon-verde py-3.5 font-titulo text-lg font-semibold text-noche"
      >
        Guardar
      </button>
      {receta.objetivo && (
        <button
          type="button"
          onClick={() => {
            guardarObjetivo(receta.id, undefined)
            setElegidas(sugeridas)
          }}
          className="h-11 rounded-full font-bold text-tinta-suave"
        >
          Volver a las sugeridas
        </button>
      )}
    </div>
  )
}

function EtiquetasReceta({ receta, grupos }: { receta: TReceta; grupos: { id: string; nombre: string; opciones: { id: string; nombre: string }[] }[] }) {
  const alternar = (id: string) =>
    guardarEtiquetasReceta(
      receta.id,
      receta.etiquetas.includes(id) ? receta.etiquetas.filter((e) => e !== id) : [...receta.etiquetas, id],
    )
  return (
    <div className="flex flex-col gap-4">
      {grupos.map((g) => (
        <fieldset key={g.id}>
          <legend className="mb-2 font-titulo text-lg font-semibold">{g.nombre}</legend>
          <div className="flex flex-wrap gap-2">
            {g.opciones.map((o) => {
              const on = receta.etiquetas.includes(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => alternar(o.id)}
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
