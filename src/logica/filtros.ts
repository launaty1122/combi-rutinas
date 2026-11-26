import type { Disponibilidad } from './disponibilidad'
import { sugerirEtiquetas } from './etiquetas'
import type { Nutrientes, Receta } from './tipos'
import { normalizar } from './texto'

export type FiltroTiempo = 'tiempo:10' | 'tiempo:20' | 'tiempo:40' | 'tiempo:elaborada'

export const TIEMPOS: { id: FiltroTiempo; nombre: string }[] = [
  { id: 'tiempo:10', nombre: 'Menos de 10 min' },
  { id: 'tiempo:20', nombre: 'Menos de 20 min' },
  { id: 'tiempo:40', nombre: 'Menos de 40 min' },
  { id: 'tiempo:elaborada', nombre: 'Elaborada' },
]

/** ¿La receta cabe en ese filtro de tiempo? ("cocina rápido" = menos de 20 min). */
export function cumpleTiempo(minutos: number, filtro: FiltroTiempo): boolean {
  if (filtro === 'tiempo:10') return minutos < 10
  if (filtro === 'tiempo:20') return minutos < 20
  if (filtro === 'tiempo:40') return minutos < 40
  return minutos >= 40
}

/** Etiquetas de objetivo efectivas: las corregidas a mano o, si no hay, las sugeridas. */
export function objetivoDe(receta: Pick<Receta, 'objetivo'>, porPorcion: Nutrientes): string[] {
  return receta.objetivo ?? sugerirEtiquetas(porPorcion).map((e) => `objetivo:${e}`)
}

export type Modo = 'todas' | 'puedo' | 'falta1'

export interface CriteriosFiltro {
  texto: string
  /** Etiquetas elegidas ("cocina:brasileña", "tiempo:20", "objetivo:alta-en-proteina", "favoritas"). */
  etiquetas: string[]
  modo: Modo
}

export interface RecetaConDatos {
  receta: Receta
  disponibilidad: Disponibilidad
  objetivo: string[]
  /** Nombres de los ingredientes, para buscar por ingrediente. */
  nombresIngredientes: string[]
}

/**
 * Filtra recetas. Dentro de un mismo grupo las etiquetas suman (brasileña O colombiana);
 * entre grupos se combinan (brasileña Y post-entreno Y menos de 20 min).
 */
export function filtrarRecetas(lista: RecetaConDatos[], c: CriteriosFiltro): RecetaConDatos[] {
  const q = normalizar(c.texto)
  const porGrupo = new Map<string, string[]>()
  for (const e of c.etiquetas) {
    const grupo = e.includes(':') ? e.split(':')[0] : e
    porGrupo.set(grupo, [...(porGrupo.get(grupo) ?? []), e])
  }

  return lista.filter(({ receta, disponibilidad, objetivo, nombresIngredientes }) => {
    if (c.modo === 'puedo' && !disponibilidad.completa) return false
    if (c.modo === 'falta1' && disponibilidad.faltantes !== 1) return false

    if (q) {
      const enNombre = normalizar(receta.nombre).includes(q)
      const enIngredientes = nombresIngredientes.some((n) => normalizar(n).includes(q))
      if (!enNombre && !enIngredientes) return false
    }

    for (const [grupo, elegidas] of porGrupo) {
      const cumple = elegidas.some((e) => {
        if (grupo === 'favoritas') return receta.favorita === true
        if (grupo === 'tiempo') return cumpleTiempo(receta.minutos, e as FiltroTiempo)
        if (grupo === 'objetivo') return objetivo.includes(e)
        return receta.etiquetas.includes(e)
      })
      if (!cumple) return false
    }
    return true
  })
}
