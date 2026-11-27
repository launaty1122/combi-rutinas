import { useLiveQuery } from 'dexie-react-hooks'
import type { Alimento } from '../logica/tipos'
import { db } from './db'

export function useAlimentosPersonales(): Alimento[] {
  return useLiveQuery(() => db.alimentosPersonales.toArray(), [], [] as Alimento[])
}

export async function guardarAlimentoPersonal(a: Alimento): Promise<void> {
  await db.alimentosPersonales.put(a)
}

/** Cuántas recetas y cosas de la alacena usan este alimento (para avisar antes de borrarlo). */
export async function usosDeAlimento(id: string): Promise<{ recetas: number; alacena: number }> {
  const recetas = await db.recetas.filter((r) => r.ingredientes.some((i) => i.alimentoId === id)).count()
  const alacena = await db.alacena.where('alimentoId').equals(id).count()
  return { recetas, alacena }
}

export async function borrarAlimentoPersonal(id: string): Promise<void> {
  await db.alimentosPersonales.delete(id)
}
