import { useLiveQuery } from 'dexie-react-hooks'
import type { ItemAlacena } from '../logica/tipos'
import { cantidadSegura } from '../logica/unidades'
import { db, nuevoId } from './db'

export function useAlacena(): ItemAlacena[] | undefined {
  return useLiveQuery(() => db.alacena.toArray(), [])
}

export async function agregarAlAlacena(datos: Omit<ItemAlacena, 'id'>): Promise<string> {
  const id = nuevoId('a-')
  await db.alacena.add({ ...datos, id, gramos: cantidadSegura(datos.gramos) })
  return id
}

export async function actualizarItem(id: string, cambios: Partial<Omit<ItemAlacena, 'id'>>): Promise<void> {
  const limpio = { ...cambios }
  if (limpio.gramos !== undefined) limpio.gramos = cantidadSegura(limpio.gramos)
  await db.alacena.update(id, limpio)
}

export async function borrarItem(id: string): Promise<void> {
  await db.alacena.delete(id)
}

/**
 * Ajuste rápido con + y −. Si llega a 0, el ítem sale de la alacena
 * (devuelve el ítem borrado para poder deshacer).
 */
export async function ajustarRapido(id: string, deltaGramos: number): Promise<ItemAlacena | null> {
  const item = await db.alacena.get(id)
  if (!item) return null
  const nuevo = Math.max(0, item.gramos + deltaGramos)
  if (nuevo <= 0.5) {
    await db.alacena.delete(id)
    return item
  }
  await db.alacena.update(id, { gramos: nuevo })
  return null
}

/** Vuelve a poner un ítem borrado (para "Deshacer"). */
export async function restaurarItem(item: ItemAlacena): Promise<void> {
  await db.alacena.put(item)
}
