import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from './db'

/**
 * Básicos por defecto: no cuentan como faltantes en las recetas ni se descuentan al cocinar.
 * Sal, aceites, ajo y especias. Se pueden cambiar en la app.
 */
export const BASICOS_POR_DEFECTO = [
  'taco-517', // sal gruesa
  'taco-516', // sal dietética
  'taco-272', // aceite de soya
  'taco-260', // aceite de oliva
  'taco-268', // aceite de canola
  'taco-269', // aceite de girasol
  'usda-171320', // canela
]

/** Días antes del vencimiento en que se avisa "úsalo pronto". */
export const DIAS_AVISO_VENCE_POR_DEFECTO = 3

export async function leerAjuste<T>(clave: string, porDefecto: T): Promise<T> {
  const a = await db.ajustes.get(clave)
  return a === undefined ? porDefecto : (a.valor as T)
}

export async function guardarAjuste(clave: string, valor: unknown): Promise<void> {
  await db.ajustes.put({ clave, valor })
}

/** Lista de básicos, siempre al día (se actualiza sola si cambia). */
export function useBasicos(): Set<string> {
  const lista = useLiveQuery(() => leerAjuste<string[]>('basicos', BASICOS_POR_DEFECTO), [], BASICOS_POR_DEFECTO)
  return useMemo(() => new Set(lista), [lista])
}

export async function alternarBasico(alimentoId: string): Promise<void> {
  const actual = new Set(await leerAjuste<string[]>('basicos', BASICOS_POR_DEFECTO))
  if (actual.has(alimentoId)) actual.delete(alimentoId)
  else actual.add(alimentoId)
  await guardarAjuste('basicos', [...actual])
}

export function useDiasAvisoVence(): number {
  return useLiveQuery(() => leerAjuste('diasAvisoVence', DIAS_AVISO_VENCE_POR_DEFECTO), [], DIAS_AVISO_VENCE_POR_DEFECTO)
}
