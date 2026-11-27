import { useEffect, useRef, useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { codigoValido, mapearOFF, URL_OFF, type ProductoOFF } from '../../logica/openfoodfacts'

// Escáner de código de barras con la cámara (BarcodeDetector, que Chrome de Android trae
// de serie). Si el celular no lo soporta, se puede escribir el código a mano.
// El producto se busca en Open Food Facts (gratis, sin clave; necesita internet).

interface Detector {
  detect: (fuente: HTMLVideoElement) => Promise<{ rawValue: string }[]>
}

function crearDetector(): Detector | null {
  const w = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }
  return w.BarcodeDetector ? new w.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }) : null
}

type Estado =
  | { paso: 'camara' }
  | { paso: 'buscando'; codigo: string }
  | { paso: 'noEncontrado'; codigo: string }
  | { paso: 'error'; mensaje: string }

export function EscanearProducto({
  alEncontrar,
  alCrearManual,
}: {
  alEncontrar: (p: ProductoOFF & { codigo: string }) => void
  alCrearManual: () => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [estado, setEstado] = useState<Estado>({ paso: 'camara' })
  const [manual, setManual] = useState('')
  const [sinCamara, setSinCamara] = useState(false)

  async function buscar(codigo: string) {
    setEstado({ paso: 'buscando', codigo })
    try {
      const r = await fetch(URL_OFF(codigo))
      const p = mapearOFF(await r.json())
      if (p) alEncontrar({ ...p, codigo })
      else setEstado({ paso: 'noEncontrado', codigo })
    } catch {
      setEstado({ paso: 'error', mensaje: 'No pude conectarme a Open Food Facts. ¿Tienes internet?' })
    }
  }

  // Cámara + detección cada 300 ms. Se apaga al salir.
  useEffect(() => {
    if (estado.paso !== 'camara') return
    const detector = crearDetector()
    if (!detector || !navigator.mediaDevices?.getUserMedia) {
      setSinCamara(true)
      return
    }
    let flujo: MediaStream | null = null
    let intervalo: ReturnType<typeof setInterval> | undefined
    let vivo = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (!vivo) return s.getTracks().forEach((t) => t.stop())
        flujo = s
        if (video.current) {
          video.current.srcObject = s
          void video.current.play()
        }
        intervalo = setInterval(async () => {
          if (!video.current || video.current.readyState < 2) return
          const r = await detector.detect(video.current).catch(() => [])
          const codigo = r[0]?.rawValue
          if (codigo && codigoValido(codigo)) {
            clearInterval(intervalo)
            void buscar(codigo)
          }
        }, 300)
      })
      .catch(() => setSinCamara(true))
    return () => {
      vivo = false
      clearInterval(intervalo)
      flujo?.getTracks().forEach((t) => t.stop())
    }
  }, [estado.paso])

  const formularioManual = (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (codigoValido(manual)) void buscar(manual.trim())
      }}
    >
      <input
        inputMode="numeric"
        value={manual}
        onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))}
        placeholder="Código de barras (13 números)"
        aria-label="Código de barras"
        className="h-12 min-w-0 flex-1 rounded-full bg-pista px-4 tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-limon"
      />
      <button type="submit" disabled={!codigoValido(manual)} className="h-12 rounded-full bg-noche px-5 font-bold text-crema disabled:opacity-40 dark:bg-crema dark:text-noche">
        Buscar
      </button>
    </form>
  )

  if (estado.paso === 'buscando') {
    return <p className="py-8 text-center font-bold">Buscando el producto {estado.codigo}…</p>
  }
  if (estado.paso === 'noEncontrado' || estado.paso === 'error') {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-[20px] bg-mantequilla px-4 py-3 text-sm text-noche">
          {estado.paso === 'error' ? estado.mensaje : `Open Food Facts no tiene el producto ${estado.codigo}. Puedes crearlo con la tabla del empaque.`}
        </p>
        <button type="button" onClick={alCrearManual} className="h-12 rounded-full bg-limon-verde font-bold text-noche">
          Crear con la tabla del empaque
        </button>
        <button type="button" onClick={() => setEstado({ paso: 'camara' })} className="h-11 font-bold text-tinta-suave">
          Escanear otro
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sinCamara ? (
        <p className="text-sm text-tinta-suave">
          No pude usar la cámara para leer códigos en este celular (o no diste permiso). Escribe los números que están debajo de las barras:
        </p>
      ) : (
        <div className="relative overflow-hidden rounded-[24px] bg-noche">
          <video ref={video} playsInline muted className="aspect-[4/3] w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-limon/80" aria-hidden="true" />
          <p className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 text-sm font-bold text-crema">
            <Icono nombre="codigo" tam={16} /> Apunta al código de barras
          </p>
        </div>
      )}
      {formularioManual}
      <p className="text-xs text-tinta-suave">Los datos vienen de Open Food Facts (gratis, hecho por voluntarios): revísalos antes de guardar.</p>
    </div>
  )
}
