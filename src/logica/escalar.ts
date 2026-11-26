import type { IngredienteReceta, Receta } from './tipos'
import { cantidadSegura } from './unidades'

/** Factor para pasar de las porciones originales a las nuevas. Ej.: 2 → 3 porciones = 1,5. */
export function factorPorciones(originales: number, nuevas: number): number {
  const o = cantidadSegura(originales)
  const n = cantidadSegura(nuevas)
  if (o === 0 || n === 0) return 1
  return n / o
}

/** Escala los ingredientes de una receta a otro número de porciones (sin cambiar la original). */
export function escalarIngredientes(
  receta: Pick<Receta, 'ingredientes' | 'porciones'>,
  nuevasPorciones: number,
): IngredienteReceta[] {
  const f = factorPorciones(receta.porciones, nuevasPorciones)
  return receta.ingredientes.map((ing) => ({ ...ing, gramos: ing.gramos * f }))
}
