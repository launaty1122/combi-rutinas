import { useEffect, useMemo, useState } from 'react'
import { Hoja } from '../../componentes/Hoja'
import { Icono, Mancha } from '../../componentes/Icono'
import { SelectorCantidad, useSelectorCantidad } from '../../componentes/SelectorCantidad'
import { useCatalogo } from '../../datos/catalogo'
import { useSinCalorias } from '../../db/ajustes'
import {
  actualizarRegistro,
  borrarRegistro,
  guardarComida,
  repetir,
  restaurarRegistro,
  useAgua,
  useDiario,
} from '../../db/diario'
import { metaAgua, usePerfil } from '../../db/perfil'
import { useRecetas } from '../../db/recetas'
import { MOMENTOS, resumirDia } from '../../logica/diario'
import { fechaCorta, hoyISO, nombreDia, sumarDias } from '../../logica/fechas'
import { formatearNumero } from '../../logica/texto'
import type { MomentoComida, RegistroComida } from '../../logica/tipos'
import { describirCantidad } from '../../logica/unidades'
import { href } from '../../rutas'
import { Contador } from '../recetas/CocineEsto'
import { AgregarComida } from './AgregarComida'
import { Agua } from './Agua'
import { ResumenDelDia } from './Resumen'

/** Saludo según la hora, sin presión. */
function saludo(h: number) {
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function Hoy({ abrirAgregar, alCerrarAgregar, alAgregar }: { abrirAgregar: boolean; alCerrarAgregar: () => void; alAgregar: () => void }) {
  const hoy = hoyISO()
  const [fecha, setFecha] = useState(hoy)
  const catalogo = useCatalogo()
  const recetas = useRecetas() ?? []
  const registros = useDiario(fecha)
  const agua = useAgua(fecha)
  const perfil = usePerfil()
  const sinCalorias = useSinCalorias()
  const [agregando, setAgregando] = useState<MomentoComida | null>(null)
  const [editando, setEditando] = useState<RegistroComida | null>(null)
  const [guardando, setGuardando] = useState<MomentoComida | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; deshacer?: RegistroComida } | null>(null)

  // El "+" del menú abre directamente "Anotar comida" (en la comida que toca según la hora).
  useEffect(() => {
    if (!abrirAgregar) return
    const h = new Date().getHours()
    setAgregando(h < 11 ? 'desayuno' : h < 16 ? 'almuerzo' : h < 19 ? 'merienda' : 'cena')
    alCerrarAgregar()
  }, [abrirAgregar, alCerrarAgregar])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  const resumen = useMemo(() => resumirDia(registros ?? []), [registros])
  const aguaMl = agua.reduce((s, a) => s + a.ml, 0)
  const fuentes = useMemo(
    () => ({ alimentos: catalogo.porId, recetas: new Map(recetas.map((r) => [r.id, r])) }),
    [catalogo, recetas],
  )

  // Recordatorio suave de agua (solo con la app abierta, ver README): si es de día,
  // vas por debajo de lo esperado a esta hora y llevas más de 2 horas sin anotar.
  const ahora = new Date()
  const ultimaAgua = agua.at(-1)?.creado
  const horasSinAgua = ultimaAgua ? (ahora.getTime() - new Date(ultimaAgua).getTime()) / 3_600_000 : 99
  const esperadoAhora = metaAgua(perfil) * Math.min(1, Math.max(0, (ahora.getHours() - 8) / 13))
  const recordarAgua = fecha === hoy && ahora.getHours() >= 9 && ahora.getHours() < 22 && horasSinAgua > 2 && aguaMl < esperadoAhora

  const vacio = registros !== undefined && registros.length === 0

  return (
    <div className="fondo-hoy relative flex min-h-dvh flex-col overflow-x-clip bg-fondo">
      <Mancha className="pointer-events-none absolute -top-24 -right-20 w-64 text-white/15" />
      <header className="relative px-5 pt-7 pb-6 text-fondo-tinta">
        <p className="text-sm font-semibold opacity-85">{fecha === hoy ? fechaCorta(hoy) : nombreDia(fecha)}</p>
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-titulo text-[34px] leading-tight font-semibold">
            {fecha === hoy ? saludo(ahora.getHours()) : nombreDia(fecha).replace(/^\w/, (c) => c.toUpperCase())}
          </h1>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFecha(sumarDias(fecha, -1))}
              aria-label="Día anterior"
              className="flex size-11 items-center justify-center rounded-full bg-white/15"
            >
              <Icono nombre="atras" />
            </button>
            <button
              type="button"
              onClick={() => setFecha(sumarDias(fecha, 1))}
              disabled={fecha >= hoy}
              aria-label="Día siguiente"
              className="flex size-11 items-center justify-center rounded-full bg-white/15 disabled:opacity-30"
            >
              <Icono nombre="atras" className="rotate-180" />
            </button>
          </div>
        </div>
        {fecha !== hoy && (
          <button type="button" onClick={() => setFecha(hoy)} className="mt-1 text-sm font-bold underline underline-offset-2">
            Volver a hoy
          </button>
        )}
      </header>

      <main className="relative flex flex-1 flex-col gap-6 rounded-t-hoja bg-hoja px-4 pt-5 pb-32 text-tinta">
        <ResumenDelDia resumen={resumen} aguaMl={aguaMl} perfil={perfil} sinCalorias={sinCalorias} />

        {recordarAgua && (
          <p className="flex items-center gap-2 rounded-[20px] bg-[#CFE8F6] px-4 py-3 text-sm text-noche">
            <Icono nombre="gota" tam={18} /> Un vasito de agua ahora te vendría bien.
          </p>
        )}

        <Agua fecha={fecha} ml={aguaMl} metaMl={metaAgua(perfil)} vasoMl={perfil.vasoMl} />

        <section className="flex flex-col gap-3" aria-label="Comidas del día">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-titulo text-xl font-semibold">Comidas</h2>
            {vacio && (
              <button
                type="button"
                onClick={async () => {
                  const n = await repetir(sumarDias(fecha, -1), fecha)
                  setAviso({ texto: n ? `Copié ${n} cosas del día anterior` : 'El día anterior está vacío' })
                }}
                className="text-sm font-bold underline underline-offset-2"
              >
                Repetir el día anterior
              </button>
            )}
          </div>

          {MOMENTOS.map((m) => {
            const del = (registros ?? []).filter((r) => r.momento === m.id)
            if (m.id === 'otro' && del.length === 0) return null
            const prot = resumen.porMomento.get(m.id)?.proteina
            return (
              <div key={m.id} className="rounded-[26px] bg-tarjeta p-2">
                <div className="flex items-center gap-2 py-1 pr-1 pl-3">
                  <span className="size-3 rounded-full" style={{ background: m.color }} aria-hidden="true" />
                  <h3 className="flex-1 font-titulo text-lg font-semibold">{m.nombre}</h3>
                  {prot != null && <span className="text-sm font-bold text-tinta-suave tabular-nums">{formatearNumero(prot, 0)} g prot.</span>}
                  <button
                    type="button"
                    onClick={() => setAgregando(m.id)}
                    aria-label={`Anotar en ${m.nombre}`}
                    className="flex size-10 items-center justify-center rounded-full bg-limon-verde text-noche transition-transform duration-150 ease-out active:scale-[0.92]"
                  >
                    <Icono nombre="agregar" tam={18} />
                  </button>
                </div>
                {del.length > 0 ? (
                  <>
                    <ul>
                      {del.map((r) => (
                        <li key={r.id}>
                          <button type="button" onClick={() => setEditando(r)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left active:bg-pista">
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold">{r.nombre}</span>
                              <span className="block text-[13px] text-tinta-suave">{cantidadTexto(r, catalogo.porId)}</span>
                            </span>
                            <span className="shrink-0 text-sm font-bold tabular-nums">
                              {r.n.proteina === null ? '—' : `${formatearNumero(r.n.proteina, 0)} g`}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end gap-3 px-3 pb-1">
                      <button type="button" onClick={() => setGuardando(m.id)} className="text-[13px] font-bold text-tinta-suave underline underline-offset-2">
                        Guardar como comida
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      const n = await repetir(sumarDias(fecha, -1), fecha, m.id)
                      setAviso({ texto: n ? `Repetí el ${m.nombre.toLowerCase()} de ayer` : `Ayer no hubo ${m.nombre.toLowerCase()} anotado` })
                    }}
                    className="px-3 pb-2 text-left text-[13px] text-tinta-suave"
                  >
                    Nada todavía · <span className="font-bold underline underline-offset-2">repetir el de ayer</span>
                  </button>
                )}
              </div>
            )
          })}
          <p className="px-1 text-xs text-tinta-suave">Los valores son aproximados. Si te pasas de una meta, solo verás el número.</p>
        </section>
      </main>

      <BarraNav alAgregar={alAgregar} />

      {aviso && (
        <div
          role="status"
          className="aviso-entra fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-noche py-2 pr-2 pl-5 text-crema shadow-lg dark:bg-crema dark:text-noche"
        >
          <span className="py-1.5 text-sm font-semibold">{aviso.texto}</span>
          {aviso.deshacer && (
            <button
              type="button"
              onClick={async () => {
                await restaurarRegistro(aviso.deshacer as RegistroComida)
                setAviso(null)
              }}
              className="h-10 rounded-full bg-limon-verde px-4 text-sm font-bold text-noche"
            >
              Deshacer
            </button>
          )}
        </div>
      )}

      <Hoja abierta={agregando !== null} titulo="Anotar comida" alCerrar={() => setAgregando(null)}>
        {agregando && (
          <AgregarComida
            key={agregando + fecha}
            fecha={fecha}
            momentoInicial={agregando}
            catalogo={catalogo}
            recetas={recetas}
            alTerminar={(texto) => {
              setAgregando(null)
              setAviso({ texto })
            }}
          />
        )}
      </Hoja>

      <Hoja abierta={editando !== null} titulo="Editar" alCerrar={() => setEditando(null)}>
        {editando && (
          <EditarRegistro
            key={editando.id}
            r={editando}
            catalogo={catalogo}
            alGuardar={async (cambios) => {
              await actualizarRegistro(editando, cambios, fuentes)
              setEditando(null)
            }}
            alBorrar={async () => {
              const r = await borrarRegistro(editando.id)
              setEditando(null)
              setAviso({ texto: `Quitaste ${editando.nombre.toLowerCase()}`, deshacer: r })
            }}
          />
        )}
      </Hoja>

      <Hoja abierta={guardando !== null} titulo="Guardar como comida" alCerrar={() => setGuardando(null)}>
        {guardando && (
          <GuardarComida
            sugerido={`Mi ${MOMENTOS.find((x) => x.id === guardando)?.nombre.toLowerCase()} de siempre`}
            alGuardar={async (nombre) => {
              await guardarComida(
                nombre,
                (registros ?? []).filter((r) => r.momento === guardando).map((r) => r.item),
              )
              setGuardando(null)
              setAviso({ texto: `Guardada: "${nombre}"` })
            }}
          />
        )}
      </Hoja>
    </div>
  )
}

function cantidadTexto(r: RegistroComida, porId: Map<string, import('../../logica/tipos').Alimento>) {
  if (r.item.tipo === 'receta') return `${formatearNumero(r.item.porciones, 1)} ${r.item.porciones === 1 ? 'porción' : 'porciones'}`
  const a = porId.get(r.item.alimentoId)
  return a ? describirCantidad(r.item.gramos, a.porciones, a.liquido) : `${Math.round(r.item.gramos)} g`
}

function EditarRegistro({
  r,
  catalogo,
  alGuardar,
  alBorrar,
}: {
  r: RegistroComida
  catalogo: ReturnType<typeof useCatalogo>
  alGuardar: (c: { momento?: MomentoComida; item?: RegistroComida['item'] }) => void
  alBorrar: () => void
}) {
  const [momento, setMomento] = useState(r.momento)
  const a = r.item.tipo === 'alimento' ? catalogo.porId.get(r.item.alimentoId) : undefined
  return (
    <div className="flex flex-col gap-5">
      <p className="font-titulo text-xl font-semibold">{r.nombre}</p>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]" role="radiogroup" aria-label="Comida">
        {MOMENTOS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={momento === m.id}
            onClick={() => setMomento(m.id)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold ${momento === m.id ? 'text-noche' : 'bg-pista'}`}
            style={momento === m.id ? { background: m.color } : undefined}
          >
            {m.nombre}
          </button>
        ))}
      </div>
      {r.item.tipo === 'alimento' && a ? (
        <EditarCantidad alimento={a} gramos={r.item.gramos} alGuardar={(gramos) => alGuardar({ momento, item: { tipo: 'alimento', alimentoId: a.id, gramos } })} />
      ) : r.item.tipo === 'receta' ? (
        <EditarPorciones porciones={r.item.porciones} alGuardar={(p) => alGuardar({ momento, item: { ...(r.item as { tipo: 'receta'; recetaId: string; porciones: number }), porciones: p } })} />
      ) : (
        <button type="button" onClick={() => alGuardar({ momento })} className="h-14 rounded-full bg-limon-verde font-bold text-noche">
          Guardar
        </button>
      )}
      <button type="button" onClick={alBorrar} className="flex h-12 items-center justify-center gap-2 rounded-full font-bold text-chili dark:text-rosa-claro">
        <Icono nombre="basura" tam={20} /> Quitar del diario
      </button>
    </div>
  )
}

function EditarCantidad({ alimento, gramos, alGuardar }: { alimento: import('../../logica/tipos').Alimento; gramos: number; alGuardar: (g: number) => void }) {
  const c = useSelectorCantidad(alimento, gramos)
  return (
    <div className="flex flex-col gap-5">
      <SelectorCantidad alimento={alimento} estado={c} etiqueta="¿Cuánto comiste?" />
      <button
        type="button"
        disabled={c.gramos <= 0}
        onClick={() => alGuardar(c.gramos)}
        className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45"
      >
        Guardar cambios
      </button>
    </div>
  )
}

function EditarPorciones({ porciones, alGuardar }: { porciones: number; alGuardar: (p: number) => void }) {
  const [p, setP] = useState(Math.max(1, Math.round(porciones)))
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-[24px] bg-pista p-2 pl-5">
        <span className="font-bold">Porciones</span>
        <Contador valor={p} alCambiar={setP} />
      </div>
      <button type="button" onClick={() => alGuardar(p)} className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche">
        Guardar cambios
      </button>
    </div>
  )
}

function GuardarComida({ sugerido, alGuardar }: { sugerido: string; alGuardar: (n: string) => void }) {
  const [nombre, setNombre] = useState(sugerido)
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (nombre.trim()) alGuardar(nombre.trim())
      }}
    >
      <p className="text-sm text-tinta-suave">Así la anotas otro día con un toque, desde "Guardadas".</p>
      <input
        autoFocus
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        aria-label="Nombre de la comida"
        className="h-12 rounded-2xl bg-pista px-4 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
      />
      <button type="submit" className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche">
        Guardar
      </button>
    </form>
  )
}

/** Menú flotante igual al de las demás pantallas (Hoy no usa <Pantalla> por su cabecera propia). */
function BarraNav({ alAgregar }: { alAgregar: () => void }) {
  const items = [
    ['hoy', 'Hoy', 'hoy'],
    ['alacena', 'Alacena', 'alacena'],
    null,
    ['recetas', 'Recetas', 'recetas'],
    ['progreso', 'Progreso', 'progreso'],
    ['mas', 'Más', 'mas'],
  ] as const
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-4 bottom-4 z-20 mx-auto grid h-[68px] max-w-md grid-cols-6 items-center rounded-full bg-nav px-1.5 shadow-[0_10px_30px_rgba(16,37,30,0.25)]"
    >
      {items.map((it) =>
        it === null ? (
          <button
            key="mas-rapido"
            type="button"
            onClick={alAgregar}
            aria-label="Agregar rápido"
            className="mx-auto flex size-12 items-center justify-center rounded-full bg-limon text-noche transition-transform duration-150 ease-out active:scale-[0.94]"
          >
            <Icono nombre="agregar" tam={24} />
          </button>
        ) : (
          <a
            key={it[0]}
            href={href(it[0])}
            aria-label={it[1]}
            aria-current={it[0] === 'hoy' ? 'page' : undefined}
            className={`mx-auto flex size-12 items-center justify-center rounded-full ${it[0] === 'hoy' ? 'bg-limon-verde text-noche' : 'text-nav-icono'}`}
          >
            <Icono nombre={it[2]} />
          </a>
        ),
      )}
    </nav>
  )
}
