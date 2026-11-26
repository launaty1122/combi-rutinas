import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db/db'
import { crearBuscador } from '../logica/buscar'
import type { Alimento } from '../logica/tipos'
import { ALIMENTOS_BASE } from './alimentos'

export interface Catalogo {
  todos: Alimento[]
  porId: Map<string, Alimento>
  buscar: (consulta: string, limite?: number) => Alimento[]
}

/** Todos los alimentos: los de base (TACO + USDA) y los personales guardados en el celular. */
export function useCatalogo(): Catalogo {
  const personales = useLiveQuery(() => db.alimentosPersonales.toArray(), [], [] as Alimento[])
  return useMemo(() => {
    const todos = [...personales, ...ALIMENTOS_BASE]
    return { todos, porId: new Map(todos.map((a) => [a.id, a])), buscar: crearBuscador(todos) }
  }, [personales])
}
