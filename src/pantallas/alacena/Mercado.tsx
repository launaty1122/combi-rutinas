import { useMemo, useState } from 'react'
import { Hoja } from '../../componentes/Hoja'
import { Icono, Mancha } from '../../componentes/Icono'
import { Pantalla } from '../../componentes/Pantalla'
import { SelectorCantidad, useSelectorCantidad } from '../../componentes/SelectorCantidad'
import { nombreVisible } from '../../datos/alimentos'
import { CATEGORIAS } from '../../datos/categorias'
import { useCatalogo } from '../../datos/catalogo'
import { useAlacena } from '../../db/alacena'
import { useBasicos } from '../../db/ajustes'
import {
  actualizarMercado,
  agregarAlMercado,
  alternarComprado,
  borrarDelMercado,
  guardarMinimo,
  olvidarAcabado,
  quitarPlaneada,
  terminarCompraDB,
  useAcabados,
  useMercado,
  useMinimos,
  usePlaneadas,
  usePrecios,
} from '../../db/mercado'
import { useRecetas } from '../../db/recetas'
import { clavePrecio, formatearPrecio, precioSugerido, sugerirCompras, totalLista, type Sugerencia } from '../../logica/mercado'
import type { Alimento, ItemMercado } from '../../logica/tipos'
import { describirCantidad, formatearGramos } from '../../logica/unidades'
import { href } from '../../rutas'
import { BuscarAlimento } from './BuscarAlimento'
import { CrearAlimento } from './CrearAlimento'
import { FormularioMercadoAlimento, FormularioMercadoOtro, SECCIONES_OTROS } from './FormulariosMercado'
import { PestanasAlacena } from './Pestanas'

type Hojas =
  | null
  | { tipo: 'agregar'; modo: 'comida' | 'otro'; alimento?: Alimento; creando?: string; sugerencia?: Sugerencia }
  | { tipo: 'editar'; item: ItemMercado }
  | { tipo: 'terminar' }
  | { tipo: 'minimos'; alimento?: Alimento }

