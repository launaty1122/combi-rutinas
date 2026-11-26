import type { IngredienteReceta, ItemAlacena } from './tipos'
import { cantidadSegura } from './unidades'

const MARGEN_G = 0.5

export interface LineaDescuento {
  alimentoId: string
  /** Gramos que la receta pedía. */
  pedido: number
  /** Gramos que realmente se descontaron. */
  descontado: number
  /** Gramos que no había (se cocinó con menos, o se usó algo que no estaba registrado). */
  noHabia: number
}

export interface ResultadoDescuento {
  alacena: ItemAlacena[]
  resumen: LineaDescuento[]
}

/** Ordena para gastar primero lo que vence antes; luego lo comprado antes. */
function ordenDeUso(a: ItemAlacena, b: ItemAlacena): number {
  const va = a.venceEl ?? '9999'
  const vb = b.venceEl ?? '9999'
  if (va !== vb) return va < vb ? -1 : 1
  const ca = a.compradoEl ?? '9999'
  const cb = b.compradoEl ?? '9999'
  return ca < cb ? -1 : ca > cb ? 1 : 0
}

/**
 * Descuenta de la alacena lo que usó una receta. No modifica la alacena original:
 * devuelve una nueva, más un resumen para mostrar antes de confirmar.
 * - Los básicos no se descuentan.
 * - Si hay varias compras del mismo alimento, gasta primero la que vence antes.
 * - Lo que llega a 0 sale de la alacena.
 */
export function descontarDeAlacena(
  alacena: ItemAlacena[],
  ingredientes: IngredienteReceta[],
  basicos: Set<string>,
): ResultadoDescuento {
  const nueva = alacena.map((i) => ({ ...i, gramos: cantidadSegura(i.gramos) }))

  const pedidos = new Map<string, number>()
  for (const ing of ingredientes) {
    if (basicos.has(ing.alimentoId)) continue
    pedidos.set(ing.alimentoId, (pedidos.get(ing.alimentoId) ?? 0) + cantidadSegura(ing.gramos))
  }

  const resumen: LineaDescuento[] = []
  for (const [alimentoId, pedido] of pedidos) {
    let pendiente = pedido
    const items = nueva.filter((i) => i.alimentoId === alimentoId).sort(ordenDeUso)
    for (const item of items) {
      if (pendiente <= 0) break
      const usa = Math.min(item.gramos, pendiente)
      item.gramos -= usa
      pendiente -= usa
    }
    const noHabia = pendiente > MARGEN_G ? pendiente : 0
    resumen.push({ alimentoId, pedido, descontado: pedido - Math.max(0, pendiente), noHabia })
  }

  return { alacena: nueva.filter((i) => i.gramos > MARGEN_G), resumen }
}
