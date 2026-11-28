import { useLiveQuery } from 'dexie-react-hooks'
import { RECETAS_INICIALES, VERSION_RECETARIO } from '../datos/recetas-iniciales'
import type { Receta } from '../logica/tipos'
import { leerAjuste, guardarAjuste } from './ajustes'
import { db } from './db'

/**
 * Pone el recetario inicial en el celular la primera vez (y agrega las recetas nuevas
 * si el recetario inicial crece). Nunca pisa recetas que ya existan: si editaste o
 * borraste una, se respeta.
 */
export async function sembrarRecetas(): Promise<void> {
  const version = await leerAjuste<number>('versionRecetario', 0)
  if (version >= VERSION_RECETARIO) return
  const yaSembradas = new Set(await leerAjuste<string[]>('recetasSembradas', []))
  const nuevas = RECETAS_INICIALES.filter((r) => !yaSembradas.has(r.id))
  await db.transaction('rw', db.recetas, db.ajustes, async () => {
    await db.recetas.bulkPut(nuevas)
    await guardarAjuste('recetasSembradas', [...yaSembradas, ...nuevas.map((r) => r.id)])
    await guardarAjuste('versionRecetario', VERSION_RECETARIO)
  })
}

export function useRecetas(): Receta[] | undefined {
  return useLiveQuery(() => db.recetas.toArray(), [])
}

export function useReceta(id: string): Receta | null | undefined {
  return useLiveQuery(async () => (await db.recetas.get(id)) ?? null, [id])
}

export async function alternarFavorita(id: string): Promise<void> {
  const r = await db.recetas.get(id)
  if (r) await db.recetas.update(id, { favorita: !r.favorita })
}

export async function guardarNotas(id: string, notas: string): Promise<void> {
  await db.recetas.update(id, { notas })
}

/** Crea o actualiza una receta (hecha a mano o editada). */
export async function guardarReceta(r: Receta): Promise<void> {
  await db.recetas.put(r)
}

/** Borra una receta y la quita de la semana del mercado si estaba planeada. */
export async function borrarReceta(id: string): Promise<void> {
  await db.recetas.delete(id)
  const planeadas = await leerAjuste<{ recetaId: string; porciones: number }[]>('recetasPlaneadas', [])
  await guardarAjuste('recetasPlaneadas', planeadas.filter((p) => p.recetaId !== id))
}

export async function guardarObjetivo(id: string, objetivo: string[] | undefined): Promise<void> {
  await db.recetas.update(id, { objetivo })
}
