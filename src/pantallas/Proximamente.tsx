import { Pantalla } from '../componentes/Pantalla'
import type { Ruta } from '../rutas'

const TEXTOS: Partial<Record<Ruta, { titulo: string; texto: string }>> = {
  hoy: {
    titulo: 'Buenos días',
    texto: 'Aquí verás tu proteína, fibra y agua del día. Llega en la Fase 2; por ahora, empieza por tu alacena.',
  },
  recetas: {
    titulo: 'Recetas',
    texto: 'Tu recetario, con lo que puedes cocinar ya. Es lo siguiente que construimos.',
  },
  progreso: {
    titulo: 'Progreso',
    texto: 'Tus medidas, tu peso y cómo vas con tus metas. Llega en la Fase 3.',
  },
}

/** Pantalla provisional para lo que todavía no está construido. */
export function Proximamente({ ruta, alAgregar }: { ruta: Ruta; alAgregar: () => void }) {
  const t = TEXTOS[ruta] ?? { titulo: '', texto: '' }
  return (
    <Pantalla ruta={ruta} titulo={t.titulo} alAgregar={alAgregar}>
      <div className="flex flex-col items-center gap-4 px-4 pt-10 text-center">
        <div className="flex size-32 items-center justify-center rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-lila text-xs font-bold text-noche">
          tu mascota
        </div>
        <p className="max-w-xs text-tinta-suave">{t.texto}</p>
        <a
          href="#/alacena"
          className="flex h-12 items-center rounded-full bg-limon-verde px-6 font-bold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Ir a la alacena
        </a>
      </div>
    </Pantalla>
  )
}
