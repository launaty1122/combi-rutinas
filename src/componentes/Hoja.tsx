import { useEffect, useRef, type ReactNode } from 'react'
import { Icono } from './Icono'

interface Props {
  abierta: boolean
  titulo: string
  alCerrar: () => void
  children: ReactNode
}

/**
 * Hoja que sube desde abajo (bottom sheet), para agregar o editar sin salir de la pantalla.
 * Usa <dialog> del navegador: así el foco y la tecla "atrás"/Esc funcionan solos.
 */
export function Hoja({ abierta, titulo, alCerrar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const toqueEnFondo = useRef(false)
  // El evento "close" también llega cuando la app la cierra (por ejemplo, para abrir otra hoja).
  // Solo se avisa si la cerró la persona (Esc / atrás) mientras seguía abierta.
  const abiertaRef = useRef(abierta)
  abiertaRef.current = abierta

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierta && !d.open) {
      d.showModal()
      // El navegador enfoca el primer botón (cerrar); mejor ir directo al primer campo.
      d.querySelector<HTMLElement>('[autofocus], input')?.focus()
    }
    if (!abierta && d.open) d.close()
  }, [abierta])

  return (
    <dialog
      ref={ref}
      onClose={() => {
        if (abiertaRef.current) alCerrar()
      }}
      onPointerDown={(e) => {
        toqueEnFondo.current = e.target === ref.current
      }}
      onClick={(e) => {
        // Tocar fuera de la hoja (el fondo oscuro) la cierra. Solo si el toque empezó
        // y terminó en el fondo: así el mismo toque que la abre no la cierra.
        if (e.target === ref.current && toqueEnFondo.current) alCerrar()
        toqueEnFondo.current = false
      }}
      aria-label={titulo}
      className="hoja m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-hoja bg-hoja p-0 text-tinta backdrop:bg-noche/45"
    >
      <div className="px-5 pt-3 pb-8">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-pista" aria-hidden="true" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-titulo text-2xl font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
            className="flex size-11 items-center justify-center rounded-full bg-pista"
          >
            <Icono nombre="cerrar" tam={20} />
          </button>
        </div>
        {abierta && children}
      </div>
    </dialog>
  )
}
