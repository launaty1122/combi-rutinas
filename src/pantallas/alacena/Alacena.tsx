import { useEffect, useMemo, useState } from 'react'
import { Hoja } from '../../componentes/Hoja'
import { Icono, Mancha } from '../../componentes/Icono'
import { Pantalla } from '../../componentes/Pantalla'
import { nombreVisible } from '../../datos/alimentos'
import { CATEGORIAS, CATEGORIA_POR_ID } from '../../datos/categorias'
import { useCatalogo } from '../../datos/catalogo'
import { actualizarItem, agregarAlAlacena, ajustarRapido, borrarItem, restaurarItem, useAlacena } from '../../db/alacena'
import { alternarBasico, useBasicos, useDiasAvisoVence } from '../../db/ajustes'
import { diasHasta, textoVencimiento } from '../../logica/fechas'
import { normalizar } from '../../logica/texto'
import type { Alimento, ItemAlacena } from '../../logica/tipos'
import { describirCantidad } from '../../logica/unidades'
import { BuscarAlimento } from './BuscarAlimento'
import { CrearAlimento } from './CrearAlimento'
import { FormularioItem, type DatosItem } from './FormularioItem'

type Orden = 'nombre' | 'categoria' | 'vencimiento'

interface Fila {
  item: ItemAlacena
  alimento: Alimento
  nombre: string
  dias: number | null
}

