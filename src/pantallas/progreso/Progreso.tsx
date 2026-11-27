import { useMemo, useState } from 'react'
import { GraficoBarras, GraficoLinea } from '../../componentes/Graficos'
import { Hoja } from '../../componentes/Hoja'
import { Icono, Mancha } from '../../componentes/Icono'
import { Pantalla } from '../../componentes/Pantalla'
import { useSinCalorias } from '../../db/ajustes'
import { borrarMedida, guardarMedidas, useHistorial, useMedidas } from '../../db/medidas'
import { metaAgua, usePerfil } from '../../db/perfil'
import { gastoEstimado } from '../../logica/diario'
import { fechaCorta, hoyISO, sumarDias } from '../../logica/fechas'
import { leerNumero } from '../../logica/personales'
import { cambio, diasEntre, MEDIDAS, promedios, serieDe } from '../../logica/progreso'
import { formatearNumero } from '../../logica/texto'
import type { TipoMedida } from '../../logica/tipos'
import { BuscadorNutriente } from './BuscadorNutriente'

const COLOR_MEDIDA: Record<TipoMedida, string> = {
  cintura: '#C9C2F7',
  cadera: '#F7A8BC',
  brazo: '#F9DE7A',
  muslo: '#E3EA98',
  peso: '#CFE8F6',
}

type Hojas = null | { tipo: 'anotar' } | { tipo: 'medida'; medida: TipoMedida } | { tipo: 'nutriente' }

