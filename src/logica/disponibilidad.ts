import type { IngredienteReceta, ItemAlacena } from './tipos'
import { cantidadSegura } from './unidades'

/** Margen para no marcar "te falta 0,01 g" por redondeos. */
const TOLERANCIA_G = 0.5

export type EstadoIngrediente = 'tengo' | 'poco' | 'falta' | 'basico'

export interface DetalleIngrediente {
  alimentoId: string
  necesita: number
  tiene: number
  /** Gramos que faltan (0 si alcanza). */
  faltan: number
  estado: EstadoIngrediente
}

export interface Disponibilidad {
  detalle: DetalleIngrediente[]
  /** Ingredientes (sin contar básicos) que tengo en cantidad suficiente. */
  tengo: number
  /** Ingredientes que cuentan (sin básicos). */
  total: number
  /** 0–100. Una receta sin ingredientes que cuenten se considera 100 %. */
  porcentaje: number
  /** true si tengo todo: entra en "¿Qué puedo cocinar ya?". */
  completa: boolean
  /** Cuántos ingredientes faltan o no alcanzan. */
  faltantes: number
}

/** Suma cuánto hay de cada alimento en la alacena (puede haber varias compras del mismo). */
export function existenciasPorAlimento(alacena: ItemAlacena[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const item of alacena) {
    m.set(item.alimentoId, (m.get(item.alimentoId) ?? 0) + cantidadSegura(item.gramos))
  }
  return m
}

/**
 * Compara lo que pide una receta con lo que hay en la alacena.
 * - Los básicos (sal, aceite, especias…) no cuentan.
 * - Si la receta repite un alimento, se suman sus cantidades.
 * - Un ingrediente con 0 g ("al gusto") se cumple con tener cualquier cantidad.
 */
export function calcularDisponibilidad(
  ingredientes: IngredienteReceta[],
  alacena: ItemAlacena[],
  basicos: Set<string>,
): Disponibilidad {
  const existencias = existenciasPorAlimento(alacena)

  // Junta ingredientes repetidos, conservando el orden de aparición.
  const necesidades = new Map<string, number>()
  for (const ing of ingredientes) {
    necesidades.set(ing.alimentoId, (necesidades.get(ing.alimentoId) ?? 0) + cantidadSegura(ing.gramos))
  }

  const detalle: DetalleIngrediente[] = []
  let tengo = 0
  let total = 0
  for (const [alimentoId, necesita] of necesidades) {
    const tiene = existencias.get(alimentoId) ?? 0
    if (basicos.has(alimentoId)) {
      detalle.push({ alimentoId, necesita, tiene, faltan: 0, estado: 'basico' })
      continue
    }
    total++
    let estado: EstadoIngrediente
    if (tiene <= 0) estado = 'falta'
    else if (tiene + TOLERANCIA_G >= necesita) estado = 'tengo'
    else estado = 'poco'
    if (estado === 'tengo') tengo++
    const faltan = estado === 'tengo' ? 0 : Math.max(0, necesita - tiene)
    detalle.push({ alimentoId, necesita, tiene, faltan, estado })
  }

  const porcentaje = total === 0 ? 100 : Math.round((tengo / total) * 100)
  return { detalle, tengo, total, porcentaje, completa: tengo === total, faltantes: total - tengo }
}
