import { useEffect, useState } from 'react'

// Navegación sencilla con el "#" de la dirección (#/alacena, #/recetas/ini-07…).
// Así el botón "atrás" del celular funciona y no se necesita servidor.
export type Ruta = 'hoy' | 'alacena' | 'recetas' | 'progreso' | 'mas'
const RUTAS: Ruta[] = ['hoy', 'alacena', 'recetas', 'progreso', 'mas']

export interface Ubicacion {
  ruta: Ruta
  /** Lo que va después de la ruta (por ejemplo, el id de una receta). */
  param?: string
}

function leer(): Ubicacion {
  const [r, param] = window.location.hash.replace(/^#\/?/, '').split('/') as [Ruta, string | undefined]
  return RUTAS.includes(r) ? { ruta: r, param: param ? decodeURIComponent(param) : undefined } : { ruta: 'hoy' }
}

export function useUbicacion(): Ubicacion {
  const [u, setU] = useState<Ubicacion>(leer)
  useEffect(() => {
    const alCambiar = () => {
      setU(leer())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return u
}

export function href(ruta: Ruta, param?: string): string {
  return param ? `#/${ruta}/${encodeURIComponent(param)}` : `#/${ruta}`
}
