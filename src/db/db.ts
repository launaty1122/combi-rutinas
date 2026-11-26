import Dexie, { type EntityTable } from 'dexie'
import type { Alimento, ItemAlacena, Receta } from '../logica/tipos'

/** Un ajuste guardado: { clave: 'basicos', valor: [...] }. */
export interface Ajuste {
  clave: string
  valor: unknown
}

/**
 * Base de datos del celular (IndexedDB, a través de Dexie).
 * Todo vive solo en este dispositivo: por eso el backup es obligatorio.
 */
export class BaseCombi extends Dexie {
  alacena!: EntityTable<ItemAlacena, 'id'>
  alimentosPersonales!: EntityTable<Alimento, 'id'>
  recetas!: EntityTable<Receta, 'id'>
  ajustes!: EntityTable<Ajuste, 'clave'>

  constructor(nombre = 'combi-rutinas') {
    super(nombre)
    // Versión 1 del esquema. Solo se listan los campos por los que se busca u ordena.
    this.version(1).stores({
      alacena: 'id, alimentoId, venceEl',
      alimentosPersonales: 'id, nombre',
      recetas: 'id, nombre, favorita',
      ajustes: 'clave',
    })
  }
}

export const db = new BaseCombi()

/** Id único y corto para lo que se crea en el celular. */
export function nuevoId(prefijo = ''): string {
  const aleatorio = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  return prefijo + aleatorio
}
