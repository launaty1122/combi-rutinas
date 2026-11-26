import { useMemo } from 'react'
import { nombreVisible } from '../../datos/alimentos'
import { useCatalogo, type Catalogo } from '../../datos/catalogo'
import { useAlacena } from '../../db/alacena'
import { useBasicos } from '../../db/ajustes'
import { useRecetas } from '../../db/recetas'
import { calcularDisponibilidad } from '../../logica/disponibilidad'
import { objetivoDe, type RecetaConDatos } from '../../logica/filtros'
import { nutricionReceta, type NutricionReceta } from '../../logica/nutricion'
import type { ItemAlacena, Nutriente, Receta } from '../../logica/tipos'

export interface RecetaCompleta extends RecetaConDatos {
  nutricion: NutricionReceta
}

/** Calcula, para una receta, su nutrición, su disponibilidad y sus etiquetas de objetivo. */
export function completarReceta(
  receta: Receta,
  catalogo: Catalogo,
  alacena: ItemAlacena[],
  basicos: Set<string>,
  ingredientes = receta.ingredientes,
): RecetaCompleta {
  const nutricion = nutricionReceta(receta, catalogo.porId)
  return {
    receta,
    nutricion,
    disponibilidad: calcularDisponibilidad(ingredientes, alacena, basicos),
    objetivo: objetivoDe(receta, nutricion.porPorcion),
    nombresIngredientes: receta.ingredientes.map((i) => {
      const a = catalogo.porId.get(i.alimentoId)
      return a ? `${nombreVisible(a)} ${a.nombre}` : ''
    }),
  }
}

/** Todas las recetas con sus datos calculados, siempre al día con la alacena. */
export function useRecetasCompletas(): RecetaCompleta[] | undefined {
  const recetas = useRecetas()
  const alacena = useAlacena()
  const basicos = useBasicos()
  const catalogo = useCatalogo()
  return useMemo(() => {
    if (!recetas || !alacena) return undefined
    return recetas
      .map((r) => completarReceta(r, catalogo, alacena, basicos))
      .sort((a, b) => a.receta.nombre.localeCompare(b.receta.nombre, 'es'))
  }, [recetas, alacena, basicos, catalogo])
}

export const NUTRIENTES_INFO: { k: Nutriente; nombre: string; unidad: string }[] = [
  { k: 'kcal', nombre: 'Energía', unidad: 'kcal' },
  { k: 'proteina', nombre: 'Proteína', unidad: 'g' },
  { k: 'carbohidratos', nombre: 'Carbohidratos', unidad: 'g' },
  { k: 'fibra', nombre: 'Fibra', unidad: 'g' },
  { k: 'grasa', nombre: 'Grasa total', unidad: 'g' },
  { k: 'grasaSaturada', nombre: 'Grasa saturada', unidad: 'g' },
  { k: 'sodio', nombre: 'Sodio', unidad: 'mg' },
  { k: 'calcio', nombre: 'Calcio', unidad: 'mg' },
  { k: 'hierro', nombre: 'Hierro', unidad: 'mg' },
  { k: 'potasio', nombre: 'Potasio', unidad: 'mg' },
  { k: 'vitaminaC', nombre: 'Vitamina C', unidad: 'mg' },
  { k: 'vitaminaA', nombre: 'Vitamina A', unidad: 'µg' },
]

/** Colores de tarjeta (pasteles con texto oscuro), en rotación. */
export const COLORES_TARJETA = [
  { fondo: '#C9C2F7', mancha: '#B1A7F2' },
  { fondo: '#F9DE7A', mancha: '#F6C817' },
  { fondo: '#E3EA98', mancha: '#AED140' },
  { fondo: '#F7C3D0', mancha: '#F7A8BC' },
  { fondo: '#CFE8F6', mancha: '#9BD0EC' },
]

export function colorDeReceta(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORES_TARJETA[h % COLORES_TARJETA.length]
}
