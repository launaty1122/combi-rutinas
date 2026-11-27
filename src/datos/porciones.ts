import type { Porcion } from '../logica/tipos'

// Porciones caseras iniciales (medidas aproximadas), por número de alimento TACO.
// Todas se convierten a gramos (o ml en líquidos). Se pueden editar y ampliar en la app.
const u = (nombre: string, gramos: number): Porcion => ({ nombre, gramos })

export const PORCIONES: Record<number, Porcion[]> = {
  // Huevos
  489: [u('1 huevo', 50)],
  488: [u('1 huevo', 50)],
  490: [u('1 huevo', 50)],
  486: [u('1 clara', 33)],
  487: [u('1 yema', 17)],
  485: [u('1 huevo de codorniz', 10)],

  // Granos
  3: [u('1 taza', 160), u('1 cucharada', 25)],
  1: [u('1 taza', 160), u('1 cucharada', 25)],
  7: [u('1 cucharada', 10), u('½ taza', 40), u('1 taza', 80)],
  35: [u('1 cucharada', 8), u('1 taza', 120)],
  33: [u('1 cucharada', 8), u('1 taza', 120)],
  42: [u('1 cucharada', 8)],
  40: [u('1 porción', 80)],
  52: [u('1 tajada', 25)],
  53: [u('1 pan', 50)],
  124: [u('1 cucharada', 15)],
  146: [u('1 cucharada', 10)],

  // Legumbres
  561: [u('1 cucharón', 100), u('1 taza', 170)],
  567: [u('1 cucharón', 100), u('1 taza', 170)],
  563: [u('1 cucharón', 100), u('1 taza', 170)],
  577: [u('1 cucharón', 100), u('1 taza', 200)],
  575: [u('½ taza', 100)],
  584: [u('1 porción', 100)],
  557: [u('1 puñado', 30)],
  558: [u('1 puñado', 30)],

  // Proteínas
  409: [u('1 pechuga', 200), u('1 filete', 120)],
  410: [u('1 pechuga', 160), u('1 filete', 100)],
  408: [u('1 taza desmechada', 140)],
  327: [u('1 porción', 120)],
  316: [u('1 filete', 150)],
  277: [u('1 lata escurrida', 120)],
  319: [u('1 lata escurrida', 85)],
  // Carnes cocidas: "1 pedazo" o "1 presa" (lo que uno sirve en el plato).
  432: [u('1 pedazo', 80), u('1 porción', 120)],
  429: [u('1 chuleta', 110), u('1 pedazo', 80)],
  351: [u('1 pedazo', 90), u('1 porción', 120)],
  346: [u('1 bife', 120), u('1 pedazo', 80)],
  403: [u('1 presa', 100), u('1 pedazo', 80)],
  396: [u('1 muslo', 90), u('1 presa', 90)],
  // Ensalada (de tomate, la más común como acompañante).
  161: [u('1 porción', 100), u('1 plato pequeño', 150)],

  // Lácteos
  458: [u('1 taza', 240), u('1 vaso', 200)],
  457: [u('1 taza', 240), u('1 vaso', 200)],
  448: [u('1 pote', 170), u('1 cucharada', 15)],
  449: [u('1 pote', 170), u('1 cucharada', 15)],
  461: [u('1 tajada', 30)],
  463: [u('1 tajada', 15)],
  467: [u('1 tajada', 15)],
  464: [u('1 cucharada', 6)],
  468: [u('1 cucharada', 20)],
  469: [u('1 cucharada', 20)],

  // Verduras
  157: [u('1 tomate mediano', 120)],
  107: [u('1 cebolla mediana', 110), u('½ cebolla', 55)],
  82: [u('1 diente', 5)],
  110: [u('1 zanahoria mediana', 70)],
  92: [u('1 papa mediana', 150)],
  89: [u('1 batata mediana', 150)],
  129: [u('1 trozo', 100)],
  119: [u('1 taza', 30)],
  78: [u('1 hoja', 10), u('1 taza', 35)],
  101: [u('1 taza', 90)],
  145: [u('½ pimentón', 75)],

  // Frutas
  179: [u('1 banano mediano', 100)],
  182: [u('1 banano', 70)],
  175: [u('1 plátano', 200)],
  163: [u('½ aguacate', 100), u('1 cucharada', 15)],
  239: [u('1 fresa', 12), u('1 taza', 150)],
  221: [u('1 manzana mediana', 150)],
  214: [u('1 naranja mediana', 180)],
  226: [u('1 taza', 140)],
  231: [u('1 mango mediano', 200)],
  220: [u('1 limón', 60)],

  // Semillas y frutos secos
  594: [u('1 cucharada molida', 7), u('1 cucharadita', 2.5)],
  593: [u('1 cucharada', 9)],
  587: [u('1 puñado', 25)],
  597: [u('1 puñado', 25)],
  588: [u('1 puñado', 25)],
  589: [u('1 castaña', 4)],
  590: [u('1 cucharada rallado', 10)],

  // Grasas
  272: [u('1 cucharada', 13), u('1 cucharadita', 4)],
  260: [u('1 cucharada', 13), u('1 cucharadita', 4)],
  261: [u('1 cucharadita', 5), u('1 cucharada', 10)],
  262: [u('1 cucharadita', 5), u('1 cucharada', 10)],

  // Dulces y otros
  492: [u('1 cucharadita', 5), u('1 cucharada', 12)],
  493: [u('1 cucharadita', 5), u('1 cucharada', 12)],
  507: [u('1 cucharada', 20)],
  517: [u('1 cucharadita', 5)],
  518: [u('1 cucharada', 15)],
  523: [u('1 taza', 240), u('1 cucharada', 15)],

  // Bebidas
  209: [u('1 vaso', 200)],
  215: [u('1 vaso', 200)],
  471: [u('1 pocillo', 100)],
  582: [u('1 vaso', 200)],
}

// Alimentos que se miden en ml (para mostrar "ml" en vez de "g").
// Para efectos de cálculo se asume 1 ml ≈ 1 g (aproximación).
export const LIQUIDOS = new Set([209, 215, 219, 458, 457, 471, 476, 478, 523, 582, 260, 268, 269, 272, 518])
