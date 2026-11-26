import { carbohidratosNetos } from './nutricion'
import type { Nutrientes } from './tipos'

/**
 * Reglas para sugerir etiquetas de "objetivo" a partir de la ficha por porción.
 * Son sugerencias: en la app se pueden corregir a mano.
 */
export const REGLAS_ETIQUETAS = {
  /** Alta en proteína: 20 g o más por porción. */
  proteinaMinima: 20,
  /** Alta en fibra: 6 g o más por porción. */
  fibraMinima: 6,
  /** Baja en carbohidratos: 15 g o menos de carbohidratos netos por porción. */
  carbosNetosMaximos: 15,
}

export type EtiquetaObjetivo = 'alta-en-proteina' | 'alta-en-fibra' | 'baja-en-carbohidratos'

export const NOMBRE_ETIQUETA: Record<EtiquetaObjetivo, string> = {
  'alta-en-proteina': 'Alta en proteína',
  'alta-en-fibra': 'Alta en fibra',
  'baja-en-carbohidratos': 'Baja en carbohidratos',
}

/** Sugiere etiquetas. Si falta un dato, no sugiere esa etiqueta (no adivina). */
export function sugerirEtiquetas(porPorcion: Nutrientes): EtiquetaObjetivo[] {
  const r: EtiquetaObjetivo[] = []
  if (porPorcion.proteina !== null && porPorcion.proteina >= REGLAS_ETIQUETAS.proteinaMinima) r.push('alta-en-proteina')
  if (porPorcion.fibra !== null && porPorcion.fibra >= REGLAS_ETIQUETAS.fibraMinima) r.push('alta-en-fibra')
  const netos = carbohidratosNetos(porPorcion)
  if (netos !== null && netos <= REGLAS_ETIQUETAS.carbosNetosMaximos) r.push('baja-en-carbohidratos')
  return r
}
