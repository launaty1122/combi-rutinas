import type { CategoriaAlimento } from '../logica/tipos'

/** Nombre, orden y color de cada categoría en la alacena. */
export const CATEGORIAS: { id: CategoriaAlimento; nombre: string; color: string }[] = [
  { id: 'proteinas', nombre: 'Proteínas', color: '#C9C2F7' },
  { id: 'lacteos', nombre: 'Lácteos', color: '#9BD0EC' },
  { id: 'legumbres', nombre: 'Legumbres', color: '#F2923B' },
  { id: 'granos', nombre: 'Granos y cereales', color: '#F6C817' },
  { id: 'verduras', nombre: 'Verduras', color: '#AED140' },
  { id: 'frutas', nombre: 'Frutas', color: '#F7A8BC' },
  { id: 'semillas', nombre: 'Semillas y frutos secos', color: '#E3EA98' },
  { id: 'grasas', nombre: 'Grasas y aceites', color: '#F9DE7A' },
  { id: 'bebidas', nombre: 'Bebidas', color: '#9BD0EC' },
  { id: 'dulces', nombre: 'Dulces', color: '#F7A8BC' },
  { id: 'preparados', nombre: 'Preparados', color: '#F2923B' },
  { id: 'otros', nombre: 'Otros', color: '#E6E3D8' },
]

export const CATEGORIA_POR_ID = new Map(CATEGORIAS.map((c) => [c.id, c]))
