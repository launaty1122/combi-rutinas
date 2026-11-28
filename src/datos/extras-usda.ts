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
  // Ojo: sin "pasta de amendoim" como alias, porque hacía que "pasta" encontrara mantequilla de maní.
  '174266': { alias: ['Mantequilla de maní', 'crema de cacahuate', 'manteiga de amendoim', 'peanut butter'], categoria: 'semillas', porciones: [u('1 cucharada', 16)] },
  '171304': { alias: ['Yogur griego natural', 'yogurt griego', 'iogurte grego'], categoria: 'lacteos', porciones: [u('1 pote', 170), u('1 cucharada', 15)] },
  '170894': { alias: ['Yogur griego descremado', 'yogur griego light'], categoria: 'lacteos', porciones: [u('1 pote', 170), u('1 cucharada', 15)] },
  '168922': {
    // Aproximación: la USDA no tiene "harina precocida para arepas"; es la harina de maíz blanca desgerminada más cercana.
    // "1 arepa" = los 40 g de harina con que se hace una arepa mediana (el agua no suma nutrientes).
    alias: ['Arepa (de harina precocida)', 'arepa', 'arepas', 'arepa blanca', 'harina para arepas', 'masarepa', 'harina pan'],
    categoria: 'granos',
    porciones: [u('1 arepa', 40), u('1 taza de harina', 120)],
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

  // Comidas de todos los días que TACO no trae.
  '174924': { alias: ['Pan blanco de molde', 'pan de molde', 'pan tajado', 'pan forma', 'pão de forma', 'pan blanco'], categoria: 'granos', porciones: [u('1 tajada', 25)] },
  '169737': { alias: ['Pasta cocida', 'pasta', 'espagueti', 'espaguetis', 'macarrones', 'macarrão cozido', 'fideos'], categoria: 'granos', porciones: [u('1 taza', 140), u('1 plato', 200)] },
  '172968': { alias: ['Salchicha', 'salchichas', 'perro caliente', 'salsicha', 'hot dog'], categoria: 'proteinas', porciones: [u('1 salchicha', 45)] },
  '171624': { alias: ['Salchicha de pollo', 'salsicha de frango'], categoria: 'proteinas', porciones: [u('1 salchicha', 45)] },
  '168200': { alias: ['Plátano maduro frito', 'tajadas de maduro', 'maduro frito', 'plátano frito', 'banana da terra frita'], categoria: 'frutas', porciones: [u('1 tajada', 30), u('1 porción', 100)] },
  '168199': { alias: ['Patacones', 'patacón', 'plátano verde frito', 'tostones'], categoria: 'frutas', porciones: [u('1 patacón', 35)] },
  '169131': { alias: ['Plátano maduro asado', 'maduro asado', 'plátano cocido', 'plátano al horno'], categoria: 'frutas', porciones: [u('1 plátano', 200), u('½ plátano', 100)] },
  '167535': { alias: ['Tortilla de trigo', 'wrap', 'tortilla de harina', 'rap 10'], categoria: 'granos', porciones: [u('1 tortilla', 45)] },
  '171646': { alias: ['Granola'], categoria: 'granos', porciones: [u('1 cucharada', 8), u('¼ taza', 30)] },
  '173709': { alias: ['Atún en agua (lata)', 'atún en agua', 'atum em água'], categoria: 'proteinas', porciones: [u('1 lata escurrida', 120)] },
  '173864': { alias: ['Jamón tajado', 'jamón', 'jamón de cerdo', 'presunto fatiado'], categoria: 'proteinas', porciones: [u('1 tajada', 20)] },

  // Ampliación de la base (lo que más faltaba al anotar el día a día).
  // Proteína de soja: la USDA no trae "texturizada"; el concentrado de soja tiene casi los mismos valores. Aproximado.
  '172447': { alias: ['Proteína de soja texturizada (seca)', 'proteína de soja', 'proteína de soya', 'proteina de soja', 'proteína texturizada', 'soja texturizada', 'soya texturizada', 'carne de soya', 'carne de soja', 'pts', 'proteína de soja texturizada'], categoria: 'proteinas', porciones: [u('¼ taza', 25), u('1 cucharada', 6)] },
  '174276': { alias: ['Proteína de soja aislada (polvo)', 'proteína de soya en polvo', 'proteína de soja en polvo', 'proteína vegana', 'soy protein'], categoria: 'proteinas', porciones: [u('1 scoop', 30)] },
  '172187': { alias: ['Huevo revuelto', 'huevos revueltos', 'huevo pericos', 'huevos pericos', 'huevo perico', 'perico', 'ovo mexido', 'ovos mexidos'], categoria: 'proteinas', porciones: [u('1 huevo', 55)] },
  '172183': { alias: ['Clara de huevo cruda', 'claras', 'claras de huevo'], categoria: 'proteinas', porciones: [u('1 clara', 33)] },
  '167914': { alias: ['Tocineta', 'tocineta frita', 'tocino', 'bacon', 'beicon'], categoria: 'proteinas', porciones: [u('1 tira', 8)] },
  '172941': { alias: ['Pechuga de pavo tajada', 'jamón de pavo', 'pavo tajado', 'peito de peru'], categoria: 'proteinas', porciones: [u('1 tajada', 20)] },
  '175177': { alias: ['Tilapia cocida', 'tilapia', 'mojarra'], categoria: 'proteinas', porciones: [u('1 filete', 90)] },
  '175175': { alias: ['Salmón en lata', 'salmón enlatado'], categoria: 'proteinas', porciones: [u('½ lata', 75)] },
  '172480': { alias: ['Cordero', 'carne de cordero', 'cordeiro'], categoria: 'proteinas', porciones: [u('1 porción', 100)] },
  '172467': { alias: ['Tempeh'], categoria: 'proteinas', porciones: [u('1 porción', 85)] },
  '172455': { alias: ['Falafel'], categoria: 'preparados', porciones: [u('1 falafel', 17)] },

  // Desayuno, panes y snacks
  '175009': { alias: ['Pancakes', 'pancake', 'panqueques', 'hotcakes', 'panquecas'], categoria: 'granos', porciones: [u('1 pancake', 40)] },
  '175038': { alias: ['Waffle', 'waffles', 'wafle'], categoria: 'granos', porciones: [u('1 waffle', 35)] },
  '173905': { alias: ['Avena cocida en agua', 'avena cocida', 'avena en agua', 'avena caliente', 'mingau de aveia', 'porridge'], categoria: 'granos', porciones: [u('1 taza', 234)] },
  '173884': { alias: ['Cereal de aritos de avena', 'cheerios', 'aritos de avena', 'cereal de aros'], categoria: 'granos', porciones: [u('1 taza', 28)] },
  '172796': { alias: ['Pan de hamburguesa o de perro', 'pan de hamburguesa', 'pan de perro', 'pan de hot dog', 'pão de hambúrguer'], categoria: 'granos', porciones: [u('1 pan', 45)] },
  '174899': { alias: ['Bagel'], categoria: 'granos', porciones: [u('1 bagel', 100)] },
  '174987': { alias: ['Croissant', 'cruasán', 'medialuna'], categoria: 'granos', porciones: [u('1 croissant', 57)] },
  '172684': { alias: ['Pan de centeno', 'pão de centeio'], categoria: 'granos', porciones: [u('1 tajada', 32)] },
  '170250': { alias: ['Galletas de arroz', 'galleta de arroz', 'tortitas de arroz', 'rice cakes', 'bolacha de arroz', 'biscoito de arroz'], categoria: 'granos', porciones: [u('1 galleta', 9)] },
  '167558': { alias: ['Totopos (chips de maíz)', 'totopos', 'tortilla chips', 'chips de maíz', 'nachos', 'doritos'], categoria: 'preparados', porciones: [u('1 puñado', 28)] },
  '167959': { alias: ['Crispetas sin aceite', 'palomitas sin aceite', 'pipoca sem óleo'], categoria: 'granos', porciones: [u('1 taza', 8)] },
  '167542': { alias: ['Barra de cereal', 'barrita de cereal', 'barra de granola', 'barrinha de cereal'], categoria: 'granos', porciones: [u('1 barra', 25)] },
  '169700': { alias: ['Cuscús cocido', 'cuscús', 'couscous'], categoria: 'granos', porciones: [u('1 taza', 157)] },
  '168919': { alias: ['Fideos de huevo cocidos', 'tallarines', 'noodles', 'fideos chinos'], categoria: 'granos', porciones: [u('1 taza', 160)] },

  // Comida rápida y platos
  '170317': { alias: ['Pizza de queso', 'pizza', 'pizza margarita', 'pizza hawaiana'], categoria: 'preparados', porciones: [u('1 tajada', 100)] },
  '172095': { alias: ['Pizza con carne (pepperoni)', 'pizza de pepperoni', 'pizza de carne', 'pizza con jamón'], categoria: 'preparados', porciones: [u('1 tajada', 110)] },
  '170694': { alias: ['Hamburguesa sencilla', 'hamburguesa', 'hamburguesas', 'hambúrguer'], categoria: 'preparados', porciones: [u('1 hamburguesa', 110)] },
  '173317': { alias: ['Hamburguesa grande con todo', 'hamburguesa con todo', 'hamburguesa grande', 'hamburguesa completa'], categoria: 'preparados', porciones: [u('1 hamburguesa', 220)] },
  '170698': { alias: ['Papas fritas de comida rápida', 'papas fritas', 'papitas fritas', 'french fries', 'batata frita'], categoria: 'preparados', porciones: [u('1 porción mediana', 117), u('1 porción pequeña', 71)] },
  '170725': { alias: ['Nuggets de pollo', 'nuggets', 'nugget', 'deditos de pollo'], categoria: 'preparados', porciones: [u('1 nugget', 16)] },
  '170346': { alias: ['Pollo frito apanado', 'pollo frito', 'pollo apanado', 'pollo broaster', 'frango frito'], categoria: 'proteinas', porciones: [u('1 presa', 120)] },
  '172039': { alias: ['Burrito de fríjol y queso', 'burrito', 'burritos'], categoria: 'preparados', porciones: [u('1 burrito pequeño', 100), u('1 burrito grande', 250)] },
  '167658': { alias: ['Taco de carne', 'taco', 'tacos', 'taco mexicano'], categoria: 'preparados', porciones: [u('1 taco', 100)] },
  '167660': { alias: ['Empanada de carne', 'empanada', 'empanadas'], categoria: 'preparados', porciones: [u('1 empanada', 90)] },
  '167664': { alias: ['Tamal de maíz', 'tamal', 'tamales'], categoria: 'preparados', porciones: [u('1 tamal', 150)] },
  '168555': { alias: ['Puré de papa', 'puré de papas', 'purê de batata', 'puré'], categoria: 'preparados', porciones: [u('1 taza', 210), u('½ taza', 105)] },
  '170093': { alias: ['Papa al horno con cáscara', 'papa al horno', 'papa asada', 'batata assada'], categoria: 'verduras', porciones: [u('1 papa mediana', 173)] },
  '168063': { alias: ['Arroz con leche', 'arroz doce'], categoria: 'dulces', porciones: [u('½ taza', 120)] },

  // Salsas y para untar
  '168556': { alias: ['Kétchup', 'ketchup', 'salsa de tomate (kétchup)', 'catsup'], categoria: 'otros', porciones: [u('1 cucharada', 17)] },
  '172234': { alias: ['Mostaza', 'mostarda'], categoria: 'otros', porciones: [u('1 cucharadita', 5)] },
  '173592': { alias: ['Salsa ranch', 'aderezo ranch'], categoria: 'otros', porciones: [u('1 cucharada', 15)] },
  '171186': { alias: ['Salsa picante', 'ají', 'sriracha', 'molho de pimenta'], categoria: 'otros', porciones: [u('1 cucharadita', 6)] },
  '173469': { alias: ['Vinagre', 'vinagre de manzana'], categoria: 'otros', porciones: [u('1 cucharada', 15)], liquido: true },
  '171579': { alias: ['Pesto', 'salsa pesto'], categoria: 'otros', porciones: [u('1 cucharada', 16)] },
  '171257': { alias: ['Crema agria', 'sour cream', 'suero costeño'], categoria: 'lacteos', porciones: [u('1 cucharada', 12)] },
  '173418': { alias: ['Queso crema', 'cream cheese', 'philadelphia'], categoria: 'lacteos', porciones: [u('1 cucharada', 15)] },
  '168000': { alias: ['Crema de avellanas con cacao', 'nutella', 'crema de avellanas', 'creme de avelã'], categoria: 'dulces', porciones: [u('1 cucharada', 19)] },
  '169641': { alias: ['Mermelada', 'mermelada de fresa', 'mermelada de mora', 'geleia de fruta'], categoria: 'dulces', porciones: [u('1 cucharada', 20)] },
  '169661': { alias: ['Sirope de maple', 'miel de maple', 'maple', 'sirope de arce'], categoria: 'dulces', porciones: [u('1 cucharada', 20)], liquido: true },
  '168588': { alias: ['Mantequilla de almendras', 'crema de almendras'], categoria: 'semillas', porciones: [u('1 cucharada', 16)] },

  // Dulces y postres
  '167575': { alias: ['Helado de vainilla', 'helado', 'helados', 'sorvete', 'sorvete de creme', 'mantecado'], categoria: 'dulces', porciones: [u('1 bola', 66), u('1 taza', 132)] },
  '168809': { alias: ['Helado de chocolate', 'sorvete de chocolate'], categoria: 'dulces', porciones: [u('1 bola', 66)] },
  '172716': { alias: ['Galletas con chips de chocolate', 'galleta con chips', 'cookies', 'cookie', 'galletas de chocolate chip'], categoria: 'dulces', porciones: [u('1 galleta pequeña', 10), u('1 galleta grande', 40)] },
  '172713': { alias: ['Brownie', 'brownies'], categoria: 'dulces', porciones: [u('1 brownie', 56)] },
  '174992': { alias: ['Dona glaseada', 'dona', 'donas', 'donut', 'rosquilla'], categoria: 'dulces', porciones: [u('1 dona', 60)] },
  '172765': { alias: ['Muffin', 'muffins', 'magdalena', 'mantecada'], categoria: 'dulces', porciones: [u('1 muffin', 113)] },
  '167995': { alias: ['Masmelos', 'masmelo', 'malvaviscos', 'marshmallow'], categoria: 'dulces', porciones: [u('1 masmelo', 7)] },

  // Bebidas
  '171277': { alias: ['Chocolate caliente con leche', 'chocolate caliente', 'chocolate en leche', 'chocolatada'], categoria: 'bebidas', porciones: [u('1 taza', 250), u('1 pocillo', 150)], liquido: true },
  '173190': { alias: ['Vino tinto', 'vino', 'vinho tinto'], categoria: 'bebidas', porciones: [u('1 copa', 150)], liquido: true },
  '174837': { alias: ['Vino blanco', 'vinho branco'], categoria: 'bebidas', porciones: [u('1 copa', 150)], liquido: true },
  '174815': { alias: ['Licor destilado (ron, vodka, whisky, ginebra)', 'ron', 'vodka', 'whisky', 'ginebra', 'gin', 'tequila', 'trago'], categoria: 'bebidas', porciones: [u('1 trago', 45)], liquido: true },
  '173210': { alias: ['Bebida energizante', 'energizante', 'red bull', 'monster', 'energético'], categoria: 'bebidas', porciones: [u('1 lata', 250)], liquido: true },
  '171891': { alias: ['Café espresso', 'espresso', 'expreso', 'café expreso'], categoria: 'bebidas', porciones: [u('1 pocillo', 30)], liquido: true },
  '170904': { alias: ['Kéfir', 'kefir', 'búlgaros'], categoria: 'lacteos', porciones: [u('1 vaso', 240)], liquido: true },
  '173217': { alias: ['Limonada', 'limonada con azúcar'], categoria: 'bebidas', porciones: [u('1 vaso', 240)], liquido: true },
  '173933': { alias: ['Jugo de manzana', 'suco de maçã'], categoria: 'bebidas', porciones: [u('1 vaso', 240)], liquido: true },

  // Verduras
  '168462': { alias: ['Espinaca baby cruda', 'espinaca baby', 'espinacas', 'espinafre'], categoria: 'verduras', porciones: [u('1 taza', 30)] },
  '168421': { alias: ['Kale', 'col rizada', 'couve kale'], categoria: 'verduras', porciones: [u('1 taza', 20)] },
  '169251': { alias: ['Champiñones crudos', 'champiñones', 'champiñón', 'hongos', 'cogumelos', 'champignon'], categoria: 'verduras', porciones: [u('1 taza', 70)] },
  '169252': { alias: ['Champiñones cocidos', 'hongos cocidos', 'champiñones salteados'], categoria: 'verduras', porciones: [u('½ taza', 78)] },
  '168390': { alias: ['Espárragos cocidos', 'espárragos', 'aspargos'], categoria: 'verduras', porciones: [u('1 espárrago', 15)] },
  '169999': { alias: ['Mazorca cocida (maíz tierno)', 'mazorca', 'choclo', 'maíz tierno', 'elote', 'milho cozido'], categoria: 'verduras', porciones: [u('1 mazorca', 100), u('½ taza', 82)] },
  '170420': { alias: ['Arvejas cocidas', 'arveja cocida', 'guisantes', 'chícharos', 'ervilha cozida'], categoria: 'verduras', porciones: [u('½ taza', 80)] },
  '169971': { alias: ['Coles de Bruselas cocidas', 'coles de bruselas', 'repollitas'], categoria: 'verduras', porciones: [u('½ taza', 78)] },

  // Frutas
  '167755': { alias: ['Frambuesas', 'frambuesa', 'framboesa'], categoria: 'frutas', porciones: [u('1 taza', 123)] },
  '173946': { alias: ['Mora', 'moras', 'mora de castilla', 'amora', 'zarzamora'], categoria: 'frutas', porciones: [u('1 taza', 144)] },
  '173043': { alias: ['Uchuva', 'uchuvas', 'aguaymanto', 'uvilla', 'physalis'], categoria: 'frutas', porciones: [u('1 puñado', 50), u('1 taza', 140)] },
  '168165': { alias: ['Uvas pasas', 'pasas', 'uva passa'], categoria: 'frutas', porciones: [u('1 cucharada', 9)] },
  '168191': { alias: ['Dátiles', 'dátil', 'tâmara'], categoria: 'frutas', porciones: [u('1 dátil', 24)] },
  '171723': { alias: ['Arándanos rojos deshidratados', 'cranberries'], categoria: 'frutas', porciones: [u('1 cucharada', 10)] },
  '171719': { alias: ['Cerezas', 'cereza', 'cerejas'], categoria: 'frutas', porciones: [u('1 puñado', 70)] },
  '173033': { alias: ['Toronja', 'pomelo', 'toranja'], categoria: 'frutas', porciones: [u('½ toronja', 123)] },

  // Frutos secos y quesos
  '170567': { alias: ['Almendras naturales', 'almendras crudas'], categoria: 'semillas', porciones: [u('1 puñado', 28)] },
  '170184': { alias: ['Pistachos', 'pistacho', 'pistache'], categoria: 'semillas', porciones: [u('1 puñado', 28)] },
  '170178': { alias: ['Nueces de macadamia', 'macadamia'], categoria: 'semillas', porciones: [u('1 puñado', 28)] },
  '170581': { alias: ['Avellanas', 'avellana', 'avelã'], categoria: 'semillas', porciones: [u('1 puñado', 28)] },
  '170585': { alias: ['Mezcla de frutos secos', 'frutos secos', 'mix de nueces', 'mix de frutos secos', 'mix de castanhas'], categoria: 'semillas', porciones: [u('1 puñado', 28)] },
  '173414': { alias: ['Queso cheddar', 'cheddar', 'queso amarillo', 'queso americano'], categoria: 'lacteos', porciones: [u('1 tajada', 20)] },
  '173420': { alias: ['Queso feta', 'feta'], categoria: 'lacteos', porciones: [u('¼ taza', 37)] },

  // Reemplazan a los de TACO, que no traen calorías ni macronutrientes de estos alimentos.
  '171265': { alias: ['Leche entera', 'leche', 'leite integral', 'leche deslactosada', 'leite sem lactose'], categoria: 'lacteos', porciones: [u('1 taza', 240), u('1 vaso', 200)], liquido: true },
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
