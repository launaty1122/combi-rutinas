// Íconos de trazo redondeado, todos en un mismo estilo (24×24, trazo 2.3).
const RUTAS = {
  hoy: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  alacena: 'M7 3h10v4H7z M6 7h12a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1z M8 12h8',
  recetas: 'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z M5 18a2 2 0 0 1 2-2h12 M9 8h6',
  progreso: 'M4 20h16 M7 16v-4 M12 16V8 M17 16v-6',
  mas: 'M5 12h.01 M12 12h.01 M19 12h.01',
  agregar: 'M12 5v14 M5 12h14',
  menos: 'M5 12h14',
  buscar: 'M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14z M20 20l-4-4',
  reloj: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18z M12 7v5l3 2',
  cerrar: 'M6 6l12 12 M18 6L6 18',
  atras: 'M15 5l-7 7 7 7',
  flecha: 'M5 12h14 M13 6l6 6-6 6',
  check: 'M5 12l5 5 9-10',
  basura: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12 M9 7V4h6v3',
  camara: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M12 10a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7z',
  microfono:'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v3',
  codigo: 'M4 6v12 M7 6v12 M10 6v12 M14 6v12 M16 6v12 M20 6v12',
  gota:'M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z',
  carrito: 'M3 4h2l2.4 11h10.2L20 8H6.2 M9 20h.01 M17 20h.01',
  corazon:'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  alerta: 'M12 6v7 M12 18h.01',
  olla: 'M3 11h18a9 9 0 0 1-18 0z M8 7c0-2 2-2 2-4 M13 7c0-2 2-2 2-4',
  sal:'M8 3h8l1 4H7z M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M10 12h.01 M14 12h.01 M12 15h.01',
} as const

export type NombreIcono = keyof typeof RUTAS

export function Icono({
  nombre,
  tam = 22,
  className = '',
  relleno = false,
}: {
  nombre: NombreIcono
  tam?: number
  className?: string
  relleno?: boolean
}) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill={relleno ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={RUTAS[nombre]} />
    </svg>
  )
}

/** Mancha orgánica de decoración (la misma forma en toda la app). */
export function Mancha({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M44.5,-61.3C56.9,-52.6,65.4,-38.3,69.6,-22.9C73.8,-7.5,73.7,9,67.7,22.7C61.7,36.4,49.8,47.3,36.3,55.9C22.8,64.5,7.7,70.8,-8.3,71.7C-24.3,72.6,-41.2,68.1,-52.5,57.6C-63.8,47.1,-69.5,30.6,-71.1,14.3C-72.7,-2,-70.2,-18.1,-62.4,-30.9C-54.6,-43.7,-41.5,-53.2,-28,-61.5C-14.5,-69.8,-0.6,-76.9,13.6,-75.5C27.8,-74.1,32.1,-70,44.5,-61.3Z"
      />
    </svg>
  )
}