export function Progreso({ alAgregar }: { alAgregar: () => void }) {
  const medidas = useMedidas()
  const perfil = usePerfil()
  const sinCalorias = useSinCalorias()
  const [periodo, setPeriodo] = useState<7 | 30>(7)
  const [hoja, setHoja] = useState<Hojas>(null)
  const hoy = hoyISO()
  const desde = sumarDias(hoy, -(periodo - 1))
  const historial = useHistorial(desde, hoy)

  const dias = useMemo(() => (historial ? diasEntre(desde, hoy, historial.diario, historial.agua) : []), [historial, desde, hoy])
  const prom = promedios(dias)
  const gasto = gastoEstimado(perfil).total
  const series = useMemo(() => Object.fromEntries(MEDIDAS.map((m) => [m.tipo, serieDe(medidas, m.tipo)])) as Record<TipoMedida, { fecha: string; valor: number }[]>, [medidas])

  const graficas = [
    { id: 'proteina', nombre: 'Proteína', unidad: 'g', meta: perfil.metaProteina, color: 'var(--principal)', valores: dias.map((d) => ({ fecha: d.fecha, valor: d.proteina, conDatos: d.conComidas })), promedio: prom.proteina, decimales: 0 },
    { id: 'fibra', nombre: 'Fibra', unidad: 'g', meta: perfil.metaFibra, color: '#5E8A12', valores: dias.map((d) => ({ fecha: d.fecha, valor: d.fibra, conDatos: d.conComidas })), promedio: prom.fibra, decimales: 0 },
    { id: 'agua', nombre: 'Agua', unidad: 'L', meta: metaAgua(perfil) / 1000, color: '#2B7FB8', valores: dias.map((d) => ({ fecha: d.fecha, valor: d.aguaMl / 1000, conDatos: d.aguaMl > 0 })), promedio: prom.aguaMl === null ? null : prom.aguaMl / 1000, decimales: 1 },
    ...(sinCalorias
      ? []
      : [{ id: 'kcal', nombre: 'Calorías', unidad: 'kcal', meta: gasto, color: '#B8661A', valores: dias.map((d) => ({ fecha: d.fecha, valor: d.kcal, conDatos: d.conComidas })), promedio: prom.kcal, decimales: 0 }]),
  ]

  return (
    <Pantalla
      ruta="progreso"
      titulo="Progreso"
      subtitulo="Cómo vas, sin presión"
      alAgregar={alAgregar}
      accion={
        <button
          type="button"
          onClick={() => setHoja({ tipo: 'anotar' })}
          className="flex h-12 items-center gap-2 rounded-full bg-crema px-5 font-bold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Icono nombre="agregar" tam={20} /> Medidas
        </button>
      }
    >
      <div className="flex flex-col gap-7">
        <section className="flex flex-col gap-3" aria-label="Medidas">
          <h2 className="font-titulo text-xl font-semibold">Tus medidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {MEDIDAS.filter((m) => m.tipo !== 'peso').map((m) => {
              const s = series[m.tipo]
              const ultimo = s.at(-1)
              const c = cambio(s)
              return (
                <button
                  key={m.tipo}
                  type="button"
                  onClick={() => setHoja({ tipo: 'medida', medida: m.tipo })}
                  className="relative flex min-h-28 flex-col justify-between overflow-hidden rounded-[26px] p-4 text-left text-noche transition-transform duration-150 ease-out active:scale-[0.98]"
                  style={{ background: COLOR_MEDIDA[m.tipo] }}
                >
                  <Mancha className="pointer-events-none absolute -top-8 -right-8 w-24 text-white/35" />
                  <span className="relative text-sm font-bold">{m.nombre}</span>
                  <span className="relative">
                    <span className="block font-titulo text-[30px] leading-none font-semibold tabular-nums">
                      {ultimo ? formatearNumero(ultimo.valor, 1) : '—'}
                      <span className="text-base"> {m.unidad}</span>
                    </span>
                    <span className="mt-1 block text-xs">
                      {c ? `${c.diferencia > 0 ? '+' : ''}${formatearNumero(c.diferencia, 1)} desde ${fechaCorta(c.desde)}` : ultimo ? fechaCorta(ultimo.fecha) : 'Sin medir aún'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setHoja({ tipo: 'medida', medida: 'peso' })}
            className="flex flex-col gap-1 rounded-[26px] bg-tarjeta p-4 text-left"
          >
            <span className="flex items-baseline justify-between">
              <span className="text-sm font-bold">Peso</span>
              <span className="font-titulo text-2xl font-semibold tabular-nums">
                {series.peso.at(-1) ? `${formatearNumero(series.peso.at(-1)!.valor, 1)} kg` : '—'}
              </span>
            </span>
            {series.peso.length > 1 ? (
              <GraficoLinea puntos={series.peso} unidad="kg" />
            ) : (
              <span className="text-[13px] text-tinta-suave">Anota tu peso de vez en cuando para ver la línea. Tus medidas dicen más que el peso.</span>
            )}
          </button>
        </section>

        <section className="flex flex-col gap-4" aria-label="Tus comidas">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-titulo text-xl font-semibold">Tus comidas</h2>
            <div role="radiogroup" aria-label="Periodo" className="grid grid-cols-2 gap-1 rounded-full bg-pista p-1">
              {([7, 30] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={periodo === p}
                  onClick={() => setPeriodo(p)}
                  className={`h-9 rounded-full px-4 text-sm font-bold ${periodo === p ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''}`}
                >
                  {p === 7 ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          <p className="-mt-2 text-sm text-tinta-suave">
            {prom.diasConRegistro === 0
              ? 'Todavía no hay comidas anotadas en este periodo.'
              : `Promedio de los ${prom.diasConRegistro} ${prom.diasConRegistro === 1 ? 'día' : 'días'} con registro.`}
          </p>
          {graficas.map((g) => (
            <div key={g.id} className="rounded-[26px] bg-tarjeta px-4 pt-4 pb-2">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-titulo text-lg font-semibold">{g.nombre}</h3>
                <p className="text-sm tabular-nums">
                  <strong>{g.promedio === null ? '—' : formatearNumero(g.promedio, g.decimales)}</strong>
                  <span className="text-tinta-suave">
                    {' '}
                    / {formatearNumero(g.meta, g.decimales)} {g.unidad} al día
                  </span>
                </p>
              </div>
              <GraficoBarras dias={g.valores} meta={g.meta} unidad={g.unidad} color={g.color} decimales={g.decimales} />
            </div>
          ))}
          <p className="px-1 text-xs text-tinta-suave">Toca una barra para ver el valor de ese día. Los días sin registro aparecen vacíos, no en cero.</p>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-titulo text-xl font-semibold">Buscador por nutriente</h2>
            <p className="mt-1 text-sm text-tinta-suave">¿Qué alimentos tienen más fibra, hierro o proteína? Primero lo que ya tienes en casa.</p>
          </div>
          <button type="button" onClick={() => setHoja({ tipo: 'nutriente' })} className="flex h-12 items-center gap-2 self-start rounded-full bg-noche px-5 font-bold text-crema dark:bg-crema dark:text-noche">
            <Icono nombre="buscar" tam={18} /> Buscar por nutriente
          </button>
        </section>
      </div>

      <Hoja abierta={hoja?.tipo === 'anotar'} titulo="Anotar medidas" alCerrar={() => setHoja(null)}>
        {hoja?.tipo === 'anotar' && <AnotarMedidas alGuardar={() => setHoja(null)} />}
      </Hoja>

      <Hoja
        abierta={hoja?.tipo === 'medida'}
        titulo={hoja?.tipo === 'medida' ? (MEDIDAS.find((m) => m.tipo === hoja.medida)?.nombre ?? '') : ''}
        alCerrar={() => setHoja(null)}
      >
        {hoja?.tipo === 'medida' && (
          <DetalleMedida tipo={hoja.medida} medidas={medidas.filter((x) => x.tipo === hoja.medida)} alAnotar={() => setHoja({ tipo: 'anotar' })} />
        )}
      </Hoja>

      <Hoja abierta={hoja?.tipo === 'nutriente'} titulo="Buscador por nutriente" alCerrar={() => setHoja(null)}>
        {hoja?.tipo === 'nutriente' && <BuscadorNutriente />}
      </Hoja>
    </Pantalla>
  )
}

function AnotarMedidas({ alGuardar }: { alGuardar: () => void }) {
  const [fecha, setFecha] = useState(hoyISO())
  const [valores, setValores] = useState<Partial<Record<TipoMedida, string>>>({})
  const listos = Object.values(valores).filter((v) => leerNumero(v) !== null).length
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const nums = Object.fromEntries(Object.entries(valores).map(([k, v]) => [k, leerNumero(v) ?? undefined]))
        if ((await guardarMedidas(fecha, nums)) > 0) alGuardar()
      }}
    >
      <p className="text-sm text-tinta-suave">Anota solo las que tomaste hoy. Mide siempre en el mismo lugar y a la misma hora para comparar bien.</p>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Fecha
        <input type="date" value={fecha} max={hoyISO()} onChange={(e) => setFecha(e.target.value)} className="h-12 rounded-2xl bg-pista px-3 font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        {MEDIDAS.map((m) => (
          <label key={m.tipo} className="flex flex-col gap-1 text-sm font-bold">
            {m.nombre}
            <span className="flex h-12 items-center rounded-2xl bg-pista pr-3 focus-within:ring-3 focus-within:ring-limon">
              <input
                inputMode="decimal"
                value={valores[m.tipo] ?? ''}
                onChange={(e) => setValores((v) => ({ ...v, [m.tipo]: e.target.value }))}
                placeholder="—"
                className="w-full min-w-0 bg-transparent px-3 text-base font-medium tabular-nums outline-none"
              />
              <span className="text-xs text-tinta-suave">{m.unidad}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="submit" disabled={listos === 0} className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45">
        Guardar
      </button>
    </form>
  )
}

function DetalleMedida({ tipo, medidas, alAnotar }: { tipo: TipoMedida; medidas: ReturnType<typeof useMedidas>; alAnotar: () => void }) {
  const info = MEDIDAS.find((m) => m.tipo === tipo)!
  const serie = serieDe(medidas, tipo)
  return (
    <div className="flex flex-col gap-4">
      {serie.length > 0 ? <GraficoLinea puntos={serie} unidad={info.unidad} /> : <p className="text-sm text-tinta-suave">Todavía no hay medidas de {info.nombre.toLowerCase()}.</p>}
      {medidas.length > 0 && (
        <ul className="flex flex-col rounded-[22px] bg-tarjeta py-1" aria-label="Todas las medidas">
          {[...medidas].reverse().map((m) => (
            <li key={m.id} className="flex min-h-12 items-center gap-2 px-4">
              <span className="flex-1">{fechaCorta(m.fecha)}</span>
              <span className="font-bold tabular-nums">
                {formatearNumero(m.valor, 1)} {info.unidad}
              </span>
              <button type="button" onClick={() => borrarMedida(m.id)} aria-label={`Borrar medida del ${fechaCorta(m.fecha)}`} className="flex size-10 items-center justify-center rounded-full text-tinta-suave">
                <Icono nombre="basura" tam={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={alAnotar} className="h-12 rounded-full bg-limon-verde font-bold text-noche">
        Anotar medidas
      </button>
    </div>
  )
}
