import Fuse from 'fuse.js'
import type { Alimento } from './tipos'
import { normalizar } from './texto'

/**
 * Crea un buscador de alimentos tolerante a tildes, mayúsculas y pequeños errores.
 * Busca en los nombres en español (con más peso) y en el nombre original en portugués.
 */
export function crearBuscador(alimentos: Alimento[]) {
  const fuse = new Fuse(alimentos, {
    keys: [
      { name: 'alias', weight: 2 },
      { name: 'nombre', weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    ignoreDiacritics: true,
    includeScore: true,
  })

  return function buscar(consulta: string, limite = 20): Alimento[] {
    const q = normalizar(consulta)
    if (!q) return []
    // Primero, coincidencias que empiezan igual (más naturales al escribir).
    const empiezan = alimentos.filter(
      (a) => a.alias.some((x) => normalizar(x).startsWith(q)) || normalizar(a.nombre).startsWith(q),
    )
    const resto = fuse
      .search(q, { limit: limite * 2 })
      .map((r) => r.item)
      .filter((a) => !empiezan.includes(a))
    return [...empiezan, ...resto].slice(0, limite)
  }
}
