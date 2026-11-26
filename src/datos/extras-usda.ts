import type { CategoriaAlimento, Porcion } from '../logica/tipos'

// Alimentos que TACO no trae, tomados de USDA FoodData Central (SR Legacy, 2018).
// Clave: fdc_id del USDA. Los valores nutricionales están en alimentos-usda.json.
interface Extra {
  alias: string[]
  categoria: CategoriaAlimento
  porciones: Porcion[]
  liquido?: boolean
}

const u = (nombre: string, gramos: number): Porcion => ({ nombre, gramos })

export const EXTRAS_USDA: Record<string, Extra> = {
  '170554': { alias: ['Chía', 'semillas de chía', 'chia'], categoria: 'semillas', porciones: [u('1 cucharada', 12), u('1 cucharadita', 4)] },
  '173180': { alias: ['Proteína whey (polvo)', 'whey', 'proteína en polvo', 'scoop'], categoria: 'proteinas', porciones: [u('1 scoop', 30)] },
  '168917': { alias: ['Quinoa cocida', 'quinua cocida'], categoria: 'granos', porciones: [u('1 taza', 185), u('½ taza', 92)] },
  '168874': { alias: ['Quinoa cruda', 'quinua', 'quinoa'], categoria: 'granos', porciones: [u('¼ taza', 43)] },
  '174266': { alias: ['Mantequilla de maní', 'crema de cacahuate', 'pasta de amendoim', 'peanut butter'], categoria: 'semillas', porciones: [u('1 cucharada', 16)] },
  '171304': { alias: ['Yogur griego natural', 'yogurt griego', 'iogurte grego'], categoria: 'lacteos', porciones: [u('1 pote', 170), u('1 cucharada', 15)] },
  '170894': { alias: ['Yogur griego descremado', 'yogur griego light'], categoria: 'lacteos', porciones: [u('1 pote', 170), u('1 cucharada', 15)] },
  '168922': {
    // Aproximación: la USDA no tiene "harina precocida para arepas"; es la harina de maíz blanca desgerminada más cercana.
    alias: ['Harina de maíz precocida (arepas)', 'harina para arepas', 'masarepa', 'harina pan'],
    categoria: 'granos',
    porciones: [u('1 taza', 120), u('harina para 1 arepa', 40)],
  },
  '169593': { alias: ['Cacao en polvo sin azúcar', 'cacao', 'cacau em pó'], categoria: 'otros', porciones: [u('1 cucharada', 5)] },
  '171320': { alias: ['Canela molida', 'canela'], categoria: 'otros', porciones: [u('1 cucharadita', 2.6)] },
  '174832': { alias: ['Leche de almendras sin azúcar', 'bebida de almendras'], categoria: 'bebidas', porciones: [u('1 vaso', 240)], liquido: true },
  '172182': { alias: ['Queso cottage', 'cottage'], categoria: 'lacteos', porciones: [u('½ taza', 113), u('1 cucharada', 15)] },
  '173757': { alias: ['Garbanzos cocidos', 'grão-de-bico cozido'], categoria: 'legumbres', porciones: [u('1 taza', 164), u('½ taza', 82)] },
  '175036': { alias: ['Tortilla de maíz'], categoria: 'granos', porciones: [u('1 tortilla', 26)] },
  '170562': { alias: ['Semillas de girasol', 'pipas de girasol'], categoria: 'semillas', porciones: [u('1 cucharada', 9)] },
  '170556': { alias: ['Semillas de calabaza (pepitas)', 'pepitas', 'semillas de ahuyama'], categoria: 'semillas', porciones: [u('1 cucharada', 9)] },
  '168411': { alias: ['Edamame cocido', 'edamame'], categoria: 'legumbres', porciones: [u('1 taza', 155)] },
  '171711': { alias: ['Arándanos', 'blueberries', 'mirtilo'], categoria: 'frutas', porciones: [u('1 taza', 148), u('1 puñado', 40)] },
  '171412': { alias: ['Aceite de coco'], categoria: 'grasas', porciones: [u('1 cucharada', 13.6), u('1 cucharadita', 4.5)] },
  '168910': { alias: ['Pasta integral cocida', 'macarrones integrales'], categoria: 'granos', porciones: [u('1 taza', 140)] },
  '174289': { alias: ['Hummus'], categoria: 'preparados', porciones: [u('1 cucharada', 15)] },

  // Reemplazan a los de TACO, que no traen calorías ni macronutrientes de estos alimentos.
  '171265': { alias: ['Leche entera', 'leche', 'leite integral'], categoria: 'lacteos', porciones: [u('1 taza', 240), u('1 vaso', 200)], liquido: true },
  '171269': { alias: ['Leche descremada', 'leche desnatada', 'leite desnatado'], categoria: 'lacteos', porciones: [u('1 taza', 240), u('1 vaso', 200)], liquido: true },
  '171411': { alias: ['Aceite de soya', 'aceite', 'óleo de soja'], categoria: 'grasas', porciones: [u('1 cucharada', 13), u('1 cucharadita', 4)], liquido: true },
  '171413': { alias: ['Aceite de oliva', 'azeite de oliva'], categoria: 'grasas', porciones: [u('1 cucharada', 13), u('1 cucharadita', 4)], liquido: true },
  '172336': { alias: ['Aceite de canola', 'óleo de canola'], categoria: 'grasas', porciones: [u('1 cucharada', 13)], liquido: true },
  '171025': { alias: ['Aceite de girasol', 'óleo de girassol'], categoria: 'grasas', porciones: [u('1 cucharada', 13)], liquido: true },
  '173468': { alias: ['Sal', 'sal de cocina', 'sal refinada'], categoria: 'otros', porciones: [u('1 cucharadita', 6), u('1 pizca', 0.5)] },
}

/**
 * Alimentos de TACO que se ocultan porque el USDA trae la versión completa
 * (TACO no analizó calorías ni macros de leches líquidas y aceites; la sal no tiene kcal).
 */
export const TACO_REEMPLAZADOS = new Set([
  'taco-457', 'taco-458', // leches → usda-171269, usda-171265
  'taco-260', 'taco-268', 'taco-269', 'taco-272', // aceites → usda-171413, 172336, 171025, 171411
  'taco-516', 'taco-517', // sal → usda-173468
])
