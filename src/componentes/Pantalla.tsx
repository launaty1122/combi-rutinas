import type { ReactNode } from 'react'
import { href, type Ruta } from '../rutas'
import { Icono, Mancha, type NombreIcono } from './Icono'

const NAV: { ruta: Ruta; nombre: string; icono: NombreIcono }[] = [
  { ruta: 'hoy', nombre: 'Hoy', icono: 'hoy' },
  { ruta: 'alacena', nombre: 'Alacena', icono: 'alacena' },
  { ruta: 'recetas', nombre: 'Recetas', icono: 'recetas' },
  { ruta: 'progreso', nombre: 'Progreso', icono: 'progreso' },
  { ruta: 'mas', nombre: 'Más', icono: 'mas' },
]

interface Props {
  ruta: Ruta
  titulo: string
  subtitulo?: ReactNode
  /** Botón o acción a la derecha del título. */
  accion?: ReactNode
  /** Contenido extra dentro de la cabecera de color (por ejemplo, el buscador). */
  cabecera?: ReactNode
  alAgregar?: () => void
  children: ReactNode
}

/**
 * Estructura común: fondo de color propio de cada pantalla, hoja crema redondeada
 * encima y menú flotante en píldora abajo.
 */
export function Pantalla({ ruta, titulo, subtitulo, accion, cabecera, alAgregar, children }: Props) {
  return (
    <div className={`fondo-${ruta} relative flex min-h-dvh flex-col overflow-x-hidden bg-fondo`}>
      <Mancha className="pointer-events-none absolute -top-24 -right-20 w-64 text-white/15" />
      <header className="relative px-5 pt-7 pb-6 text-fondo-tinta">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-titulo text-[36px] leading-none font-semibold">{titulo}</h1>
            {subtitulo && <p className="mt-1.5 text-sm font-bold">{subtitulo}</p>}
          </div>
          {accion}
        </div>
        {cabecera && <div className="mt-4">{cabecera}</div>}
      </header>

      <main className="relative flex-1 rounded-t-hoja bg-hoja px-4 pt-5 pb-32 text-tinta">{children}</main>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-4 bottom-4 z-20 mx-auto grid h-[68px] max-w-md grid-cols-6 items-center rounded-full bg-nav px-1.5 shadow-[0_10px_30px_rgba(16,37,30,0.25)]"
      >
        {NAV.slice(0, 2).map((n) => (
          <BotonNav key={n.ruta} {...n} activo={n.ruta === ruta} />
        ))}
        <button
          type="button"
          onClick={alAgregar}
          aria-label="Agregar rápido"
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-limon text-noche transition-transform duration-150 ease-out active:scale-[0.94]"
        >
          <Icono nombre="agregar" tam={24} />
        </button>
        {NAV.slice(2).map((n) => (
          <BotonNav key={n.ruta} {...n} activo={n.ruta === ruta} />
        ))}
      </nav>
    </div>
  )
}

function BotonNav({ ruta, nombre, icono, activo }: { ruta: Ruta; nombre: string; icono: NombreIcono; activo: boolean }) {
  return (
    <a
      href={href(ruta)}
      aria-label={nombre}
      aria-current={activo ? 'page' : undefined}
      className={`mx-auto flex size-12 items-center justify-center rounded-full transition-colors duration-200 ${
        activo ? 'bg-limon-verde text-noche' : 'text-nav-icono'
      }`}
    >
      <Icono nombre={icono} />
    </a>
  )
}
