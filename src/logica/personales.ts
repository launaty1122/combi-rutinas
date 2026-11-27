import { NUTRIENTES, type Alimento, type CategoriaAlimento, type Nutriente, type Nutrientes, type Porcion } from './tipos'

export interface FormularioAlimento {
  nombre: string
  categoria: CategoriaAlimento
  /** Los valores escritos corresponden a esta cantidad de gramos (100, o lo que pese la porción de la etiqueta). */
  gramosBase: number
  /** Valores como texto, tal como se escriben ("12,5", "" = sin dato). */
  valores: Partial<Record<Nutriente, string>>
  porciones: Porcion[]
  liquido: boolean
}

/** "12,5" → 12.5; "" → null (sin dato). Nunca convierte un vacío en 0. */
export function leerNumero(texto: string | undefined): number | null {
  if (texto === undefined) return null
  const t = texto.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** Convierte valores "por porción" a "por 100 g". */
export function aPor100(valores: Partial<Record<Nutriente, string>>, gramosBase: number): Nutrientes {
  const factor = gramosBase > 0 ? 100 / gramosBase : 1
  const n = {} as Nutrientes
  for (const k of NUTRIENTES) {
    const v = leerNumero(valores[k])
    n[k] = v === null ? null : Math.round(v * factor * 100) / 100
  }
  return n
}

export function crearAlimentoPersonal(f: FormularioAlimento, id: string): Alimento {
  return {
    id,
    nombre: f.nombre.trim(),
    alias: [f.nombre.trim()],
    categoria: f.categoria,
    fuente: 'personal',
    n: aPor100(f.valores, f.gramosBase),
    porciones: f.porciones.filter((p) => p.nombre.trim() && p.gramos > 0),
    liquido: f.liquido || undefined,
  }
}
