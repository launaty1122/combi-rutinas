import { useEffect, useRef, useState } from 'react'
import { Icono } from './Icono'

// Dictado por voz con la Web Speech API de Chrome.
// Ojo (honestidad): en Android, Chrome envía el audio a los servidores de Google para
// pasarlo a texto, y necesita internet. La app solo recibe el texto.

interface ReconocimientoVoz {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

function crearReconocimiento(): ReconocimientoVoz | null {
  const w = window as unknown as { SpeechRecognition?: new () => ReconocimientoVoz; webkitSpeechRecognition?: new () => ReconocimientoVoz }
  const Clase = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return Clase ? new Clase() : null
}

export const hayDictado = () => typeof window !== 'undefined' && crearReconocimiento() !== null

/** Botón de micrófono: mientras hablas va escribiendo; al terminar entrega el texto. */
export function BotonDictado({ alTexto }: { alTexto: (texto: string, final: boolean) => void }) {
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<ReconocimientoVoz | null>(null)

  useEffect(() => () => rec.current?.stop(), [])

  if (!hayDictado()) return null

  function empezar() {
    const r = crearReconocimiento()
    if (!r) return
    r.lang = 'es-CO'
    r.interimResults = true
    r.continuous = false
    r.onresult = (e) => {
      let texto = ''
      let final = false
      for (let i = 0; i < e.results.length; i++) {
        texto += e.results[i][0].transcript
        final = e.results[i].isFinal
      }
      alTexto(texto, final)
    }
    r.onerror = (e) => {
      setError(
        e.error === 'not-allowed'
          ? 'Para dictar, permite el micrófono en Chrome.'
          : e.error === 'network'
            ? 'El dictado necesita internet.'
            : 'No te entendí. Intenta otra vez.',
      )
    }
    r.onend = () => setEscuchando(false)
    rec.current = r
    setError(null)
    setEscuchando(true)
    r.start()
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => (escuchando ? rec.current?.stop() : empezar())}
        aria-pressed={escuchando}
        className={`flex h-12 items-center justify-center gap-2 rounded-full font-bold transition-colors duration-200 ${
          escuchando ? 'bg-rosa text-noche' : 'bg-pista'
        }`}
      >
        <Icono nombre="microfono" tam={20} />
        {escuchando ? 'Te escucho… toca para terminar' : 'Dictar'}
      </button>
      {error && <p className="text-xs font-bold">{error}</p>}
    </div>
  )
}
