import type { Perfil } from '../db/perfil'
import { dividirNutrientes, nutricionReceta, nutrientesDe, nutrientesVacios, sumarNutrientes } from './nutricion'
import type { Alimento, ItemComida, MomentoComida, Nutriente, Nutrientes, Receta, RegistroComida } from './tipos'
import { cantidadSegura } from './unidades'

export const MOMENTOS: { id: MomentoComida; nombre: string; color: string }[] = [
  { id: 'desayuno', nombre: 'Desayuno', color: '#F9DE7A' },
  { id: 'almuerzo', nombre: 'Almuerzo', color: '#AED140' },
  { id: 'cena', nombre: 'Cena', color: '#C9C2F7' },
  { id: 'merienda', nombre: 'Merienda', color: '#F7A8BC' },
  { id: 'otro', nombre: 'Sin categoría', color: '#E6E3D8' },
]

export interface CalculoItem {
  nombre: string
  n: Nutrientes
  incompletos: Nutriente[]
}

/** Nutrientes de lo que se comió: un alimento en gramos, o porciones de una receta. */
export function calcularItem(
  item: ItemComida,
  alimentos: Map<string, Alimento>,
  recetas: Map<string, Receta>,
): CalculoItem | null {
  if (item.tipo === 'alimento') {
    const a = alimentos.get(item.alimentoId)
    if (!a) return null
    const n = nutrientesDe(a, item.gramos)
    return { nombre: a.alias[0] ?? a.nombre, n, incompletos: (Object.keys(n) as Nutriente[]).filter((k) => n[k] === null) }
  }
  const r = recetas.get(item.recetaId)
  if (!r) return null
  const nut = nutricionReceta(r, alimentos)
  const porciones = cantidadSegura(item.porciones)
  const n = nutrientesVacios()
  for (const k of Object.keys(n) as Nutriente[]) {
    const v = nut.porPorcion[k]
    n[k] = v === null ? null : v * porciones
  }
  return { nombre: r.nombre, n, incompletos: [...nut.incompletos] }
}

export interface ResumenDia {
  total: Nutrientes
  incompletos: Set<Nutriente>
  porMomento: Map<MomentoComida, Nutrientes>
}

/** Suma todo lo registrado en un día (y por cada comida). */
export function resumirDia(registros: RegistroComida[]): ResumenDia {
  if (registros.length === 0) {
    return { total: nutrientesVacios(), incompletos: new Set(), porMomento: new Map() }
  }
  const { total, incompletos } = sumarNutrientes(registros.map((r) => r.n))
  for (const r of registros) for (const k of r.incompletos) incompletos.add(k)
  const porMomento = new Map<MomentoComida, Nutrientes>()
  for (const m of MOMENTOS) {
    const del = registros.filter((r) => r.momento === m.id)
    if (del.length) porMomento.set(m.id, sumarNutrientes(del.map((r) => r.n)).total)
  }
  return { total, incompletos, porMomento }
}

/** Promedio diario de varios días (para progreso). */
export function promedioDias(dias: Nutrientes[]): Nutrientes {
  if (dias.length === 0) return nutrientesVacios()
  return dividirNutrientes(sumarNutrientes(dias).total, dias.length)
}

const FACTOR_ACTIVIDAD = { sedentaria: 1.2, ligera: 1.375, moderada: 1.55, alta: 1.725 } as const

/**
 * Gasto estimado del día con la fórmula de Mifflin-St Jeor y un factor de actividad.
 * Es una estimación (más o menos 10 %), no una medición.
 */
export function gastoEstimado(p: Pick<Perfil, 'sexo' | 'pesoKg' | 'alturaCm' | 'edad' | 'actividad'>): {
  basal: number
  total: number
} {
  const basal = 10 * p.pesoKg + 6.25 * p.alturaCm - 5 * p.edad + (p.sexo === 'mujer' ? -161 : 5)
  return { basal: Math.round(basal), total: Math.round(basal * FACTOR_ACTIVIDAD[p.actividad]) }
}

/** Progreso hacia una meta, de 0 a 1 (puede pasar de 1: sin alertas, solo el número). */
export function progreso(valor: number | null, meta: number): number {
  if (valor === null || meta <= 0) return 0
  return valor / meta
}
