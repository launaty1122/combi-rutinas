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
  const [estado, setEstado] = useState<{ tipo: 'listo' } | { tipo: 'leyendo'; progreso: number; paso: string } | { tipo: 'error'; mensaje: string; detalle?: string } | { tipo: 'resultado'; n: number }>({ tipo: 'listo' })

  async function leer(fotoOriginal: File) {
    setEstado({ tipo: 'leyendo', progreso: 0, paso: 'Preparando la foto…' })
    // Se anota en qué paso va, para que el mensaje de error diga dónde falló.
    let etapa = 'preparar la foto'
    try {
      // Las fotos del celular son enormes (12 MP o más): el lector se queda sin memoria.
      // Para leer una tabla basta con ~1600 px, y así además es más rápido.
      const foto = await achicarFoto(fotoOriginal, 1600)
      etapa = 'cargar el lector'
      // Se carga solo cuando se usa, para no hacer pesada la app.
      // Tesseract.js es un módulo CommonJS: según cómo se arme la app, sus funciones
      // llegan directo o dentro de "default". Se aceptan las dos formas.
      const mod = (await import('tesseract.js')) as typeof import('tesseract.js') & { default?: typeof import('tesseract.js') }
      const createWorker = mod.createWorker ?? mod.default?.createWorker
      if (!createWorker) throw new Error('Tesseract no cargó')
      etapa = 'descargar el lector'
      const worker = await createWorker('por', 1, {
        logger: (m: { status: string; progress: number }) => {
          const paso = m.status.includes('recognizing') ? 'Leyendo la tabla…' : 'Descargando el lector (solo la primera vez)…'
          setEstado({ tipo: 'leyendo', progreso: m.progress, paso })
        },
      })
      etapa = 'leer la foto'
      const { data } = await worker.recognize(foto)
      await worker.terminate()
      const tabla = parsearTablaNutricional(data.text)
      if (tabla.encontrados === 0) {
        setEstado({ tipo: 'error', mensaje: 'No pude leer la tabla. Prueba con más luz, de frente y que la tabla llene la foto.' })
        return
      }
      alLeer(tabla)
      setEstado({ tipo: 'resultado', n: tabla.encontrados })
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e)
      setEstado({
        tipo: 'error',
        mensaje:
          etapa === 'descargar el lector' || etapa === 'cargar el lector'
            ? 'No se pudo descargar el lector. Revisa tu internet e inténtalo otra vez.'
            : 'No pude leer esta foto. Prueba con otra: de frente, con buena luz y que la tabla llene la foto.',
        detalle: `Falló al ${etapa}: ${detalle}`,
      })
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
        <div role="alert" className="flex flex-col gap-1">
          <p className="text-sm font-bold">{estado.mensaje}</p>
          {estado.detalle && <p className="text-[11px] break-words text-tinta-suave">Detalle (para Claude): {estado.detalle}</p>}
        </div>
      )}
      {estado.tipo === 'listo' && <p className="px-1 text-xs text-tinta-suave">De frente, con buena luz y que la tabla llene la foto. La foto no sale de tu celular.</p>}
    </div>
  )
}

/**
 * Achica la foto para que el lector no se quede sin memoria en el celular.
 * Si el navegador no puede (o la foto ya es pequeña), devuelve la original.
 */
async function achicarFoto(foto: File, maxLado: number): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') return foto
  const img = await createImageBitmap(foto)
  const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
  if (escala === 1) {
    img.close()
    return foto
  }
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(img.width * escala)
  lienzo.height = Math.round(img.height * escala)
  const ctx = lienzo.getContext('2d')
  if (!ctx) {
    img.close()
    return foto
  }
  ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height)
  img.close()
  return await new Promise<Blob>((resolver) => lienzo.toBlob((b) => resolver(b ?? foto), 'image/jpeg', 0.92))
}
