import { useLiveQuery } from 'dexie-react-hooks'
import { calcularItem } from '../logica/diario'
import type { Alimento, ComidaGuardada, ItemComida, MomentoComida, Receta, RegistroAgua, RegistroComida } from '../logica/tipos'
import { db, nuevoId } from './db'

export function useDiario(fecha: string): RegistroComida[] | undefined {
  return useLiveQuery(() => db.diario.where('fecha').equals(fecha).sortBy('creado'), [fecha])
}

export function useAgua(fecha: string): RegistroAgua[] {
  return useLiveQuery(() => db.agua.where('fecha').equals(fecha).sortBy('creado'), [fecha], [] as RegistroAgua[])
}

export function useComidasGuardadas(): ComidaGuardada[] {
  return useLiveQuery(() => db.comidasGuardadas.toArray(), [], [] as ComidaGuardada[])
}

interface Fuentes {
  alimentos: Map<string, Alimento>
  recetas: Map<string, Receta>
}

/** Anota algo en el diario. Guarda una "foto" de sus nutrientes en ese momento. */
export async function registrar(fecha: string, momento: MomentoComida, item: ItemComida, f: Fuentes): Promise<boolean> {
  const c = calcularItem(item, f.alimentos, f.recetas)
  if (!c) return false
  await db.diario.add({
    id: nuevoId('d-'),
    fecha,
    momento,
    item,
    nombre: c.nombre,
    n: c.n,
    incompletos: c.incompletos,
    creado: new Date().toISOString(),
  })
  return true
}

/** Cambia la cantidad o la comida de un registro (recalcula sus nutrientes). */
export async function actualizarRegistro(r: RegistroComida, cambios: { momento?: MomentoComida; item?: ItemComida }, f: Fuentes) {
  const item = cambios.item ?? r.item
  const c = calcularItem(item, f.alimentos, f.recetas)
  await db.diario.update(r.id, {
    momento: cambios.momento ?? r.momento,
    item,
    ...(c ? { nombre: c.nombre, n: c.n, incompletos: c.incompletos } : {}),
  })
}

export async function borrarRegistro(id: string): Promise<RegistroComida | undefined> {
  const r = await db.diario.get(id)
  await db.diario.delete(id)
  return r
}

export async function restaurarRegistro(r: RegistroComida): Promise<void> {
  await db.diario.put(r)
}

/** Copia una comida (o todo el día, si no se indica momento) de un día a otro. */
export async function repetir(desde: string, hacia: string, momento?: MomentoComida): Promise<number> {
  const origen = await db.diario.where('fecha').equals(desde).toArray()
  const copiar = momento ? origen.filter((r) => r.momento === momento) : origen
  const ahora = new Date().toISOString()
  await db.diario.bulkAdd(copiar.map((r) => ({ ...r, id: nuevoId('d-'), fecha: hacia, creado: ahora })))
  return copiar.length
}

/** Lo más registrado en los últimos 30 días (para tenerlo a mano). */
export async function frecuentes(limite = 8): Promise<ItemComida[]> {
  const hace30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)
  const ultimos = await db.diario.where('fecha').aboveOrEqual(hace30).toArray()
  const conteo = new Map<string, { item: ItemComida; veces: number; ultimo: string }>()
  for (const r of ultimos) {
    const clave = r.item.tipo === 'alimento' ? `a:${r.item.alimentoId}` : `r:${r.item.recetaId}`
    const x = conteo.get(clave) ?? { item: r.item, veces: 0, ultimo: '' }
    x.veces++
    if (r.creado > x.ultimo) {
      x.ultimo = r.creado
      x.item = r.item // recuerda la última cantidad usada
    }
    conteo.set(clave, x)
  }
  return [...conteo.values()].sort((a, b) => b.veces - a.veces || b.ultimo.localeCompare(a.ultimo)).slice(0, limite).map((x) => x.item)
}

export async function guardarComida(nombre: string, items: ItemComida[]): Promise<void> {
  await db.comidasGuardadas.add({ id: nuevoId('g-'), nombre: nombre.trim(), items })
}

export async function borrarComidaGuardada(id: string): Promise<void> {
  await db.comidasGuardadas.delete(id)
}

// ——— Agua ———

export async function agregarAgua(fecha: string, ml: number): Promise<void> {
  if (!(ml > 0)) return
  await db.agua.add({ id: nuevoId('w-'), fecha, ml, creado: new Date().toISOString() })
}

/** Deshace el último registro de agua del día. */
export async function deshacerAgua(fecha: string): Promise<void> {
  const del = await db.agua.where('fecha').equals(fecha).sortBy('creado')
  const ultimo = del.at(-1)
  if (ultimo) await db.agua.delete(ultimo.id)
}
