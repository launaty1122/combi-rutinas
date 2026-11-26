import type { Alimento, CategoriaAlimento, Nutrientes } from '../logica/tipos'
import taco from './alimentos-taco.json'
import { ALIAS_ES } from './alias-es'
import { LIQUIDOS, PORCIONES } from './porciones'

interface FilaTaco {
  id: string
  nombre: string
  categoria: string
  fuente: string
  n: Nutrientes
}

// Une la tabla TACO con los nombres en español y las porciones.
export const ALIMENTOS_TACO: Alimento[] = (taco as FilaTaco[]).map((f) => {
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

/** Nombre para mostrar: el alias en español si existe; si no, el original. */
export function nombreVisible(a: Pick<Alimento, 'nombre' | 'alias'>): string {
  return a.alias[0] ?? a.nombre
}
