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

const CAMPOS = 'code,product_name,product_name_es,product_name_pt,brands,nutriments,serving_size,serving_quantity'

/**
 * Búsqueda por nombre (para productos de marca que no están en la base).
 * El buscador de Open Food Facts es irregular con varias palabras, así que se piden dos versiones
 * (tal cual, y filtrando a los que traen calorías) y luego se juntan.
 */
export const URLS_BUSQUEDA_OFF = (texto: string) => [
  `https://search.openfoodfacts.org/search?q=${encodeURIComponent(texto)}&page_size=50&fields=${CAMPOS}`,
  `https://search.openfoodfacts.org/search?q=${encodeURIComponent(`(${texto}) AND nutriments.energy-kcal_100g:>0`)}&page_size=25&fields=${CAMPOS}`,
]

/** Convierte los resultados de la búsqueda por nombre. Quita repetidos (mismo nombre, marca y kcal). */
export function mapearBusquedaOFF(...respuestas: unknown[]): (ProductoOFF & { codigo: string })[] {
  const hits = respuestas.flatMap((r) => (r as { hits?: Record<string, unknown>[] })?.hits ?? [])
  const vistos = new Set<string>()
  const lista: (ProductoOFF & { codigo: string })[] = []
  for (const h of hits) {
    const p = mapearProducto(h)
    if (!p || p.n.kcal === null) continue
    const clave = `${p.nombre.toLowerCase()}|${p.marca ?? ''}|${p.n.kcal}`
    if (vistos.has(clave)) continue
    vistos.add(clave)
    lista.push({ ...p, codigo: String(h.code ?? '') })
  }
  return lista
}

/** Convierte la respuesta de Open Food Facts al formato de la app. null si no hay producto. */
export function mapearOFF(respuesta: unknown): ProductoOFF | null {
  const r = respuesta as { status?: number; product?: Record<string, unknown> }
  if (!r || r.status !== 1 || !r.product) return null
  return mapearProducto(r.product)
}

/** La marca llega como texto ("Kellogg's, Nestlé") o como lista de etiquetas (["xx:kellogg-s"]). */
function limpiarMarca(v: unknown): string | undefined {
  const primera = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '').split(',')[0]
  const limpia = primera
    .replace(/^[a-z]{2}:/, '')
    .replace(/-s\b/g, "'s") // "kellogg-s" → "kellogg's"
    .replace(/-/g, ' ')
    .trim()
  return limpia ? limpia.charAt(0).toUpperCase() + limpia.slice(1) : undefined
}

function mapearProducto(p: Record<string, unknown>): ProductoOFF | null {
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
  const marca = limpiarMarca(p.brands)
  return {
    nombre,
    marca,
    n,
    porcion: gramosPorcion ? { nombre: `1 porción (${String(p.serving_size ?? `${gramosPorcion} g`)})`, gramos: gramosPorcion } : undefined,
  }
}
