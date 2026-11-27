import { existenciasPorAlimento } from './disponibilidad'
import { escalarIngredientes } from './escalar'
import { normalizar } from './texto'
import type { ItemAlacena, ItemMercado, PrecioGuardado, Receta } from './tipos'
import { cantidadSegura } from './unidades'

/** Una receta que planeas cocinar, con cuántas porciones. */
export interface RecetaPlaneada {
  recetaId: string
  porciones: number
}

export interface Sugerencia {
  alimentoId: string
  /** Gramos que conviene comprar. */
  gramos: number
  motivo: 'receta' | 'minimo' | 'acabado'
  /** Texto corto: "para Ajiaco", "mínimo 6 huevos", "se acabó". */
  detalle: string
}

interface DatosSugerencias {
  alacena: ItemAlacena[]
  basicos: Set<string>
  planeadas: RecetaPlaneada[]
  recetas: Map<string, Receta>
  /** Mínimos "siempre en casa": alimentoId → gramos. */
  minimos: Record<string, number>
  /** Alimentos que se acabaron en la alacena. */
  acabados: string[]
  /** Lo que ya está en la lista (sin comprar), para no repetir. */
  lista: ItemMercado[]
}

/**
 * Sugiere qué comprar, en este orden de prioridad:
 * 1. Lo que falta para las recetas que planeas cocinar (suma todas, resta lo que hay).
 * 2. Lo que está por debajo de tu mínimo "siempre en casa".
 * 3. Lo que se acabó.
 * Nunca sugiere básicos ni lo que ya está en la lista.
 */
export function sugerirCompras(d: DatosSugerencias): Sugerencia[] {
  const hay = existenciasPorAlimento(d.alacena)
  const enLista = new Map<string, number>()
  for (const i of d.lista) {
    if (i.tipo === 'alimento' && i.alimentoId && !i.comprado) {
      enLista.set(i.alimentoId, (enLista.get(i.alimentoId) ?? 0) + cantidadSegura(i.gramos ?? 0))
    }
  }
  const disponible = (id: string) => (hay.get(id) ?? 0) + (enLista.get(id) ?? 0)
  const resultado: Sugerencia[] = []
  const ya = new Set<string>()

  // 1. Recetas planeadas.
  const necesidad = new Map<string, { gramos: number; recetas: string[] }>()
  for (const p of d.planeadas) {
    const r = d.recetas.get(p.recetaId)
    if (!r) continue
    for (const ing of escalarIngredientes(r, p.porciones)) {
      if (d.basicos.has(ing.alimentoId)) continue
      const n = necesidad.get(ing.alimentoId) ?? { gramos: 0, recetas: [] }
      n.gramos += cantidadSegura(ing.gramos)
      if (!n.recetas.includes(r.nombre)) n.recetas.push(r.nombre)
      necesidad.set(ing.alimentoId, n)
    }
  }
  for (const [id, n] of necesidad) {
    const falta = n.gramos - disponible(id)
    if (falta > 0.5) {
      resultado.push({ alimentoId: id, gramos: Math.ceil(falta), motivo: 'receta', detalle: `para ${n.recetas.join(', ')}` })
      ya.add(id)
    }
  }

  // 2. Mínimos "siempre en casa".
  for (const [id, minimo] of Object.entries(d.minimos)) {
    if (ya.has(id) || d.basicos.has(id)) continue
    const falta = minimo - disponible(id)
    if (falta > 0.5) {
      resultado.push({ alimentoId: id, gramos: Math.ceil(falta), motivo: 'minimo', detalle: 'por debajo de tu mínimo' })
      ya.add(id)
    }
  }

  // 3. Lo que se acabó (si sigue sin haber y no está en la lista).
  for (const id of d.acabados) {
    if (ya.has(id) || d.basicos.has(id) || disponible(id) > 0) continue
    resultado.push({ alimentoId: id, gramos: 0, motivo: 'acabado', detalle: 'se acabó' })
    ya.add(id)
  }

  return resultado
}

/** Clave para recordar precios: el alimento, o el nombre normalizado si no es comida. */
export function clavePrecio(i: Pick<ItemMercado, 'tipo' | 'alimentoId' | 'nombre'>): string {
  return i.tipo === 'alimento' && i.alimentoId ? i.alimentoId : `otro:${normalizar(i.nombre ?? '')}`
}

/**
 * Precio sugerido según lo que pagaste la última vez.
 * Comida: proporcional a los gramos (si pagaste R$ 10 por 500 g, 1 kg ≈ R$ 20).
 */
export function precioSugerido(guardado: PrecioGuardado | undefined, gramos?: number): number | undefined {
  if (!guardado) return undefined
  if (guardado.gramos && gramos && gramos > 0) return Math.round((guardado.precio * gramos) / guardado.gramos * 100) / 100
  return guardado.precio
}

/** Total de la lista: solo suma los que tienen precio. */
export function totalLista(items: ItemMercado[]): { total: number; sinPrecio: number } {
  let total = 0
  let sinPrecio = 0
  for (const i of items) {
    if (typeof i.precio === 'number') total += i.precio
    else sinPrecio++
  }
  return { total: Math.round(total * 100) / 100, sinPrecio }
}

/** "R$ 12,50" (real brasileño). */
export function formatearPrecio(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** "12,5" o "12.50" → 12.5. Vacío o inválido → undefined. */
export function leerPrecio(texto: string): number | undefined {
  const t = texto.trim().replace(/^R\$\s*/i, '').replace(',', '.')
  if (t === '') return undefined
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : undefined
}

export interface ResultadoCompra {
  /** Lo que entra a la alacena. */
  nuevosEnAlacena: Omit<ItemAlacena, 'id'>[]
  /** Precios a recordar. */
  precios: PrecioGuardado[]
  total: number
  /** Ids de la lista que se terminan (se quitan). */
  terminados: string[]
}

/** Terminar la compra: lo marcado como comprado pasa a la alacena (si es comida) y sale de la lista. */
export function terminarCompra(lista: ItemMercado[], hoy: string): ResultadoCompra {
  const comprados = lista.filter((i) => i.comprado)
  const nuevosEnAlacena = comprados
    .filter((i) => i.tipo === 'alimento' && i.alimentoId && (i.gramos ?? 0) > 0)
    .map((i) => ({ alimentoId: i.alimentoId as string, gramos: cantidadSegura(i.gramos ?? 0), compradoEl: hoy }))
  const precios: PrecioGuardado[] = comprados
    .filter((i) => typeof i.precio === 'number')
    .map((i) => ({
      clave: clavePrecio(i),
      precio: i.precio as number,
      gramos: i.tipo === 'alimento' ? i.gramos : undefined,
      fecha: hoy,
    }))
  return {
    nuevosEnAlacena,
    precios,
    total: totalLista(comprados).total,
    terminados: comprados.map((i) => i.id),
  }
}
