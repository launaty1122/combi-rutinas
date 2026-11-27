import type { Nutrientes } from './tipos'

/**
 * Open Food Facts: base de datos pública y gratuita de productos empacados (sin clave).
 * https://world.openfoodfacts.org — los datos los cargan personas voluntarias: pueden tener errores,
 * por eso siempre se muestran para revisar antes de guardar.
 */
export const URL_OFF = (codigo: string) =>
  `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigo)}.json?fields=product_name,product_name_es,product_name_pt,brands,nutriments,serving_size,serving_quantity`

export interface ProductoOFF {
  nombre: string
  marca?: string
  /** Por 100 g (o 100 ml). */
  n: Nutrientes
  porcion?: { nombre: string; gramos: number }
}

const num = (v: unknown): number | null => {
  // Un texto vacío es "sin dato", no 0.
  const n = typeof v === 'string' ? (v.trim() === '' ? NaN : Number(v.replace(',', '.'))) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) && n >= 0 ? n : null
}
const escala = (v: number | null, f: number) => (v === null ? null : Math.round(v * f * 100) / 100)

/** Valida el código de barras (8, 12 o 13 dígitos). */
export function codigoValido(codigo: string): boolean {
  return /^\d{8}$|^\d{12,13}$/.test(codigo.trim())
}

/** Convierte la respuesta de Open Food Facts al formato de la app. null si no hay producto. */
export function mapearOFF(respuesta: unknown): ProductoOFF | null {
  const r = respuesta as { status?: number; product?: Record<string, unknown> }
  if (!r || r.status !== 1 || !r.product) return null
  const p = r.product
  const nut = (p.nutriments ?? {}) as Record<string, unknown>
  const nombre = String(p.product_name_es || p.product_name_pt || p.product_name || '').trim()
  if (!nombre) return null
  // Energía: si solo viene en kJ, se convierte (1 kcal = 4,184 kJ).
  const kcal = num(nut['energy-kcal_100g']) ?? escala(num(nut['energy-kj_100g']) ?? num(nut['energy_100g']), 1 / 4.184)
  const n: Nutrientes = {
    kcal: kcal === null ? null : Math.round(kcal),
    proteina: num(nut['proteins_100g']),
    carbohidratos: num(nut['carbohydrates_100g']),
    fibra: num(nut['fiber_100g']),
    grasa: num(nut['fat_100g']),
    grasaSaturada: num(nut['saturated-fat_100g']),
    // OFF guarda los minerales en gramos: se pasan a mg (y la vitamina A a µg).
    sodio: escala(num(nut['sodium_100g']), 1000),
    calcio: escala(num(nut['calcium_100g']), 1000),
    hierro: escala(num(nut['iron_100g']), 1000),
    potasio: escala(num(nut['potassium_100g']), 1000),
    vitaminaC: escala(num(nut['vitamin-c_100g']), 1000),
    vitaminaA: escala(num(nut['vitamin-a_100g']), 1_000_000),
  }
  const gramosPorcion = num(p.serving_quantity)
  const marca = String(p.brands ?? '').split(',')[0]?.trim() || undefined
  return {
    nombre,
    marca,
    n,
    porcion: gramosPorcion ? { nombre: `1 porción (${String(p.serving_size ?? `${gramosPorcion} g`)})`, gramos: gramosPorcion } : undefined,
  }
}
