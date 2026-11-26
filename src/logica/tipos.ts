// Tipos de datos compartidos por toda la app.
// Regla de oro: si un nutriente no se conoce, es null ("sin dato"), nunca 0.

export type Nutriente =
  | 'kcal'
  | 'proteina'
  | 'carbohidratos'
  | 'fibra'
  | 'grasa'
  | 'grasaSaturada'
  | 'sodio'
  | 'calcio'
  | 'hierro'
  | 'potasio'
  | 'vitaminaC'
  | 'vitaminaA'

export const NUTRIENTES: Nutriente[] = [
  'kcal',
  'proteina',
  'carbohidratos',
  'fibra',
  'grasa',
  'grasaSaturada',
  'sodio',
  'calcio',
  'hierro',
  'potasio',
  'vitaminaC',
  'vitaminaA',
]

/** Valores por cada 100 g (o 100 ml). null = sin dato. */
export type Nutrientes = Record<Nutriente, number | null>

export type CategoriaAlimento =
  | 'proteinas'
  | 'granos'
  | 'legumbres'
  | 'verduras'
  | 'frutas'
  | 'lacteos'
  | 'semillas'
  | 'grasas'
  | 'bebidas'
  | 'dulces'
  | 'preparados'
  | 'otros'

/** Una forma de medir un alimento: "1 huevo" = 50 g. */
export interface Porcion {
  nombre: string
  gramos: number
}

export interface Alimento {
  id: string
  /** Nombre original (portugués si viene de TACO). */
  nombre: string
  /** Nombres en español: el primero se muestra, todos sirven para buscar. */
  alias: string[]
  categoria: CategoriaAlimento
  fuente: 'TACO' | 'personal'
  /** Por cada 100 g o 100 ml. */
  n: Nutrientes
  porciones: Porcion[]
  /** true si se mide en ml en vez de g (bebidas, aceites). */
  liquido?: boolean
}

/** Algo que hay en la alacena. La cantidad siempre en gramos (o ml). */
export interface ItemAlacena {
  id: string
  alimentoId: string
  gramos: number
  compradoEl?: string // fecha ISO, opcional
  venceEl?: string // fecha ISO, opcional
}

export interface IngredienteReceta {
  alimentoId: string
  /** Cantidad para la receta completa (todas sus porciones), en g o ml. */
  gramos: number
  /** Cómo se muestra: "1 cucharada", "2 huevos". */
  texto: string
}

export interface Receta {
  id: string
  nombre: string
  porciones: number
  minutos: number
  ingredientes: IngredienteReceta[]
  pasos: string[]
  /** El textico cálido: qué es y qué aporta. */
  ficha: string
  etiquetas: string[]
  fuente?: string
  favorita?: boolean
  notas?: string
  foto?: string
}
