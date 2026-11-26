import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from './db'

/**
 * Básicos por defecto: no cuentan como faltantes en las recetas ni se descuentan al cocinar.
 * Sal, aceites, ajo y especias. Se pueden cambiar en la app.
 */
export const BASICOS_POR_DEFECTO = [
  'usda-173468', // sal
  'usda-171411', // aceite de soya
  'usda-171413', // aceite de oliva
  'usda-172336', // aceite de canola
  'usda-171025', // aceite de girasol
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

/** "Modo sin calorías": oculta las calorías en toda la app. */
export function useSinCalorias(): boolean {
  return useLiveQuery(() => leerAjuste('sinCalorias', false), [], false)
}

export function useDiasAvisoVence(): number {
  return useLiveQuery(() => leerAjuste('diasAvisoVence', DIAS_AVISO_VENCE_POR_DEFECTO), [], DIAS_AVISO_VENCE_POR_DEFECTO)
}
