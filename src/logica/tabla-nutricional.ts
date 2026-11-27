import type { Nutriente } from './tipos'
import { normalizar } from './texto'

/**
 * Entiende el texto leído (OCR) de una tabla nutricional brasileña.
 *
 * Formato nuevo (ANVISA, RDC 429/2020, obligatorio desde 2022): columnas "100 g | porción | %VD".
 *   "Proteínas (g)   10   3,0   6"  → el PRIMER número es por 100 g.
 * Formato viejo: solo la columna de la porción ("Porção de 30 g").
 *   "Proteínas 3,0 g 4%"            → el número es por porción.
 *
 * El OCR se equivoca a veces (confunde O con 0, l con 1, comas…): el resultado
 * SIEMPRE se muestra en el formulario para revisarlo con el empaque.
 */

export interface TablaLeida {
  base: 'por100' | 'porcion'
  gramosPorcion?: number
  valores: Partial<Record<Nutriente, string>>
  /** Cuántos nutrientes se reconocieron (para avisar si la foto salió mala). */
  encontrados: number
}

// Etiquetas en portugués (y español), del más específico al más general.
const FILAS: { k: Nutriente; patrones: RegExp[] }[] = [
  { k: 'kcal', patrones: [/valor energ[eé]tico/, /\benerg[ií]a\b/, /\bkcal\b/] },
  { k: 'carbohidratos', patrones: [/carboidratos? (totais|total)?/, /carbohidratos?/] },
  { k: 'proteina', patrones: [/prote[ií]nas?/] },
  { k: 'grasaSaturada', patrones: [/gorduras? saturadas?/, /grasas? saturadas?/] },
  { k: 'grasa', patrones: [/gorduras? totais/, /gorduras? totales/, /grasas? totales/] },
  { k: 'fibra', patrones: [/fibras? alimentar(es)?/, /fibras? diet[eé]ticas?/, /\bfibras?\b/] },
  { k: 'sodio', patrones: [/s[oó]dio/] },
  { k: 'calcio', patrones: [/c[aá]lcio/, /calcio/] },
  { k: 'hierro', patrones: [/\bferro\b/, /hierro/] },
  { k: 'potasio', patrones: [/pot[aá]ssio/, /potasio/] },
  { k: 'vitaminaC', patrones: [/vitamina c\b/] },
]

// Filas que NO deben confundirse con las de arriba.
const IGNORAR = [/a[cç][uú]cares/, /azucares/, /adicionad/, /trans\b/, /monoinsat/, /poliinsat/, /colesterol/, /lactose/]

/** Números de una línea, corrigiendo errores típicos del OCR (O→0, l→1, coma decimal). */
function numerosDe(linea: string): number[] {
  const limpia = linea
    .replace(/(?<=\d)[oO]|[oO](?=\d)/g, '0')
    .replace(/(?<=\d)[lI|]|[lI|](?=\d)/g, '1')
    .replace(/(\d)\s*,\s*(\d)/g, '$1.$2')
  return [...limpia.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0])).filter((n) => Number.isFinite(n))
}

export function parsearTablaNutricional(texto: string): TablaLeida {
  const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const todo = normalizar(texto)

  // ¿Formato nuevo con columna de 100 g?
  const formatoNuevo = /\b100\s*(g|ml)\b/.test(todo)
  const porcion = todo.match(/por[cç][aã]o(?: de)?[^0-9]{0,12}(\d+(?:[.,]\d+)?)\s*(g|ml)/)
  const gramosPorcion = porcion ? Number(porcion[1].replace(',', '.')) : undefined

  const valores: Partial<Record<Nutriente, string>> = {}
  for (const original of lineas) {
    const linea = normalizar(original)
    if (IGNORAR.some((re) => re.test(linea))) continue
    const fila = FILAS.find((f) => !valores[f.k] && f.patrones.some((re) => re.test(linea)))
    if (!fila) continue
    // Quita lo que va entre paréntesis en la etiqueta: "(g)", "(mg)", "(kcal)".
    let nums = numerosDe(linea.replace(/\([^)]*\)/g, ' '))
    // Energía: si viene "114 kcal = 479 kJ", usar el número pegado a kcal.
    if (fila.k === 'kcal') {
      const kcal = linea.match(/(\d+(?:[.,]\d+)?)\s*kcal/)
      if (kcal) nums = [Number(kcal[1].replace(',', '.')), ...nums]
    }
    if (nums.length === 0) continue
    valores[fila.k] = String(nums[0]).replace('.', ',')
  }

  return {
    base: formatoNuevo ? 'por100' : 'porcion',
    gramosPorcion,
    valores,
    encontrados: Object.keys(valores).length,
  }
}
