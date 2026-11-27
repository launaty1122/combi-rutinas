import { useRef, useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { parsearTablaNutricional, type TablaLeida } from '../../logica/tabla-nutricional'

/**
 * "Leer la tabla con una foto": toma o elige una foto de la tabla nutricional,
 * la lee en el celular con Tesseract (OCR, en portugués) y llena el formulario.
 * Tesseract se descarga solo la primera vez que lo usas (unos MB, necesita internet);
 * la foto nunca sale del celular.
 */
export function LeerTablaFoto({ alLeer }: { alLeer: (t: TablaLeida) => void }) {
  const archivo = useRef<HTMLInputElement>(null)
  const [estado, setEstado] = useState<{ tipo: 'listo' } | { tipo: 'leyendo'; progreso: number; paso: string } | { tipo: 'error'; mensaje: string } | { tipo: 'resultado'; n: number }>({ tipo: 'listo' })

  async function leer(foto: File) {
    setEstado({ tipo: 'leyendo', progreso: 0, paso: 'Preparando el lector…' })
    try {
      // Se carga solo cuando se usa, para no hacer pesada la app.
      // Tesseract.js es un módulo CommonJS: según cómo se arme la app, sus funciones
      // llegan directo o dentro de "default". Se aceptan las dos formas.
      const mod = (await import('tesseract.js')) as typeof import('tesseract.js') & { default?: typeof import('tesseract.js') }
      const createWorker = mod.createWorker ?? mod.default?.createWorker
      if (!createWorker) throw new Error('Tesseract no cargó')
      const worker = await createWorker('por', 1, {
        logger: (m: { status: string; progress: number }) => {
          const paso = m.status.includes('recognizing') ? 'Leyendo la tabla…' : 'Descargando el lector (solo la primera vez)…'
          setEstado({ tipo: 'leyendo', progreso: m.progress, paso })
        },
      })
      const { data } = await worker.recognize(foto)
      await worker.terminate()
      const tabla = parsearTablaNutricional(data.text)
      if (tabla.encontrados === 0) {
        setEstado({ tipo: 'error', mensaje: 'No pude leer la tabla. Prueba con más luz, de frente y que la tabla llene la foto.' })
        return
      }
      alLeer(tabla)
      setEstado({ tipo: 'resultado', n: tabla.encontrados })
    } catch {
      setEstado({ tipo: 'error', mensaje: 'No se pudo usar el lector. La primera vez necesita internet para descargarse.' })
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-[22px] bg-tarjeta p-3">
      <button
        type="button"
        disabled={estado.tipo === 'leyendo'}
        onClick={() => archivo.current?.click()}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-noche font-bold text-crema disabled:opacity-60 dark:bg-crema dark:text-noche"
      >
        <Icono nombre="camara" tam={20} /> Leer la tabla con una foto
      </button>
      <input
        ref={archivo}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-label="Foto de la tabla nutricional"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) void leer(f)
        }}
      />
      {estado.tipo === 'leyendo' && (
        <div className="flex flex-col gap-1.5" role="status">
          <p className="text-sm font-bold">{estado.paso}</p>
          <div className="h-2 overflow-hidden rounded-full bg-pista">
            <div className="h-full rounded-full bg-limon-verde transition-[width] duration-300" style={{ width: `${Math.round(estado.progreso * 100)}%` }} />
          </div>
        </div>
      )}
      {estado.tipo === 'resultado' && (
        <p className="rounded-[16px] bg-mantequilla px-3 py-2 text-sm text-noche" role="status">
          Leí {estado.n} {estado.n === 1 ? 'valor' : 'valores'}. <strong>Revisa cada número con el empaque</strong>: la lectura puede equivocarse.
        </p>
      )}
      {estado.tipo === 'error' && (
        <p className="text-sm font-bold" role="alert">
          {estado.mensaje}
        </p>
      )}
      {estado.tipo === 'listo' && <p className="px-1 text-xs text-tinta-suave">De frente, con buena luz y que la tabla llene la foto. La foto no sale de tu celular.</p>}
    </div>
  )
}
