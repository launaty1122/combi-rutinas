import type { Alimento, CategoriaAlimento, Nutrientes } from '../logica/tipos'
import taco from './alimentos-taco.json'
import usda from './alimentos-usda.json'
import { ALIAS_ES } from './alias-es'
import { EXTRAS_USDA } from './extras-usda'
import { LIQUIDOS, PORCIONES } from './porciones'

interface Fila {
  id: string
  nombre: string
  categoria?: string
  n: Nutrientes
}

// Une la tabla TACO con los nombres en español y las porciones.
export const ALIMENTOS_TACO: Alimento[] = (taco as Fila[]).map((f) => {
  const numero = Number(f.id.replace('taco-', ''))
  return {
    id: f.id,
    nombre: f.nombre,
    alias: ALIAS_ES[numero] ?? [],
    categoria: f.categoria as CategoriaAlimento,
    fuente: 'TACO',
    n: f.n,
    porciones: PORCIONES[numero] ?? [],
    liquido: LIQUIDOS.has(numero) || undefined,
  }
})

// Alimentos que TACO no trae, del USDA.
export const ALIMENTOS_USDA: Alimento[] = (usda as Fila[]).map((f) => {
  const extra = EXTRAS_USDA[f.id.replace('usda-', '')]
  return {
    id: f.id,
    nombre: f.nombre,
    alias: extra?.alias ?? [],
    categoria: extra?.categoria ?? 'otros',
    fuente: 'USDA',
    n: f.n,
    porciones: extra?.porciones ?? [],
    liquido: extra?.liquido,
  }
})

/** Todos los alimentos de base (sin contar los personalizados, que viven en el celular). */
export const ALIMENTOS_BASE: Alimento[] = [...ALIMENTOS_TACO, ...ALIMENTOS_USDA]

/** Nombre para mostrar: el alias en español si existe; si no, el original. */
export function nombreVisible(a: Pick<Alimento, 'nombre' | 'alias'>): string {
  return a.alias[0] ?? a.nombre
}
