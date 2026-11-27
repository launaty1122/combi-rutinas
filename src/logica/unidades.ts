import type { Porcion } from './tipos'
import { formatearNumero } from './texto'

/** Convierte un número que puede venir mal (NaN, negativo) en una cantidad válida (≥ 0). */
export function cantidadSegura(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0
}

/**
 * Pasa una cantidad a gramos.
 * - Sin porción: la cantidad ya está en gramos (o ml).
 * - Con porción: cantidad × gramos de la porción. Ej.: 2 × "1 huevo" (50 g) = 100 g.
 */
export function aGramos(cantidad: number, porcion?: Porcion | null): number {
  const c = cantidadSegura(cantidad)
  if (!porcion) return c
  return c * cantidadSegura(porcion.gramos)
}

/** "120 g", "1,5 kg", "200 ml", "1,2 L". */
export function formatearGramos(gramos: number, liquido = false): string {
  const g = cantidadSegura(gramos)
  if (g >= 1000) return `${formatearNumero(g / 1000, 2)} ${liquido ? 'L' : 'kg'}`
  return `${formatearNumero(g, g < 10 ? 1 : 0)} ${liquido ? 'ml' : 'g'}`
}

/**
 * Nombre de una porción para una cantidad: ("1 huevo", 8) → "8 huevos"; ("1 taza", 0.5) → "½ taza".
 * Pluraliza solo la primera palabra, de forma sencilla.
 */
export function nombrePorcion(nombre: string, cantidad: number): string {
  // "½ taza" × 10 son 5 tazas: se multiplica por la fracción del nombre.
  const fraccion = nombre.startsWith('½ ') ? 0.5 : nombre.startsWith('¼ ') ? 0.25 : 1
  cantidad = cantidad * fraccion
  const palabras = nombre.replace(/^(1|½|¼)\s+/, '').split(' ')
  const numero = cantidad === 0.5 ? '½' : cantidad === 0.25 ? '¼' : formatearNumero(cantidad, 2)
  if (cantidad <= 1) return [numero, ...palabras].join(' ')
  // Pluraliza hasta encontrar "de", "con"…: "huevo de codorniz" → "huevos de codorniz".
  const PARADA = new Set(['de', 'del', 'con', 'sin', 'en', 'para', 'a'])
  let pluralizar = true
  const resultado = palabras.map((p) => {
    if (PARADA.has(p.toLowerCase())) pluralizar = false
    return pluralizar ? plural(p) : p
  })
  return [numero, ...resultado].join(' ')
}

/** Plural sencillo en español: taza → tazas, cucharón → cucharones, pan → panes. */
function plural(palabra: string): string {
  if (/[aeiouáéíóú]$/i.test(palabra)) return palabra + 's'
  if (/z$/i.test(palabra)) return palabra.slice(0, -1) + 'ces'
  const sinTilde = palabra.replace(/[áéíóú](?=[nsl]$)/i, (v) => v.normalize('NFD')[0])
  return sinTilde + 'es'
}

/** "8 huevos · 400 g" si es un número redondo de porciones; si no, solo "600 g". */
export function describirCantidad(gramos: number, porciones: Porcion[], liquido = false): string {
  const g = formatearGramos(gramos, liquido)
  const p = enPorciones(gramos, porciones)
  return p ? `${nombrePorcion(p.porcion.nombre, p.cantidad)} · ${g}` : g
}

/**
 * Si los gramos corresponden a un número "redondo" de alguna porción
 * (múltiplo de ½, hasta 12: una docena), devuelve cuántas son. Ej.: 100 g de huevo → 2 (de "1 huevo").
 */
export function enPorciones(gramos: number, porciones: Porcion[]): { porcion: Porcion; cantidad: number } | null {
  for (const p of porciones) {
    if (p.gramos <= 0) continue
    const cantidad = gramos / p.gramos
    const aMedios = Math.round(cantidad * 2) / 2
    if (aMedios > 0 && aMedios <= 12 && Math.abs(cantidad - aMedios) < 0.02) {
      return { porcion: p, cantidad: aMedios }
    }
  }
  return null
}
