import { useState } from 'react'
import { SelectorCantidad, useSelectorCantidad } from '../../componentes/SelectorCantidad'
import { nombreVisible } from '../../datos/alimentos'
import { leerPrecio, precioSugerido } from '../../logica/mercado'
import type { Alimento, PrecioGuardado, SeccionOtros } from '../../logica/tipos'

export const SECCIONES_OTROS: { id: SeccionOtros; nombre: string; color: string }[] = [
  { id: 'aseo', nombre: 'Aseo personal', color: '#9BD0EC' },
  { id: 'limpieza', nombre: 'Limpieza del hogar', color: '#C9C2F7' },
  { id: 'utensilios', nombre: 'Utensilios de cocina', color: '#F2923B' },
  { id: 'otros', nombre: 'Otros', color: '#E6E3D8' },
]

function CampoPrecio({ valor, alCambiar, ayuda }: { valor: string; alCambiar: (v: string) => void; ayuda?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold">
      Precio (opcional)
      <span className="flex h-12 items-center rounded-2xl bg-pista pl-4 focus-within:ring-3 focus-within:ring-limon">
        <span className="text-tinta-suave">R$</span>
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          placeholder="0,00"
          className="w-full min-w-0 bg-transparent px-2 text-base font-medium tabular-nums outline-none"
        />
      </span>
      {ayuda && <span className="text-xs font-normal text-tinta-suave">{ayuda}</span>}
    </label>
  )
}

const botonGuardar =
  'h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-45'

/** Comida para el mercado: cantidad + precio (sugiere el último que pagaste). */
export function FormularioMercadoAlimento({
  alimento,
  inicial,
  precioAnterior,
  textoGuardar,
  alGuardar,
  extra,
}: {
  alimento: Alimento
  inicial?: { gramos?: number; precio?: number }
  precioAnterior?: PrecioGuardado
  textoGuardar: string
  alGuardar: (d: { gramos: number; precio?: number }) => void
  extra?: React.ReactNode
}) {
  const cantidad = useSelectorCantidad(alimento, inicial?.gramos)
  const [precio, setPrecio] = useState(inicial?.precio !== undefined ? String(inicial.precio).replace('.', ',') : '')
  const sugerido = precioSugerido(precioAnterior, cantidad.gramos)
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (cantidad.gramos > 0) alGuardar({ gramos: cantidad.gramos, precio: leerPrecio(precio) ?? (precio ? undefined : sugerido) })
      }}
    >
      <div>
        <p className="font-titulo text-xl leading-tight font-semibold">{nombreVisible(alimento)}</p>
        {alimento.alias.length > 0 && <p className="mt-0.5 text-sm text-tinta-suave">{alimento.nombre}</p>}
      </div>
      <SelectorCantidad alimento={alimento} estado={cantidad} etiqueta="¿Cuánto vas a comprar?" />
      <CampoPrecio
        valor={precio}
        alCambiar={setPrecio}
        ayuda={
          sugerido !== undefined && !precio
            ? `La última vez: unos R$ ${sugerido.toFixed(2).replace('.', ',')} por esta cantidad (se usa si lo dejas vacío).`
            : undefined
        }
      />
      <button type="submit" disabled={cantidad.gramos <= 0} className={botonGuardar}>
        {textoGuardar}
      </button>
      {extra}
    </form>
  )
}

/** Algo que no es comida: nombre, sección, cantidad en texto y precio. */
export function FormularioMercadoOtro({
  inicial,
  precioDe,
  textoGuardar,
  alGuardar,
  extra,
}: {
  inicial?: { nombre?: string; seccion?: SeccionOtros; cantidadTexto?: string; precio?: number }
  precioDe: (nombre: string) => PrecioGuardado | undefined
  textoGuardar: string
  alGuardar: (d: { nombre: string; seccion: SeccionOtros; cantidadTexto?: string; precio?: number }) => void
  extra?: React.ReactNode
}) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [seccion, setSeccion] = useState<SeccionOtros>(inicial?.seccion ?? 'aseo')
  const [cantidadTexto, setCantidadTexto] = useState(inicial?.cantidadTexto ?? '')
  const [precio, setPrecio] = useState(inicial?.precio !== undefined ? String(inicial.precio).replace('.', ',') : '')
  const anterior = nombre.trim() ? precioDe(nombre) : undefined
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!nombre.trim()) return
        alGuardar({
          nombre: nombre.trim(),
          seccion,
          cantidadTexto: cantidadTexto.trim() || undefined,
          precio: leerPrecio(precio) ?? (precio ? undefined : anterior?.precio),
        })
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        ¿Qué necesitas?
        <input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Jabón, papel higiénico, esponjas…"
          className="h-12 rounded-2xl bg-pista px-4 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
        />
      </label>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Sección</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {SECCIONES_OTROS.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={seccion === s.id}
              onClick={() => setSeccion(s.id)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold transition-colors duration-150 ${
                seccion === s.id ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : 'bg-pista'
              }`}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Cantidad (opcional)
        <input
          value={cantidadTexto}
          onChange={(e) => setCantidadTexto(e.target.value)}
          placeholder="2 unidades, 1 paquete…"
          className="h-12 rounded-2xl bg-pista px-4 text-base font-medium outline-none focus-visible:ring-3 focus-visible:ring-limon"
        />
      </label>
      <CampoPrecio
        valor={precio}
        alCambiar={setPrecio}
        ayuda={anterior && !precio ? `La última vez pagaste R$ ${anterior.precio.toFixed(2).replace('.', ',')} (se usa si lo dejas vacío).` : undefined}
      />
      <button type="submit" disabled={!nombre.trim()} className={botonGuardar}>
        {textoGuardar}
      </button>
      {extra}
    </form>
  )
}
