// Etiquetas de recetas, agrupadas. Una receta puede tener muchas.
// Se guardan como "grupo:valor" (ej. "cocina:brasileña"). Las de "objetivo" y "tiempo"
// se calculan solas (ver logica/filtros.ts), aunque las de objetivo se pueden corregir.

export interface GrupoEtiquetas {
  id: string
  nombre: string
  opciones: { id: string; nombre: string }[]
}

const op = (grupo: string, nombre: string, valor = nombre.toLowerCase()) => ({ id: `${grupo}:${valor}`, nombre })

export const GRUPOS_ETIQUETAS: GrupoEtiquetas[] = [
  {
    id: 'cocina',
    nombre: 'Cocina',
    opciones: [
      op('cocina', 'Colombiana'),
      op('cocina', 'Brasileña'),
      op('cocina', 'Japonesa'),
      op('cocina', 'Mexicana'),
      op('cocina', 'Mediterránea'),
      op('cocina', 'Peruana'),
      op('cocina', 'India'),
      op('cocina', 'Italiana'),
      op('cocina', 'Otra'),
    ],
  },
  {
    id: 'momento',
    nombre: 'Momento',
    opciones: [
      op('momento', 'Desayuno'),
      op('momento', 'Almuerzo'),
      op('momento', 'Cena'),
      op('momento', 'Merienda'),
      op('momento', 'Pre-entreno'),
      op('momento', 'Post-entreno'),
    ],
  },
  {
    id: 'tipo',
    nombre: 'Tipo',
    opciones: [
      op('tipo', 'Batido'),
      op('tipo', 'Ensalada'),
      op('tipo', 'Sopa'),
      op('tipo', 'Bowl'),
      op('tipo', 'Snack'),
      op('tipo', 'Postre'),
      op('tipo', 'Salsa o aderezo', 'salsa'),
      op('tipo', 'Meal prep', 'meal-prep'),
    ],
  },
  {
    id: 'batido',
    nombre: 'Batidos para…',
    opciones: [
      op('batido', 'Post-entreno'),
      op('batido', 'Desayuno rápido', 'desayuno-rapido'),
      op('batido', 'Alto en fibra', 'fibra'),
      op('batido', 'Cuando no tengo hambre', 'sin-hambre'),
    ],
  },
  {
    id: 'dificultad',
    nombre: 'Dificultad',
    opciones: [op('dificultad', 'Fácil', 'facil'), op('dificultad', 'Media')],
  },
]

export const NOMBRE_ETIQUETA = new Map(GRUPOS_ETIQUETAS.flatMap((g) => g.opciones.map((o) => [o.id, o.nombre])))
