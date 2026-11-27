import { useLiveQuery } from 'dexie-react-hooks'
import type { ItemAlacena } from '../logica/tipos'
import { cantidadSegura } from '../logica/unidades'
import { db, nuevoId } from './db'
import { marcarAcabados, olvidarAcabado } from './mercado'

export function useAlacena(): ItemAlacena[] | undefined {
  return useLiveQuery(() => db.alacena.toArray(), [])
}

export async function agregarAlAlacena(datos: Omit<ItemAlacena, 'id'>): Promise<string> {
  const id = nuevoId('a-')
  await db.alacena.add({ ...datos, id, gramos: cantidadSegura(datos.gramos) })
  await olvidarAcabado(datos.alimentoId)
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
    // Si ya no queda nada de ese alimento, se anota como "se acabó" (para el mercado).
    const quedan = await db.alacena.where('alimentoId').equals(item.alimentoId).count()
    if (quedan === 0) await marcarAcabados([item.alimentoId])
    return item
  }
  await db.alacena.update(id, { gramos: nuevo })
  return null
}

/**
 * Reemplaza la alacena completa por una nueva versión (por ejemplo, después de "Cociné esto").
 * Todo o nada: si algo falla, la alacena queda como estaba.
 */
export async function reemplazarAlacena(nueva: ItemAlacena[]): Promise<void> {
  const antes = new Set((await db.alacena.toArray()).map((i) => i.alimentoId))
  const despues = new Set(nueva.map((i) => i.alimentoId))
  await marcarAcabados([...antes].filter((id) => !despues.has(id)))
  await db.transaction('rw', db.alacena, async () => {
    await db.alacena.clear()
    await db.alacena.bulkPut(nueva)
  })
}

/** Vuelve a poner un ítem borrado (para "Deshacer"). */
export async function restaurarItem(item: ItemAlacena): Promise<void> {
  await db.alacena.put(item)
  await olvidarAcabado(item.alimentoId)
}