export function Alacena({ abrirAgregar, alCerrarAgregar }: { abrirAgregar: boolean; alCerrarAgregar: () => void }) {
  const catalogo = useCatalogo()
  const alacena = useAlacena()
  const basicos = useBasicos()
  const diasAviso = useDiasAvisoVence()

  const [orden, setOrden] = useState<Orden>('categoria')
  const [filtro, setFiltro] = useState('')
  const [agregando, setAgregando] = useState<Alimento | null>(null)
  const [hojaAgregar, setHojaAgregar] = useState(false)
  const [creando, setCreando] = useState<string | null>(null)
  const [editando, setEditando] = useState<Fila | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; deshacer?: ItemAlacena } | null>(null)

  // El botón "+" del menú abre directamente "Agregar a la alacena".
  useEffect(() => {
    if (abrirAgregar) {
      setHojaAgregar(true)
      alCerrarAgregar()
    }
  }, [abrirAgregar, alCerrarAgregar])

  // El aviso se va solo después de unos segundos.
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  const filas: Fila[] = useMemo(() => {
    if (!alacena) return []
    return alacena
      .map((item) => {
        const alimento = catalogo.porId.get(item.alimentoId)
        if (!alimento) return null
        return { item, alimento, nombre: nombreVisible(alimento), dias: item.venceEl ? diasHasta(item.venceEl) : null }
      })
      .filter((f): f is Fila => f !== null)
  }, [alacena, catalogo])

  const visibles = useMemo(() => {
    const q = normalizar(filtro)
    const lista = q
      ? filas.filter((f) => normalizar(f.nombre).includes(q) || normalizar(f.alimento.nombre).includes(q))
      : filas
    const porNombre = (a: Fila, b: Fila) => a.nombre.localeCompare(b.nombre, 'es')
    if (orden === 'vencimiento') {
      return [...lista].sort((a, b) => (a.dias ?? 99999) - (b.dias ?? 99999) || porNombre(a, b))
    }
    return [...lista].sort(porNombre)
  }, [filas, filtro, orden])

  const porVencer = filas
    .filter((f) => f.dias !== null && f.dias <= diasAviso)
    .sort((a, b) => (a.dias as number) - (b.dias as number))

  const cerrarAgregar = () => {
    setHojaAgregar(false)
    setAgregando(null)
    setCreando(null)
  }

  async function guardarNuevo(a: Alimento, d: DatosItem) {
    await agregarAlAlacena({ alimentoId: a.id, gramos: d.gramos, compradoEl: d.compradoEl, venceEl: d.venceEl })
    if (d.basico !== basicos.has(a.id)) await alternarBasico(a.id)
    cerrarAgregar()
    setAviso({ texto: `Agregaste ${nombreVisible(a).toLowerCase()}` })
  }

  async function guardarEdicion(f: Fila, d: DatosItem) {
    await actualizarItem(f.item.id, { gramos: d.gramos, compradoEl: d.compradoEl, venceEl: d.venceEl })
    if (d.basico !== basicos.has(f.alimento.id)) await alternarBasico(f.alimento.id)
    setEditando(null)
  }

  async function quitar(f: Fila) {
    await borrarItem(f.item.id)
    setEditando(null)
    setAviso({ texto: `Quitaste ${f.nombre.toLowerCase()}`, deshacer: f.item })
  }

  async function ajustar(f: Fila, signo: 1 | -1) {
    const paso = f.alimento.porciones[0]?.gramos ?? 50
    const borrado = await ajustarRapido(f.item.id, signo * paso)
    if (borrado) setAviso({ texto: `Se acabó: ${f.nombre.toLowerCase()}`, deshacer: borrado })
  }

  const cargando = alacena === undefined

  return (
    <Pantalla
      ruta="alacena"
      titulo="Alacena"
      subtitulo={cargando ? ' ' : filas.length === 1 ? '1 cosa en casa' : `${filas.length} cosas en casa`}
      alAgregar={() => setHojaAgregar(true)}
      accion={
        <button
          type="button"
          onClick={() => setHojaAgregar(true)}
          className="flex h-12 items-center gap-2 rounded-full bg-crema px-5 font-bold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <Icono nombre="agregar" tam={20} /> Agregar
        </button>
      }
    >
      {!cargando && filas.length === 0 ? (
        <Vacia alAgregar={() => setHojaAgregar(true)} />
      ) : (
        <div className="flex flex-col gap-4">
          {porVencer.length > 0 && (
            <div className="relative flex items-center gap-3 overflow-hidden rounded-[26px] bg-mantequilla px-4 py-3.5 text-noche">
              <Mancha className="pointer-events-none absolute -right-10 -bottom-14 w-32 text-limon" />
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-crema">
                <Icono nombre="reloj" tam={20} />
              </span>
              <p className="relative text-sm leading-snug">
                <strong>Úsalas pronto: </strong>
                {porVencer
                  .slice(0, 3)
                  .map((f) => `${f.nombre.toLowerCase()} (${textoVencimiento(f.dias as number)})`)
                  .join(', ')}
                {porVencer.length > 3 ? ` y ${porVencer.length - 3} más` : ''}.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="flex h-12 items-center gap-3 rounded-full bg-pista px-4">
              <Icono nombre="buscar" tam={20} className="text-tinta-suave" />
              <input
                type="search"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar en mi alacena"
                aria-label="Buscar en mi alacena"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-tinta-suave"
              />
            </label>
            <div role="radiogroup" aria-label="Ordenar por" className="grid grid-cols-3 gap-1 rounded-full bg-pista p-1">
              {(
                [
                  ['nombre', 'Nombre'],
                  ['categoria', 'Categoría'],
                  ['vencimiento', 'Vencimiento'],
                ] as [Orden, string][]
              ).map(([id, txt]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={orden === id}
                  onClick={() => setOrden(id)}
                  className={`h-10 rounded-full text-sm font-bold transition-colors duration-200 ${
                    orden === id ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''
                  }`}
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>

          {filtro && visibles.length === 0 && (
            <p className="px-1 text-sm text-tinta-suave">No tienes nada que se llame "{filtro}".</p>
          )}

          {orden === 'categoria' ? (
            CATEGORIAS.map((c) => {
              const grupo = visibles.filter((f) => f.alimento.categoria === c.id)
              if (grupo.length === 0) return null
              return (
                <section key={c.id} className="flex flex-col gap-2">
                  <h2 className="flex items-center gap-2 px-1 font-titulo text-lg font-semibold">
                    <span className="size-3 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                    {c.nombre}
                  </h2>
                  <Lista filas={grupo} basicos={basicos} diasAviso={diasAviso} alEditar={setEditando} alAjustar={ajustar} />
                </section>
              )
            })
          ) : (
            visibles.length > 0 && (
              <Lista filas={visibles} basicos={basicos} diasAviso={diasAviso} alEditar={setEditando} alAjustar={ajustar} />
            )
          )}
        </div>
      )}

      <Hoja
        abierta={hojaAgregar}
        titulo={agregando ? '¿Cuánto compraste?' : creando !== null ? 'Nuevo alimento' : 'Agregar a la alacena'}
        alCerrar={cerrarAgregar}
      >
        {agregando ? (
          <FormularioItem
            key={agregando.id}
            alimento={agregando}
            inicial={{ basico: basicos.has(agregando.id) }}
            textoGuardar="Guardar en la alacena"
            alGuardar={(d) => guardarNuevo(agregando, d)}
            extra={
              <button type="button" onClick={() => setAgregando(null)} className="h-12 rounded-full font-bold text-tinta-suave">
                Elegir otro alimento
              </button>
            }
          />
        ) : creando !== null ? (
          <CrearAlimento
            nombreInicial={creando}
            alGuardar={(a) => {
              setCreando(null)
              setAgregando(a)
            }}
          />
        ) : (
          <BuscarAlimento catalogo={catalogo} alElegir={setAgregando} alCrear={setCreando} />
        )}
      </Hoja>

      <Hoja abierta={editando !== null} titulo="Editar" alCerrar={() => setEditando(null)}>
        {editando && (
          <FormularioItem
            key={editando.item.id}
            alimento={editando.alimento}
            inicial={{
              gramos: editando.item.gramos,
              compradoEl: editando.item.compradoEl,
              venceEl: editando.item.venceEl,
              basico: basicos.has(editando.alimento.id),
            }}
            textoGuardar="Guardar cambios"
            alGuardar={(d) => guardarEdicion(editando, d)}
            extra={
              <button
                type="button"
                onClick={() => quitar(editando)}
                className="flex h-12 items-center justify-center gap-2 rounded-full font-bold text-chili dark:text-rosa-claro"
              >
                <Icono nombre="basura" tam={20} /> Quitar de la alacena
              </button>
            }
          />
        )}
      </Hoja>

      {aviso && (
        <div
          role="status"
          className="aviso-entra fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-noche py-2 pr-2 pl-5 text-crema shadow-lg dark:bg-crema dark:text-noche"
        >
          <span className="text-sm font-semibold">{aviso.texto}</span>
          {aviso.deshacer && (
            <button
              type="button"
              onClick={async () => {
                await restaurarItem(aviso.deshacer as ItemAlacena)
                setAviso(null)
              }}
              className="h-10 rounded-full bg-limon-verde px-4 text-sm font-bold text-noche"
            >
              Deshacer
            </button>
          )}
        </div>
      )}
    </Pantalla>
  )
}

function Lista({
  filas,
  basicos,
  diasAviso,
  alEditar,
  alAjustar,
}: {
  filas: Fila[]
  basicos: Set<string>
  diasAviso: number
  alEditar: (f: Fila) => void
  alAjustar: (f: Fila, signo: 1 | -1) => void
}) {
  return (
    <ul className="rounded-[24px] bg-tarjeta py-1">
      {filas.map((f) => {
        const cat = CATEGORIA_POR_ID.get(f.alimento.categoria)
        const pronto = f.dias !== null && f.dias <= diasAviso
        return (
          <li key={f.item.id} className="flex items-center gap-2 py-1.5 pr-2 pl-1">
            <button
              type="button"
              onClick={() => alEditar(f)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-1 pl-3 text-left"
              aria-label={`Editar ${f.nombre}`}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: cat?.color }} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate font-bold">{f.nombre}</span>
                <span className="flex flex-wrap items-center gap-x-2 text-[13px] text-tinta-suave tabular-nums">
                  {describirCantidad(f.item.gramos, f.alimento.porciones, f.alimento.liquido)}
                  {pronto && (
                    <span className="rounded-full bg-mantequilla px-2 text-[12px] font-bold text-noche">
                      {textoVencimiento(f.dias as number)}
                    </span>
                  )}
                  {basicos.has(f.alimento.id) && (
                    <span className="rounded-full bg-pista px-2 text-[12px] font-bold">básico</span>
                  )}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => alAjustar(f, -1)}
              aria-label={`Quitar un poco de ${f.nombre}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pista transition-transform duration-100 ease-out active:scale-[0.92]"
            >
              <Icono nombre="menos" tam={18} />
            </button>
            <button
              type="button"
              onClick={() => alAjustar(f, 1)}
              aria-label={`Agregar un poco de ${f.nombre}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-limon-verde text-noche transition-transform duration-100 ease-out active:scale-[0.92]"
            >
              <Icono nombre="agregar" tam={18} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Vacia({ alAgregar }: { alAgregar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-8 text-center">
      <div className="flex size-36 items-center justify-center rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-rosa-claro text-xs font-bold text-noche">
        tu mascota
      </div>
      <h2 className="font-titulo text-2xl font-semibold">Tu alacena está vacía</h2>
      <p className="max-w-xs text-tinta-suave">
        Cuando vuelvas del mercado, agrega lo que compraste. Así sabrás qué puedes cocinar con lo que tienes.
      </p>
      <button
        type="button"
        onClick={alAgregar}
        className="h-14 rounded-full bg-limon-verde px-7 font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
      >
        Agregar lo que compré
      </button>
    </div>
  )
}
