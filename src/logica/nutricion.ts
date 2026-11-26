import { NUTRIENTES, type Alimento, type Nutriente, type Nutrientes, type Receta } from './tipos'
import { cantidadSegura } from './unidades'

/** Un objeto de nutrientes con todo en null ("sin dato"). */
export function nutrientesVacios(): Nutrientes {
  return Object.fromEntries(NUTRIENTES.map((k) => [k, null])) as Nutrientes
}

/** Nutrientes de una cantidad concreta de un alimento (sus valores vienen por 100 g). */
export function nutrientesDe(alimento: Pick<Alimento, 'n'>, gramos: number): Nutrientes {
  const factor = cantidadSegura(gramos) / 100
  const r = nutrientesVacios()
  for (const k of NUTRIENTES) {
    const v = alimento.n[k]
    r[k] = v === null ? null : v * factor
  }
  return r
}

export interface Suma {
  total: Nutrientes
  /** Nutrientes en los que a algún ingrediente le falta el dato: el total es "al menos" eso. */
  incompletos: Set<Nutriente>
}

/**
 * Suma varios grupos de nutrientes.
 * - Si NINGUNO tiene el dato → null (sin dato).
 * - Si ALGUNOS lo tienen → suma lo conocido y lo marca como incompleto.
 */
export function sumarNutrientes(lista: Nutrientes[]): Suma {
  const total = nutrientesVacios()
  const incompletos = new Set<Nutriente>()
  for (const k of NUTRIENTES) {
    let suma = 0
    let conocidos = 0
    for (const n of lista) {
      const v = n[k]
      if (v === null) incompletos.add(k)
      else {
        suma += v
        conocidos++
      }
    }
    total[k] = conocidos > 0 ? suma : null
  }
  return { total, incompletos }
}

/** Divide todos los nutrientes (null se queda null). */
export function dividirNutrientes(n: Nutrientes, divisor: number): Nutrientes {
  const r = nutrientesVacios()
  const d = cantidadSegura(divisor) || 1
  for (const k of NUTRIENTES) r[k] = n[k] === null ? null : (n[k] as number) / d
  return r
}

/** Carbohidratos netos = carbohidratos − fibra (en TACO los carbohidratos incluyen la fibra). */
export function carbohidratosNetos(n: Pick<Nutrientes, 'carbohidratos' | 'fibra'>): number | null {
  if (n.carbohidratos === null) return null
  if (n.fibra === null) return null
  return Math.max(0, n.carbohidratos - n.fibra)
}

export interface NutricionReceta {
  total: Nutrientes
  porPorcion: Nutrientes
  incompletos: Set<Nutriente>
  /** Ingredientes cuyo alimento no se encontró en la base. */
  sinAlimento: string[]
}

/** Calcula la ficha nutricional de una receta: total y por porción. */
export function nutricionReceta(
  receta: Pick<Receta, 'ingredientes' | 'porciones'>,
  alimentos: Map<string, Pick<Alimento, 'n'>>,
): NutricionReceta {
  const partes: Nutrientes[] = []
  const sinAlimento: string[] = []
  for (const ing of receta.ingredientes) {
    const alimento = alimentos.get(ing.alimentoId)
    if (!alimento) {
      sinAlimento.push(ing.alimentoId)
      partes.push(nutrientesVacios())
      continue
    }
    partes.push(nutrientesDe(alimento, ing.gramos))
  }
  if (partes.length === 0) {
    const vacio = nutrientesVacios()
    return { total: vacio, porPorcion: nutrientesVacios(), incompletos: new Set(), sinAlimento }
  }
  const { total, incompletos } = sumarNutrientes(partes)
  return { total, porPorcion: dividirNutrientes(total, receta.porciones), incompletos, sinAlimento }
}
