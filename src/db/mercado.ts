import { useLiveQuery } from 'dexie-react-hooks'
import { hoyISO } from '../logica/fechas'
import { terminarCompra, type RecetaPlaneada } from '../logica/mercado'
import type { ItemMercado, PrecioGuardado } from '../logica/tipos'
import { guardarAjuste, leerAjuste } from './ajustes'
import { db, nuevoId } from './db'

export function useMercado(): ItemMercado[] | undefined {
  return useLiveQuery(() => db.mercado.toArray(), [])
}

export function usePrecios(): Map<string, PrecioGuardado> {
  const lista = useLiveQuery(() => db.precios.toArray(), [], [] as PrecioGuardado[])
  return new Map(lista.map((p) => [p.clave, p]))
}

export async function agregarAlMercado(datos: Omit<ItemMercado, 'id' | 'creado' | 'comprado'>): Promise<void> {
  await db.mercado.add({ ...datos, id: nuevoId('m-'), creado: new Date().toISOString(), comprado: false })
}

export async function actualizarMercado(id: string, cambios: Partial<ItemMercado>): Promise<void> {
  await db.mercado.update(id, cambios)
}

export async function borrarDelMercado(id: string): Promise<void> {
  await db.mercado.delete(id)
}

export async function alternarComprado(id: string): Promise<void> {
  const i = await db.mercado.get(id)
  if (i) await db.mercado.update(id, { comprado: !i.comprado })
}

/** Terminar la compra: lo comprado pasa a la alacena, se recuerdan precios y se guarda el total. */
export async function terminarCompraDB(): Promise<{ total: number; alAlacena: number; items: number }> {
  const hoy = hoyISO()
  const lista = await db.mercado.toArray()
  const r = terminarCompra(lista, hoy)
  await db.transaction('rw', [db.mercado, db.alacena, db.precios, db.compras, db.ajustes], async () => {
    for (const nuevo of r.nuevosEnAlacena) await db.alacena.add({ ...nuevo, id: nuevoId('a-') })
    await db.precios.bulkPut(r.precios)
    await db.mercado.bulkDelete(r.terminados)
    if (r.terminados.length) await db.compras.add({ id: nuevoId('c-'), fecha: hoy, total: r.total, items: r.terminados.length })
    // Lo que volvió a la alacena ya no está "acabado".
    const acabados = await leerAjuste<string[]>('acabados', [])
    const comprados = new Set(r.nuevosEnAlacena.map((n) => n.alimentoId))
    await guardarAjuste('acabados', acabados.filter((id) => !comprados.has(id)))
  })
  return { total: r.total, alAlacena: r.nuevosEnAlacena.length, items: r.terminados.length }
}

// ——— Recetas que planeas cocinar ———

export function usePlaneadas(): RecetaPlaneada[] {
  return useLiveQuery(() => leerAjuste<RecetaPlaneada[]>('recetasPlaneadas', []), [], [])
}

export async function planearReceta(recetaId: string, porciones: number): Promise<void> {
  const actual = await leerAjuste<RecetaPlaneada[]>('recetasPlaneadas', [])
  await guardarAjuste('recetasPlaneadas', [...actual.filter((p) => p.recetaId !== recetaId), { recetaId, porciones }])
}

export async function quitarPlaneada(recetaId: string): Promise<void> {
  const actual = await leerAjuste<RecetaPlaneada[]>('recetasPlaneadas', [])
  await guardarAjuste('recetasPlaneadas', actual.filter((p) => p.recetaId !== recetaId))
}

// ——— Mínimos "siempre en casa" ———

export function useMinimos(): Record<string, number> {
  return useLiveQuery(() => leerAjuste<Record<string, number>>('minimos', {}), [], {})
}

export async function guardarMinimo(alimentoId: string, gramos: number | null): Promise<void> {
  const actual = await leerAjuste<Record<string, number>>('minimos', {})
  const nuevo = { ...actual }
  if (gramos && gramos > 0) nuevo[alimentoId] = gramos
  else delete nuevo[alimentoId]
  await guardarAjuste('minimos', nuevo)
}

// ——— Lo que se acabó ———

export function useAcabados(): string[] {
  return useLiveQuery(() => leerAjuste<string[]>('acabados', []), [], [])
}

export async function marcarAcabados(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const actual = await leerAjuste<string[]>('acabados', [])
  await guardarAjuste('acabados', [...new Set([...actual, ...ids])])
}

export async function olvidarAcabado(id: string): Promise<void> {
  const actual = await leerAjuste<string[]>('acabados', [])
  await guardarAjuste('acabados', actual.filter((x) => x !== id))
}