export function Mercado({ alAgregar }: { alAgregar: () => void }) {
  const catalogo = useCatalogo()
  const lista = useMercado()
  const alacena = useAlacena()
  const basicos = useBasicos()
  const recetas = useRecetas()
  const planeadas = usePlaneadas()
  const minimos = useMinimos()
  const acabados = useAcabados()
  const precios = usePrecios()
  const [hoja, setHoja] = useState<Hojas>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const recetasPorId = useMemo(() => new Map((recetas ?? []).map((r) => [r.id, r])), [recetas])
  const sugerencias = useMemo(
    () =>
      lista && alacena
        ? sugerirCompras({ alacena, basicos, planeadas, recetas: recetasPorId, minimos, acabados, lista }).filter((s) =>
            catalogo.porId.has(s.alimentoId),
          )
        : [],
    [lista, alacena, basicos, planeadas, recetasPorId, minimos, acabados, catalogo],
  )

  const items = lista ?? []
  const { total, sinPrecio } = totalLista(items)
  const marcados = items.filter((i) => i.comprado)
  const totalMarcados = totalLista(marcados).total

  const nombreDe = (i: ItemMercado) => {
    if (i.tipo === 'otro') return i.nombre ?? ''
    const a = i.alimentoId ? catalogo.porId.get(i.alimentoId) : undefined
    return a ? nombreVisible(a) : 'Alimento'
  }
  const cantidadDe = (i: ItemMercado) => {
    if (i.tipo === 'otro') return i.cantidadTexto ?? ''
    const a = i.alimentoId ? catalogo.porId.get(i.alimentoId) : undefined
    return a && i.gramos ? describirCantidad(i.gramos, a.porciones, a.liquido) : ''
  }

  // Grupos: la comida por categoría de alimento, y luego las secciones de "otros".
  const comida = items.filter((i) => i.tipo === 'alimento')
  const ordenCat = new Map(CATEGORIAS.map((c, n) => [c.id, n]))
  comida.sort((a, b) => {
    const ca = ordenCat.get(catalogo.porId.get(a.alimentoId ?? '')?.categoria ?? 'otros') ?? 99
    const cb = ordenCat.get(catalogo.porId.get(b.alimentoId ?? '')?.categoria ?? 'otros') ?? 99
    return Number(a.comprado) - Number(b.comprado) || ca - cb || nombreDe(a).localeCompare(nombreDe(b), 'es')
  })
  const grupos = [
    { id: 'comida', nombre: 'Comida', color: '#AED140', items: comida },
    ...SECCIONES_OTROS.map((s) => ({
      ...s,
      items: items
        .filter((i) => i.tipo === 'otro' && (i.seccion ?? 'otros') === s.id)
        .sort((a, b) => Number(a.comprado) - Number(b.comprado) || nombreDe(a).localeCompare(nombreDe(b), 'es')),
    })),
  ].filter((g) => g.items.length > 0)

  async function agregarSugerencia(s: Sugerencia) {
    const a = catalogo.porId.get(s.alimentoId)
    if (!a) return
    if (s.gramos <= 0) {
      // "Se acabó": no sabemos cuánto, se pregunta.
      setHoja({ tipo: 'agregar', modo: 'comida', alimento: a, sugerencia: s })
      return
    }
    await agregarAlMercado({
      tipo: 'alimento',
      alimentoId: a.id,
      gramos: s.gramos,
      precio: precioSugerido(precios.get(a.id), s.gramos),
      motivo: s.motivo,
    })
  }

  return (
    <Pantalla
      ruta="alacena"
      titulo="Mercado"
      subtitulo={
        lista === undefined
          ? ' '
          : items.length === 0
            ? 'Tu lista está vacía'
            : `${items.length} ${items.length === 1 ? 'cosa' : 'cosas'} · total estimado ${formatearPrecio(total)}`
      }
      alAgregar={alAgregar}
      cabecera={<PestanasAlacena activa="mercado" />}
      accion={
        <button
          type="button"
          onClick={() => setHoja({ tipo: 'agregar', modo: 'comida' })}
          className="flex h-12 items-center gap-2 rounded-full bg-crema px-5 font-bold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Icono nombre="agregar" tam={20} /> Agregar
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        {sugerencias.length > 0 && (
          <section className="relative overflow-hidden rounded-[26px] bg-mantequilla px-4 pt-4 pb-3 text-noche">
            <Mancha className="pointer-events-none absolute -top-12 -right-12 w-36 text-limon" />
            <div className="relative mb-2 flex items-center justify-between gap-2">
              <h2 className="font-titulo text-lg font-semibold">Te sugiero comprar</h2>
              {sugerencias.some((s) => s.gramos > 0) && (
                <button
                  type="button"
                  onClick={async () => {
                    for (const s of sugerencias.filter((x) => x.gramos > 0)) await agregarSugerencia(s)
                  }}
                  className="h-9 rounded-full bg-noche px-3 text-sm font-bold text-crema"
                >
                  Agregar todas
                </button>
              )}
            </div>
            <ul className="relative flex flex-col">
              {sugerencias.map((s) => {
                const a = catalogo.porId.get(s.alimentoId) as Alimento
                return (
                  <li key={s.alimentoId} className="flex items-center gap-2 py-1.5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{nombreVisible(a)}</span>
                      <span className="block text-[13px]">
                        {s.gramos > 0 ? `${describirCantidad(s.gramos, a.porciones, a.liquido)} · ` : ''}
                        {s.detalle}
                      </span>
                    </span>
                    {s.motivo === 'acabado' && (
                      <button
                        type="button"
                        onClick={() => olvidarAcabado(s.alimentoId)}
                        aria-label={`No sugerir ${nombreVisible(a)}`}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-crema/60"
                      >
                        <Icono nombre="cerrar" tam={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => agregarSugerencia(s)}
                      aria-label={`Agregar ${nombreVisible(a)} a la lista`}
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-noche text-crema"
                    >
                      <Icono nombre="agregar" tam={18} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-titulo text-lg font-semibold">Cocinaré esta semana</h2>
            <a href={href('recetas')} className="text-sm font-bold underline underline-offset-2">
              Elegir recetas
            </a>
          </div>
          {planeadas.length === 0 ? (
            <p className="text-sm text-tinta-suave">
              En cada receta toca "Planear para el mercado" y aquí te digo qué te falta para hacerlas.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {planeadas.map((p) => (
                <li key={p.recetaId}>
                  <span className="flex min-h-10 items-center gap-1 rounded-full bg-verde-claro py-1 pr-1 pl-4 text-sm font-bold text-noche">
                    {recetasPorId.get(p.recetaId)?.nombre ?? 'Receta'} · {p.porciones} porc.
                    <button
                      type="button"
                      onClick={() => quitarPlaneada(p.recetaId)}
                      aria-label="Quitar de la semana"
                      className="flex size-8 items-center justify-center rounded-full"
                    >
                      <Icono nombre="cerrar" tam={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setHoja({ tipo: 'minimos' })}
            className="flex min-h-11 items-center gap-2 self-start rounded-full bg-pista px-4 text-sm font-bold"
          >
            Siempre en casa{Object.keys(minimos).length ? ` · ${Object.keys(minimos).length}` : ''}
          </button>
        </section>

        {lista !== undefined && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 pt-4 text-center">
            <p className="font-titulo text-xl font-semibold">Nada en la lista</p>
            <p className="text-tinta-suave">
              Agrega comida (al comprarla pasa sola a tu alacena) o cosas de aseo, limpieza y utensilios.
            </p>
          </div>
        )}

        {grupos.map((g) => (
          <section key={g.id} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 px-1 font-titulo text-lg font-semibold">
              <span className="size-3 rounded-full" style={{ background: g.color }} aria-hidden="true" />
              {g.nombre}
            </h2>
            <ul className="rounded-[24px] bg-tarjeta py-1">
              {g.items.map((i) => (
                <li key={i.id} className="flex items-center gap-2 py-1 pr-3 pl-1">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={i.comprado}
                    aria-label={`${nombreDe(i)}: ${i.comprado ? 'en el carrito' : 'por comprar'}`}
                    onClick={() => alternarComprado(i.id)}
                    className="flex size-11 shrink-0 items-center justify-center"
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                        i.comprado ? 'border-finca bg-finca text-crema dark:border-limon-verde dark:bg-limon-verde dark:text-noche' : 'border-tinta-suave/50'
                      }`}
                    >
                      {i.comprado && <Icono nombre="check" tam={15} />}
                    </span>
                  </button>
                  <button type="button" onClick={() => setHoja({ tipo: 'editar', item: i })} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
                    <span className={`min-w-0 flex-1 ${i.comprado ? 'text-tinta-suave line-through' : ''}`}>
                      <span className="block truncate font-bold">{nombreDe(i)}</span>
                      {cantidadDe(i) && <span className="block text-[13px] text-tinta-suave tabular-nums">{cantidadDe(i)}</span>}
                    </span>
                    <span className={`shrink-0 text-sm font-bold tabular-nums ${typeof i.precio === 'number' ? '' : 'text-tinta-suave'}`}>
                      {typeof i.precio === 'number' ? formatearPrecio(i.precio) : '+ precio'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {items.length > 0 && sinPrecio > 0 && (
          <p className="px-1 text-xs text-tinta-suave">
            {sinPrecio === 1 ? '1 cosa no tiene precio' : `${sinPrecio} cosas no tienen precio`}: el total es aproximado.
          </p>
        )}
        {/* Espacio para que el botón "Terminar compra" no tape el final de la lista. */}
        {marcados.length > 0 && <div className="h-16" aria-hidden="true" />}
      </div>

      {marcados.length > 0 && (
        <div className="fixed inset-x-4 bottom-24 z-20 mx-auto max-w-md">
          <button
            type="button"
            onClick={() => setHoja({ tipo: 'terminar' })}
            className="flex h-14 w-full items-center justify-between rounded-full bg-limon-verde px-6 font-titulo text-lg font-semibold text-noche shadow-[0_8px_24px_rgba(16,37,30,0.2)] transition-transform duration-150 ease-out active:scale-[0.98]"
          >
            <span>Terminar compra · {marcados.length}</span>
            <span className="tabular-nums">{formatearPrecio(totalMarcados)}</span>
          </button>
        </div>
      )}

      {aviso && (
        <div role="status" className="aviso-entra fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md rounded-full bg-noche px-5 py-3 text-sm font-semibold text-crema dark:bg-crema dark:text-noche">
          {aviso}
        </div>
      )}

      {/* Agregar */}
      <Hoja
        abierta={hoja?.tipo === 'agregar'}
        titulo={hoja?.tipo === 'agregar' && hoja.creando !== undefined ? 'Nuevo alimento' : 'Agregar al mercado'}
        alCerrar={() => setHoja(null)}
      >
        {hoja?.tipo === 'agregar' && (
          <div className="flex flex-col gap-4">
            {!hoja.alimento && hoja.creando === undefined && (
              <div role="radiogroup" aria-label="Tipo" className="grid grid-cols-2 gap-1 rounded-full bg-pista p-1">
                {(
                  [
                    ['comida', 'Comida'],
                    ['otro', 'Aseo y otros'],
                  ] as const
                ).map(([id, txt]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={hoja.modo === id}
                    onClick={() => setHoja({ tipo: 'agregar', modo: id })}
                    className={`h-10 rounded-full text-sm font-bold ${hoja.modo === id ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''}`}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            )}
            {hoja.modo === 'otro' ? (
              <FormularioMercadoOtro
                precioDe={(n) => precios.get(clavePrecio({ tipo: 'otro', nombre: n }))}
                textoGuardar="Agregar a la lista"
                alGuardar={async (d) => {
                  await agregarAlMercado({ tipo: 'otro', ...d, motivo: 'manual' })
                  setHoja(null)
                }}
              />
            ) : hoja.alimento ? (
              <FormularioMercadoAlimento
                key={hoja.alimento.id}
                alimento={hoja.alimento}
                precioAnterior={precios.get(hoja.alimento.id)}
                textoGuardar="Agregar a la lista"
                alGuardar={async (d) => {
                  await agregarAlMercado({
                    tipo: 'alimento',
                    alimentoId: hoja.alimento!.id,
                    ...d,
                    motivo: hoja.sugerencia?.motivo ?? 'manual',
                  })
                  setHoja(null)
                }}
              />
            ) : hoja.creando !== undefined ? (
              <CrearAlimento nombreInicial={hoja.creando} alGuardar={(a) => setHoja({ tipo: 'agregar', modo: 'comida', alimento: a })} />
            ) : (
              <BuscarAlimento
                catalogo={catalogo}
                alElegir={(a) => setHoja({ tipo: 'agregar', modo: 'comida', alimento: a })}
                alCrear={(n) => setHoja({ tipo: 'agregar', modo: 'comida', creando: n })}
              />
            )}
          </div>
        )}
      </Hoja>

      {/* Editar */}
      <Hoja abierta={hoja?.tipo === 'editar'} titulo="Editar" alCerrar={() => setHoja(null)}>
        {hoja?.tipo === 'editar' &&
          (() => {
            const i = hoja.item
            const quitar = (
              <button
                type="button"
                onClick={async () => {
                  await borrarDelMercado(i.id)
                  setHoja(null)
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-full font-bold text-chili dark:text-rosa-claro"
              >
                <Icono nombre="basura" tam={20} /> Quitar de la lista
              </button>
            )
            const a = i.alimentoId ? catalogo.porId.get(i.alimentoId) : undefined
            return i.tipo === 'alimento' && a ? (
              <FormularioMercadoAlimento
                key={i.id}
                alimento={a}
                inicial={{ gramos: i.gramos, precio: i.precio }}
                precioAnterior={precios.get(a.id)}
                textoGuardar="Guardar cambios"
                alGuardar={async (d) => {
                  await actualizarMercado(i.id, { gramos: d.gramos, precio: d.precio })
                  setHoja(null)
                }}
                extra={quitar}
              />
            ) : (
              <FormularioMercadoOtro
                key={i.id}
                inicial={i}
                precioDe={(n) => precios.get(clavePrecio({ tipo: 'otro', nombre: n }))}
                textoGuardar="Guardar cambios"
                alGuardar={async (d) => {
                  await actualizarMercado(i.id, { ...d })
                  setHoja(null)
                }}
                extra={quitar}
              />
            )
          })()}
      </Hoja>

      {/* Terminar compra */}
      <Hoja abierta={hoja?.tipo === 'terminar'} titulo="Terminar compra" alCerrar={() => setHoja(null)}>
        {hoja?.tipo === 'terminar' && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="mb-1 font-titulo text-lg font-semibold">Pasa a tu alacena</h3>
              {marcados.some((i) => i.tipo === 'alimento') ? (
                <ul className="flex flex-col gap-1 text-[15px]">
                  {marcados
                    .filter((i) => i.tipo === 'alimento')
                    .map((i) => (
                      <li key={i.id} className="flex justify-between gap-3">
                        <span className="font-semibold">{nombreDe(i)}</span>
                        <span className="tabular-nums">{formatearGramos(i.gramos ?? 0, catalogo.porId.get(i.alimentoId ?? '')?.liquido)}</span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-tinta-suave">Nada de comida en esta compra.</p>
              )}
            </div>
            {marcados.some((i) => i.tipo === 'otro') && (
              <p className="text-sm text-tinta-suave">
                Lo de aseo, limpieza y utensilios sale de la lista (no va a la alacena).
              </p>
            )}
            <div className="flex items-baseline justify-between rounded-[20px] bg-pista px-4 py-3">
              <span className="font-bold">Total</span>
              <span className="font-titulo text-2xl font-semibold tabular-nums">{formatearPrecio(totalMarcados)}</span>
            </div>
            <p className="text-xs text-tinta-suave">Los precios se recuerdan para sugerírtelos la próxima vez.</p>
            <button
              type="button"
              onClick={async () => {
                const r = await terminarCompraDB()
                setHoja(null)
                setAviso(`¡Listo! ${r.alAlacena} ${r.alAlacena === 1 ? 'cosa pasó' : 'cosas pasaron'} a tu alacena · ${formatearPrecio(r.total)}`)
                setTimeout(() => setAviso(null), 5000)
              }}
              className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche"
            >
              Confirmar
            </button>
          </div>
        )}
      </Hoja>

      {/* Siempre en casa */}
      <Hoja abierta={hoja?.tipo === 'minimos'} titulo="Siempre en casa" alCerrar={() => setHoja(null)}>
        {hoja?.tipo === 'minimos' &&
          (hoja.alimento ? (
            <FormularioMinimo
              alimento={hoja.alimento}
              gramos={minimos[hoja.alimento.id]}
              alGuardar={async (g) => {
                await guardarMinimo(hoja.alimento!.id, g)
                setHoja({ tipo: 'minimos' })
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-tinta-suave">
                Lo que quieres tener siempre, con una cantidad mínima. Si en la alacena baja de ahí, te lo sugiero en el mercado.
              </p>
              {Object.keys(minimos).length > 0 && (
                <ul className="flex flex-col rounded-[22px] bg-tarjeta py-1">
                  {Object.entries(minimos).map(([id, g]) => {
                    const a = catalogo.porId.get(id)
                    if (!a) return null
                    return (
                      <li key={id} className="flex min-h-12 items-center gap-2 px-4">
                        <button type="button" onClick={() => setHoja({ tipo: 'minimos', alimento: a })} className="flex-1 py-2 text-left">
                          <span className="block font-semibold">{nombreVisible(a)}</span>
                          <span className="block text-[13px] text-tinta-suave">mínimo {describirCantidad(g, a.porciones, a.liquido)}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => guardarMinimo(id, null)}
                          aria-label={`Quitar mínimo de ${nombreVisible(a)}`}
                          className="flex size-10 items-center justify-center rounded-full text-tinta-suave"
                        >
                          <Icono nombre="basura" tam={18} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              <BuscarAlimento catalogo={catalogo} alElegir={(a) => setHoja({ tipo: 'minimos', alimento: a })} />
            </div>
          ))}
      </Hoja>
    </Pantalla>
  )
}

function FormularioMinimo({ alimento, gramos, alGuardar }: { alimento: Alimento; gramos?: number; alGuardar: (g: number) => void }) {
  const c = useSelectorCantidad(alimento, gramos)
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (c.gramos > 0) alGuardar(c.gramos)
      }}
    >
      <p className="font-titulo text-xl font-semibold">{nombreVisible(alimento)}</p>
      <SelectorCantidad alimento={alimento} estado={c} etiqueta="Quiero tener siempre al menos…" />
      <button type="submit" disabled={c.gramos <= 0} className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45">
        Guardar mínimo
      </button>
    </form>
  )
}
