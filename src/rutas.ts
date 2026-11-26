import { useEffect, useState } from 'react'

// Navegación sencilla con el "#" de la dirección (#/alacena, #/recetas…).
// Así el botón "atrás" del celular funciona y no se necesita servidor.
export type Ruta = 'hoy' | 'alacena' | 'recetas' | 'progreso' | 'mas'
const RUTAS: Ruta[] = ['hoy', 'alacena', 'recetas', 'progreso', 'mas']

function leer(): Ruta {
  const r = window.location.hash.replace(/^#\/?/, '').split('/')[0] as Ruta
  return RUTAS.includes(r) ? r : 'hoy'
}

export function useRuta(): Ruta {
  const [ruta, setRuta] = useState<Ruta>(leer)
  useEffect(() => {
    const alCambiar = () => setRuta(leer())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return ruta
}

export function href(ruta: Ruta): string {
  return `#/${ruta}`
}
