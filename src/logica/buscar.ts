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
    // Entre esas, primero los nombres más cortos ("Huevo crudo" antes que "Huevo de codorniz").
    const largo = (a: Alimento) =>
      Math.min(...[...a.alias, a.nombre].filter((x) => normalizar(x).startsWith(q)).map((x) => x.length))
    const empiezan = alimentos
      .filter((a) => a.alias.some((x) => normalizar(x).startsWith(q)) || normalizar(a.nombre).startsWith(q))
      .sort((a, b) => largo(a) - largo(b))
    // Luego, los que tienen TODAS las palabras en cualquier orden ("pollo plancha" → "Pechuga de pollo a la plancha").
    const palabras = q.split(' ').filter((w) => w.length > 2)
    const todas =
      palabras.length > 1
        ? alimentos.filter(
            (a) =>
              !empiezan.includes(a) &&
              [...a.alias, a.nombre].some((x) => {
                const n = normalizar(x)
                return palabras.every((w) => n.includes(w))
              }),
          )
        : []
    const resto = fuse
      .search(q, { limit: limite * 2 })
      .map((r) => r.item)
      .filter((a) => !empiezan.includes(a) && !todas.includes(a))
    return [...empiezan, ...todas, ...resto].slice(0, limite)
  }
}

/**
 * Si no hay resultados con la frase completa, prueba quitando palabras del final
 * ("huevo revuelto con queso" → "huevo revuelto" → "huevo"). Dice con qué palabras encontró.
 */
export function buscarParecidos(buscar: (q: string, limite?: number) => Alimento[], consulta: string, limite = 20) {
  const palabras = normalizar(consulta).split(' ').filter(Boolean)
  for (let n = palabras.length - 1; n >= 1; n--) {
    const q = palabras.slice(0, n).join(' ')
    const r = buscar(q, limite)
    if (r.length) return { consulta: q, resultados: r }
  }
  return null
}
