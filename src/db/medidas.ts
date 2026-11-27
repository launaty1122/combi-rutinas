import { useLiveQuery } from 'dexie-react-hooks'
import type { Medida, RegistroAgua, RegistroComida, TipoMedida } from '../logica/tipos'
import { db, nuevoId } from './db'

export function useMedidas(): Medida[] {
  return useLiveQuery(() => db.medidas.orderBy('fecha').toArray(), [], [] as Medida[])
}

/** Guarda varias medidas de un mismo día (las vacías se ignoran). */
export async function guardarMedidas(fecha: string, valores: Partial<Record<TipoMedida, number>>): Promise<number> {
  const nuevas = Object.entries(valores)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([tipo, valor]) => ({ id: nuevoId('md-'), fecha, tipo: tipo as TipoMedida, valor: valor as number }))
  await db.medidas.bulkAdd(nuevas)
  return nuevas.length
}

export async function borrarMedida(id: string): Promise<void> {
  await db.medidas.delete(id)
}

/** Diario y agua entre dos fechas (para las gráficas de progreso). */
export function useHistorial(desde: string, hasta: string): { diario: RegistroComida[]; agua: RegistroAgua[] } | undefined {
  return useLiveQuery(
    async () => ({
      diario: await db.diario.where('fecha').between(desde, hasta, true, true).toArray(),
      agua: await db.agua.where('fecha').between(desde, hasta, true, true).toArray(),
    }),
    [desde, hasta],
  )
}
