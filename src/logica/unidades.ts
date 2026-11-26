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
 * Si los gramos corresponden a un número "redondo" de alguna porción
 * (múltiplo de ½, hasta 20), devuelve cuántas son. Ej.: 100 g de huevo → 2 (de "1 huevo").
 */
export function enPorciones(gramos: number, porciones: Porcion[]): { porcion: Porcion; cantidad: number } | null {
  for (const p of porciones) {
    if (p.gramos <= 0) continue
    const cantidad = gramos / p.gramos
    const aMedios = Math.round(cantidad * 2) / 2
    if (aMedios > 0 && aMedios <= 20 && Math.abs(cantidad - aMedios) < 0.02) {
      return { porcion: p, cantidad: aMedios }
    }
  }
  return null
}
