import { useLiveQuery } from 'dexie-react-hooks'
import { guardarAjuste, leerAjuste } from './ajustes'

export type Actividad = 'sedentaria' | 'ligera' | 'moderada' | 'alta'

/** Tus datos y metas. Todo editable; estos son los valores por defecto. */
export interface Perfil {
  sexo: 'mujer' | 'hombre'
  edad: number
  alturaCm: number
  pesoKg: number
  actividad: Actividad
  metaProteina: number
  metaFibra: number
  /** null = automática (35 ml por kg de peso). */
  metaAguaMl: number | null
  vasoMl: number
}

export const PERFIL_POR_DEFECTO: Perfil = {
  sexo: 'mujer',
  edad: 25,
  alturaCm: 157,
  pesoKg: 65,
  actividad: 'moderada',
  metaProteina: 100,
  metaFibra: 25,
  metaAguaMl: null,
  vasoMl: 250,
}

/** Meta de agua: la que pusiste, o 35 ml por kg de peso. */
export function metaAgua(p: Perfil): number {
  return p.metaAguaMl ?? Math.round(p.pesoKg * 35)
}

export function usePerfil(): Perfil {
  return useLiveQuery(
    async () => ({ ...PERFIL_POR_DEFECTO, ...(await leerAjuste<Partial<Perfil>>('perfil', {})) }),
    [],
    PERFIL_POR_DEFECTO,
  )
}

export async function guardarPerfil(p: Perfil): Promise<void> {
  await guardarAjuste('perfil', p)
}
