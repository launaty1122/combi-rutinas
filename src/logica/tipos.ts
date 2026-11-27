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
  fuente: 'TACO' | 'USDA' | 'personal'
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

/** Secciones del mercado para lo que no es comida. */
export type SeccionOtros = 'aseo' | 'limpieza' | 'utensilios' | 'otros'

export type MotivoMercado = 'manual' | 'receta' | 'minimo' | 'acabado'

/** Una línea de la lista del mercado. */
export interface ItemMercado {
  id: string
  tipo: 'alimento' | 'otro'
  /** Si es comida: el alimento y cuánto comprar (g o ml). Al comprarlo, pasa a la alacena. */
  alimentoId?: string
  gramos?: number
  /** Si no es comida: nombre libre, sección y cantidad en texto ("2 unidades"). */
  nombre?: string
  seccion?: SeccionOtros
  cantidadTexto?: string
  /** Precio de esta línea (lo que vas a pagar por esa cantidad). Opcional. */
  precio?: number
  comprado: boolean
  motivo: MotivoMercado
  creado: string
}

/** Último precio pagado, para sugerirlo la próxima vez. */
export interface PrecioGuardado {
  /** alimentoId, o "otro:<nombre normalizado>". */
  clave: string
  precio: number
  /** Para comida: gramos a los que corresponde ese precio. */
  gramos?: number
  fecha: string
}

/** Una compra terminada (para ver cuánto gastas en mercado). */
export interface Compra {
  id: string
  fecha: string
  total: number
  items: number
}

export type MomentoComida = 'desayuno' | 'almuerzo' | 'cena' | 'merienda' | 'otro'

/** Lo que se registra en el diario: un alimento (en gramos) o porciones de una receta. */
export type ItemComida =
  | { tipo: 'alimento'; alimentoId: string; gramos: number }
  | { tipo: 'receta'; recetaId: string; porciones: number }

/** Una entrada del diario de comidas. */
export interface RegistroComida {
  id: string
  /** Día AAAA-MM-DD. */
  fecha: string
  momento: MomentoComida
  item: ItemComida
  /** Nombre en el momento de registrar (por si luego se borra la receta o el alimento). */
  nombre: string
  /** Nutrientes ya calculados para esta cantidad (foto del momento). */
  n: Nutrientes
  incompletos: Nutriente[]
  creado: string
}

/** Un vaso (o cantidad) de agua. */
export interface RegistroAgua {
  id: string
  fecha: string
  ml: number
  creado: string
}

/** Combinación frecuente, por ejemplo "mi desayuno de siempre". */
export interface ComidaGuardada {
  id: string
  nombre: string
  items: ItemComida[]
}

export type TipoMedida = 'cintura' | 'cadera' | 'brazo' | 'muslo' | 'peso'

/** Una medida corporal (en cm) o el peso (en kg), en una fecha. */
export interface Medida {
  id: string
  fecha: string
  tipo: TipoMedida
  valor: number
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
  /** Etiquetas "grupo:valor" (cocina, momento, tipo, batido, dificultad). */
  etiquetas: string[]
  /**
   * Etiquetas de objetivo corregidas a mano. Si no existe, se usan las sugeridas
   * automáticamente a partir de la ficha nutricional.
   */
  objetivo?: string[]
  fuente?: string
  favorita?: boolean
  notas?: string
  foto?: string
}
