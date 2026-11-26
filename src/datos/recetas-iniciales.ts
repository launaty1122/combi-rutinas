import type { IngredienteReceta, Receta } from '../logica/tipos'

// Recetario inicial: recetas originales, con ingredientes fáciles de conseguir en Minas Gerais.
// Cantidades para la receta completa (todas sus porciones). La nutrición se calcula sola con TACO/USDA.
// Los ids de alimentos: "taco-N" (tabla TACO) o "usda-N" (USDA).

const i = (alimentoId: string, gramos: number, texto: string): IngredienteReceta => ({ alimentoId, gramos, texto })

// Alimentos usados (para leer las recetas más fácil).
const HUEVO = 'taco-489'
const ARROZ = 'taco-3'
const FEIJAO = 'taco-561'
const FRIJOL_NEGRO = 'taco-567'
const FRIJOL_ROJO = 'taco-569'
const LENTEJAS = 'taco-577'
const GARBANZOS = 'usda-173757'
const PECHUGA = 'taco-409'
const POLLO_COCIDO = 'taco-408'
const CARNE_MOLIDA = 'taco-327'
const SALMON = 'taco-316'
const ATUN = 'taco-277'
const TOFU = 'taco-584'
const EDAMAME = 'usda-168411'
const TOMATE = 'taco-157'
const CEBOLLA = 'taco-107'
const AJO = 'taco-82'
const CEBOLLIN = 'taco-108'
const ZANAHORIA = 'taco-110'
const ESPINACA = 'taco-119'
const COUVE = 'taco-115'
const BROCOLI = 'taco-101'
const PEPINO = 'taco-142'
const PIMENTON = 'taco-145'
const PEREJIL = 'taco-153'
const MAIZ = 'taco-44'
const PAPA = 'taco-92'
const YUCA = 'taco-129'
const BATATA = 'taco-89'
const AGUACATE = 'taco-163'
const LIMON = 'taco-219'
const BANANO = 'taco-179'
const FRESA = 'taco-239'
const PAPAYA = 'taco-226'
const MANGO = 'taco-231'
const ARANDANOS = 'usda-171711'
const AVENA = 'taco-7'
const TAPIOCA = 'taco-124'
const HARINA_AREPA = 'usda-168922'
const TORTILLA = 'usda-175036'
const QUINOA = 'usda-168917'
const PASTA_INTEGRAL = 'usda-168910'
const LECHE = 'usda-171265'
const LECHE_DESCREMADA = 'usda-171269'
const LECHE_ALMENDRAS = 'usda-174832'
const LECHE_COCO = 'taco-523'
const YOGUR = 'taco-448'
const YOGUR_GRIEGO = 'usda-171304'
const QUESO_MINAS = 'taco-461'
const MOZZARELLA = 'taco-463'
const PARMESANO = 'taco-464'
const RICOTA = 'taco-469'
const REQUEIJAO = 'taco-468'
const COTTAGE = 'usda-172182'
const WHEY = 'usda-173180'
const CHIA = 'usda-170554'
const LINAZA = 'taco-594'
const AJONJOLI = 'taco-593'
const PEPITAS = 'usda-170556'
const MANI = 'usda-174266'
const CACAO = 'usda-169593'
const CANELA = 'usda-171320'
const MIEL = 'taco-507'
const AZUCAR = 'taco-492'
const SOYA = 'taco-518'
const HUMMUS = 'usda-174289'
const ACEITE = 'usda-171411'
const OLIVA = 'usda-171413'
const MANTEQUILLA = 'taco-261'
const SAL = 'usda-173468'

type Semilla = Omit<Receta, 'id' | 'favorita' | 'notas' | 'foto'>

const SEMILLAS: Semilla[] = [
  // ——— Colombianas ———
  {
    nombre: 'Arepa de queso con huevo',
    porciones: 2,
    minutos: 20,
    etiquetas: ['cocina:colombiana', 'momento:desayuno', 'dificultad:facil'],
    ficha: 'Un desayuno de casa que llena bonito: la arepa te da energía para arrancar y el huevo con queso suma proteína para llegar con calma al almuerzo.',
    ingredientes: [
      i(HARINA_AREPA, 80, '2 arepas (80 g de harina)'),
      i(QUESO_MINAS, 60, '2 tajadas de queso'),
      i(HUEVO, 100, '2 huevos'),
      i(MANTEQUILLA, 5, '1 cucharadita'),
      i(SAL, 1, 'una pizca'),
    ],
    pasos: [
      'Mezcla la harina con una pizca de sal y agua tibia (unos 100 ml) hasta tener una masa suave.',
      'Arma 2 arepas y ásalas en sartén a fuego medio, 5 minutos por lado.',
      'Mientras, haz los huevos a tu gusto.',
      'Abre las arepas, unta la mantequilla y rellénalas con el queso y el huevo.',
    ],
  },
  {
    nombre: 'Calentado de frijol con huevo',
    porciones: 1,
    minutos: 15,
    etiquetas: ['cocina:colombiana', 'momento:desayuno', 'dificultad:facil'],
    ficha: 'La forma más rica de aprovechar lo que sobró ayer. Frijol y arroz juntos se complementan en proteína, y la fibra del frijol te acompaña toda la mañana.',
    ingredientes: [
      i(FRIJOL_ROJO, 150, '1 taza de frijoles cocidos'),
      i(ARROZ, 100, '⅔ taza de arroz cocido'),
      i(HUEVO, 50, '1 huevo'),
      i(CEBOLLA, 30, '¼ de cebolla'),
      i(TOMATE, 60, '½ tomate'),
      i(ACEITE, 5, '1 cucharadita'),
    ],
    pasos: [
      'Sofríe la cebolla y el tomate picados en el aceite, 3 minutos.',
      'Agrega los frijoles y el arroz, y revuelve hasta que todo esté bien caliente.',
      'Sirve con el huevo frito o pericos encima.',
    ],
  },
  {
    nombre: 'Ajiaco ligero de pollo',
    porciones: 4,
    minutos: 50,
    etiquetas: ['cocina:colombiana', 'momento:almuerzo', 'tipo:sopa', 'tipo:meal-prep', 'dificultad:media'],
    ficha: 'Una sopa que abraza. El pollo aporta proteína y las papas se deshacen para espesar el caldo sin necesidad de crema. Rinde para varios días.',
    ingredientes: [
      i(PECHUGA, 500, '2 pechugas pequeñas'),
      i(PAPA, 600, '4 papas medianas'),
      i(MAIZ, 200, '2 mazorcas en trozos'),
      i(CEBOLLA, 110, '1 cebolla'),
      i(AJO, 10, '2 dientes'),
      i(CEBOLLIN, 20, '2 tallos de cebollín'),
      i(SAL, 3, 'al gusto'),
    ],
    pasos: [
      'Cocina las pechugas con la cebolla, el ajo, el cebollín y 2 litros de agua, 20 minutos.',
      'Saca el pollo y desmenúzalo.',
      'Agrega al caldo las papas en rodajas y la mazorca, y cocina 25 minutos, hasta que algunas papas se deshagan.',
      'Vuelve a poner el pollo, ajusta la sal y sirve.',
    ],
  },
  {
    nombre: 'Lentejas con hogao',
    porciones: 4,
    minutos: 35,
    etiquetas: ['cocina:colombiana', 'momento:almuerzo', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'Las lentejas son de las legumbres más rápidas de cocinar y traen fibra, hierro y proteína vegetal. El hogao les da ese sabor de casa.',
    ingredientes: [
      i(LENTEJAS, 800, '4 tazas de lentejas cocidas'),
      i(TOMATE, 240, '2 tomates'),
      i(CEBOLLA, 110, '1 cebolla'),
      i(AJO, 10, '2 dientes'),
      i(ZANAHORIA, 70, '1 zanahoria'),
      i(ACEITE, 13, '1 cucharada'),
      i(SAL, 3, 'al gusto'),
    ],
    pasos: [
      'Haz el hogao: sofríe cebolla, tomate y ajo picados en el aceite, 8 minutos a fuego bajo.',
      'Agrega la zanahoria rallada y las lentejas cocidas con un poco de su caldo.',
      'Cocina 15 minutos más, ajusta la sal y sirve.',
    ],
  },
  {
    nombre: 'Huevos pericos con arepa',
    porciones: 1,
    minutos: 15,
    etiquetas: ['cocina:colombiana', 'momento:desayuno', 'dificultad:facil'],
    ficha: 'El clásico de los desayunos colombianos. Huevo con tomate y cebolla larga: proteína, color y nada complicado.',
    ingredientes: [
      i(HUEVO, 100, '2 huevos'),
      i(TOMATE, 60, '½ tomate'),
      i(CEBOLLIN, 15, '1 tallo de cebolla larga'),
      i(HARINA_AREPA, 40, '1 arepa (40 g de harina)'),
      i(ACEITE, 4, '1 cucharadita'),
    ],
    pasos: [
      'Prepara y asa la arepa.',
      'Sofríe el tomate y la cebolla larga picados en el aceite, 3 minutos.',
      'Agrega los huevos batidos y revuelve suave hasta que cuajen.',
    ],
  },

  // ——— Brasileñas ———
  {
    nombre: 'Crepioca de pollo y queso',
    porciones: 1,
    minutos: 15,
    etiquetas: ['cocina:brasileña', 'momento:desayuno', 'momento:post-entreno', 'dificultad:facil'],
    ficha: 'Mitad crepe, mitad tapioca: queda suave por dentro y doradita por fuera. Con pollo y requeijão es un desayuno o post-entreno con mucha proteína.',
    ingredientes: [
      i(HUEVO, 100, '2 huevos'),
      i(TAPIOCA, 30, '2 cucharadas de goma de tapioca'),
      i(POLLO_COCIDO, 60, '½ taza de pollo desmechado'),
      i(REQUEIJAO, 20, '1 cucharada de requeijão'),
    ],
    pasos: [
      'Bate los huevos con la goma de tapioca y una pizca de sal.',
      'Vierte en una sartén antiadherente caliente y tapa 2 minutos.',
      'Voltéala, pon el pollo y el requeijão en una mitad y dóblala.',
    ],
  },
  {
    nombre: 'Bowl de feijão con arroz y huevo',
    porciones: 2,
    minutos: 25,
    etiquetas: ['cocina:brasileña', 'momento:almuerzo', 'tipo:bowl', 'dificultad:facil'],
    ficha: 'El clásico de casa, servido en bowl. Feijão y arroz juntos se complementan en proteína, y la fibra del feijão te deja satisfecha por horas.',
    ingredientes: [
      i(FEIJAO, 300, '1½ taza de feijão cocido'),
      i(ARROZ, 200, '1¼ taza de arroz cocido'),
      i(HUEVO, 100, '2 huevos'),
      i(TOMATE, 120, '1 tomate'),
      i(CEBOLLA, 55, '½ cebolla'),
      i(AGUACATE, 140, '½ aguacate grande'),
      i(ACEITE, 4, '1 cucharadita'),
    ],
    pasos: [
      'Calienta el feijão y el arroz.',
      'Pica el tomate y la cebolla en cubitos y mézclalos con una pizca de sal (vinagrete).',
      'Haz los huevos fritos o cocidos.',
      'Arma los bowls: arroz, feijão, vinagrete, aguacate en láminas y el huevo encima.',
    ],
  },
  {
    nombre: 'Tapioca de banano y canela',
    porciones: 1,
    minutos: 10,
    etiquetas: ['cocina:brasileña', 'momento:merienda', 'momento:pre-entreno', 'dificultad:facil'],
    ficha: 'Dulce sin azúcar añadida: el banano y la canela hacen todo el trabajo. La tapioca da energía rápida, ideal antes de entrenar.',
    ingredientes: [
      i(TAPIOCA, 45, '3 cucharadas de goma de tapioca'),
      i(BANANO, 100, '1 banano'),
      i(CANELA, 1, 'una pizca'),
      i(MANI, 16, '1 cucharada de mantequilla de maní'),
    ],
    pasos: [
      'Esparce la goma de tapioca en una sartén caliente, sin aceite, hasta que se pegue (1–2 minutos).',
      'Voltéala y rellena con el banano en rodajas, la mantequilla de maní y la canela.',
      'Dobla y sirve.',
    ],
  },
  {
    nombre: 'Pollo a la mineira con couve',
    porciones: 3,
    minutos: 30,
    etiquetas: ['cocina:brasileña', 'momento:almuerzo', 'momento:cena', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'Pollo dorado con couve salteada en ajo, como en las cocinas de Minas. La couve suma calcio y vitamina C, y queda lista en minutos.',
    ingredientes: [
      i(PECHUGA, 450, '2 pechugas'),
      i(COUVE, 150, '1 maço de couve'),
      i(AJO, 10, '2 dientes'),
      i(CEBOLLA, 110, '1 cebolla'),
      i(ACEITE, 13, '1 cucharada'),
      i(SAL, 3, 'al gusto'),
    ],
    pasos: [
      'Corta el pollo en tiras, sazona con sal y dóralo en la mitad del aceite.',
      'Retira, y en la misma sartén sofríe la cebolla y el ajo.',
      'Agrega la couve en tiras finas y saltea solo 2 minutos, para que quede verde.',
      'Vuelve a poner el pollo, mezcla y sirve.',
    ],
  },
  {
    nombre: 'Omelete de espinaca y ricota',
    porciones: 1,
    minutos: 12,
    etiquetas: ['cocina:brasileña', 'momento:cena', 'momento:post-entreno', 'dificultad:facil'],
    ficha: 'Rápido, suave y con mucha proteína. La espinaca aporta hierro y folato; la ricota la hace cremosa sin pesar.',
    ingredientes: [
      i(HUEVO, 150, '3 huevos'),
      i(ESPINACA, 60, '2 tazas de espinaca'),
      i(RICOTA, 60, '3 cucharadas de ricota'),
      i(TOMATE, 60, '½ tomate'),
      i(ACEITE, 4, '1 cucharadita'),
    ],
    pasos: [
      'Saltea la espinaca en el aceite hasta que se marchite.',
      'Agrega los huevos batidos con sal y deja cuajar a fuego bajo.',
      'Pon la ricota y el tomate en una mitad, dobla y sirve.',
    ],
  },
  {
    nombre: 'Escondidinho ligero de carne',
    porciones: 4,
    minutos: 50,
    etiquetas: ['cocina:brasileña', 'momento:almuerzo', 'tipo:meal-prep', 'dificultad:media'],
    ficha: 'Puré de yuca que "esconde" carne molida bien sazonada. Comida reconfortante para preparar el domingo y tener lista la semana.',
    ingredientes: [
      i(YUCA, 600, '600 g de yuca cocida'),
      i(CARNE_MOLIDA, 400, '400 g de carne molida'),
      i(CEBOLLA, 110, '1 cebolla'),
      i(TOMATE, 240, '2 tomates'),
      i(AJO, 10, '2 dientes'),
      i(LECHE, 100, '½ taza de leche'),
      i(MOZZARELLA, 80, 'un puñado de mozzarella'),
      i(SAL, 3, 'al gusto'),
    ],
    pasos: [
      'Haz un puré con la yuca cocida caliente y la leche.',
      'Dora la carne con la cebolla, el ajo y el tomate picados, 15 minutos.',
      'En un refractario pon la carne, cubre con el puré y luego la mozzarella.',
      'Hornea a 200 °C por 20 minutos, hasta que gratine.',
    ],
  },

  // ——— Japonesas ———
  {
    nombre: 'Onigiri de atún',
    porciones: 2,
    minutos: 20,
    etiquetas: ['cocina:japonesa', 'momento:merienda', 'tipo:snack', 'dificultad:media'],
    ficha: 'Bolitas de arroz con relleno de atún cremoso: fáciles de llevar y perfectas para una merienda que sí llena.',
    ingredientes: [
      i(ARROZ, 300, '2 tazas de arroz cocido'),
      i(ATUN, 120, '1 lata de atún escurrido'),
      i(YOGUR_GRIEGO, 30, '2 cucharadas de yogur griego'),
      i(SOYA, 15, '1 cucharada de salsa de soya'),
    ],
    pasos: [
      'Mezcla el atún con el yogur griego y la salsa de soya.',
      'Con las manos húmedas y una pizca de sal, toma una porción de arroz tibio y aplánala.',
      'Pon una cucharada de relleno en el centro, cierra y dale forma de triángulo.',
    ],
  },
  {
    nombre: 'Bowl teriyaki de pollo',
    porciones: 2,
    minutos: 25,
    etiquetas: ['cocina:japonesa', 'momento:almuerzo', 'tipo:bowl', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'Pollo glaseado con soya y un toque de miel, sobre arroz y verduras. Sabe a restaurante y se hace en una sartén.',
    ingredientes: [
      i(PECHUGA, 300, '1 pechuga grande'),
      i(ARROZ, 320, '2 tazas de arroz cocido'),
      i(BROCOLI, 180, '2 tazas de brócoli'),
      i(ZANAHORIA, 70, '1 zanahoria'),
      i(SOYA, 30, '2 cucharadas de salsa de soya'),
      i(MIEL, 20, '1 cucharada de miel'),
      i(AJONJOLI, 9, '1 cucharada de ajonjolí'),
      i(AJO, 5, '1 diente'),
    ],
    pasos: [
      'Mezcla la soya, la miel y el ajo rallado.',
      'Dora el pollo en cubos y, al final, agrega la salsa hasta que brille.',
      'Cocina al vapor el brócoli y la zanahoria, 5 minutos.',
      'Sirve sobre el arroz y termina con ajonjolí.',
    ],
  },
  {
    nombre: 'Tofu salteado con edamame',
    porciones: 2,
    minutos: 20,
    etiquetas: ['cocina:japonesa', 'momento:cena', 'dificultad:facil'],
    ficha: 'Proteína vegetal doble: tofu y edamame (frijol de soya tierno). Dorado, con ajonjolí, y listo en 20 minutos.',
    ingredientes: [
      i(TOFU, 300, '1 bloque de tofu firme'),
      i(EDAMAME, 155, '1 taza de edamame'),
      i(BROCOLI, 180, '2 tazas de brócoli'),
      i(SOYA, 30, '2 cucharadas de salsa de soya'),
      i(AJO, 5, '1 diente'),
      i(ACEITE, 8, '2 cucharaditas'),
      i(AJONJOLI, 9, '1 cucharada'),
    ],
    pasos: [
      'Seca el tofu con un paño y córtalo en cubos.',
      'Dóralo en el aceite sin moverlo mucho, 8 minutos.',
      'Agrega el ajo, el brócoli y el edamame, y saltea 4 minutos.',
      'Termina con la soya y el ajonjolí.',
    ],
  },
  {
    nombre: 'Tamagoyaki (omelete enrollado)',
    porciones: 1,
    minutos: 15,
    etiquetas: ['cocina:japonesa', 'momento:desayuno', 'dificultad:media'],
    ficha: 'Omelete japonés en capas, apenas dulce. Requiere un poquito de paciencia y queda precioso.',
    ingredientes: [
      i(HUEVO, 150, '3 huevos'),
      i(SOYA, 5, '1 cucharadita de salsa de soya'),
      i(AZUCAR, 5, '1 cucharadita de azúcar'),
      i(CEBOLLIN, 10, '1 tallo de cebollín'),
      i(ACEITE, 4, '1 cucharadita'),
    ],
    pasos: [
      'Bate los huevos con la soya, el azúcar y el cebollín picado.',
      'En sartén con poco aceite, vierte una capa fina; cuando cuaje, enróllala hacia un lado.',
      'Vierte otra capa por debajo del rollo y vuelve a enrollar. Repite hasta terminar.',
      'Deja reposar 2 minutos y corta en rodajas.',
    ],
  },

  // ——— Del mundo ———
  {
    nombre: 'Tacos de frijol negro y aguacate',
    porciones: 2,
    minutos: 20,
    etiquetas: ['cocina:mexicana', 'momento:cena', 'dificultad:facil'],
    ficha: 'Tacos frescos y llenadores. El frijol negro y el aguacate traen mucha fibra; el limón despierta todo.',
    ingredientes: [
      i(TORTILLA, 156, '6 tortillas de maíz'),
      i(FRIJOL_NEGRO, 300, '1½ taza de frijol negro cocido'),
      i(AGUACATE, 140, '½ aguacate grande'),
      i(TOMATE, 120, '1 tomate'),
      i(CEBOLLA, 55, '½ cebolla'),
      i(LIMON, 20, 'jugo de 1 limón'),
      i(QUESO_MINAS, 60, 'queso fresco desmoronado'),
    ],
    pasos: [
      'Calienta los frijoles y aplástalos un poco con un tenedor.',
      'Haz un pico de gallo con tomate, cebolla, limón y sal.',
      'Calienta las tortillas y rellénalas con frijol, aguacate, pico de gallo y queso.',
    ],
  },
  {
    nombre: 'Ensalada mediterránea de garbanzos',
    porciones: 2,
    minutos: 15,
    etiquetas: ['cocina:mediterránea', 'momento:almuerzo', 'tipo:ensalada', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'Crujiente, fresca y con garbanzos que la hacen comida completa. Aguanta bien en la nevera para llevar.',
    ingredientes: [
      i(GARBANZOS, 300, '2 tazas de garbanzos cocidos'),
      i(PEPINO, 200, '1 pepino'),
      i(TOMATE, 240, '2 tomates'),
      i(CEBOLLA, 55, '½ cebolla morada'),
      i(QUESO_MINAS, 60, 'queso fresco en cubos'),
      i(PEREJIL, 10, 'un puñado de perejil'),
      i(LIMON, 20, 'jugo de 1 limón'),
      i(OLIVA, 13, '1 cucharada de aceite de oliva'),
    ],
    pasos: [
      'Pica el pepino, el tomate y la cebolla en cubos.',
      'Mezcla con los garbanzos, el queso y el perejil.',
      'Aliña con limón, aceite de oliva y sal.',
    ],
  },
  {
    nombre: 'Salmón al horno con batata',
    porciones: 2,
    minutos: 35,
    etiquetas: ['cocina:otra', 'momento:cena', 'dificultad:facil'],
    ficha: 'Todo en una bandeja. El salmón trae grasas buenas (omega-3) y la batata, energía que dura. Cuando el salmón esté caro, funciona con cualquier pescado.',
    ingredientes: [
      i(SALMON, 300, '2 filetes'),
      i(BATATA, 300, '2 batatas medianas'),
      i(BROCOLI, 180, '2 tazas de brócoli'),
      i(OLIVA, 13, '1 cucharada de aceite de oliva'),
      i(AJO, 10, '2 dientes'),
      i(LIMON, 20, 'jugo de 1 limón'),
    ],
    pasos: [
      'Corta la batata en cubos y hornéala con la mitad del aceite a 200 °C, 15 minutos.',
      'Agrega el salmón y el brócoli a la bandeja, con ajo, limón, sal y el resto del aceite.',
      'Hornea 12–15 minutos más, hasta que el salmón se desmenuce fácil.',
    ],
  },
  {
    nombre: 'Dal de lentejas con leche de coco',
    porciones: 4,
    minutos: 30,
    etiquetas: ['cocina:india', 'momento:almuerzo', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'Lentejas cremosas al estilo indio. La leche de coco las hace suaves y aromáticas. Va perfecto con arroz.',
    ingredientes: [
      i(LENTEJAS, 800, '4 tazas de lentejas cocidas'),
      i(LECHE_COCO, 200, '¾ taza de leche de coco'),
      i(TOMATE, 240, '2 tomates'),
      i(CEBOLLA, 110, '1 cebolla'),
      i(AJO, 10, '2 dientes'),
      i(ACEITE, 13, '1 cucharada'),
      i(SAL, 3, 'al gusto'),
    ],
    pasos: [
      'Sofríe la cebolla y el ajo en el aceite. Si tienes cúrcuma, comino o curry, agrégalos aquí.',
      'Añade el tomate picado y cocina 5 minutos.',
      'Agrega las lentejas y la leche de coco, y cocina 10 minutos a fuego bajo.',
    ],
  },
  {
    nombre: 'Pasta integral con atún y tomate',
    porciones: 2,
    minutos: 20,
    etiquetas: ['cocina:italiana', 'momento:almuerzo', 'dificultad:facil'],
    ficha: 'Una pasta de despensa: atún, tomate y ajo. La pasta integral suma fibra y el atún, proteína sin complicarse.',
    ingredientes: [
      i(PASTA_INTEGRAL, 280, '2 tazas de pasta integral cocida'),
      i(ATUN, 120, '1 lata de atún escurrido'),
      i(TOMATE, 240, '2 tomates'),
      i(AJO, 10, '2 dientes'),
      i(ESPINACA, 60, '2 tazas de espinaca'),
      i(OLIVA, 13, '1 cucharada de aceite de oliva'),
      i(PARMESANO, 12, '2 cucharadas de parmesano'),
    ],
    pasos: [
      'Sofríe el ajo en el aceite de oliva y agrega el tomate picado; cocina 8 minutos.',
      'Añade el atún y la espinaca hasta que se marchite.',
      'Mezcla con la pasta y termina con parmesano.',
    ],
  },
  {
    nombre: 'Bowl de quinoa con pollo a la peruana',
    porciones: 3,
    minutos: 30,
    etiquetas: ['cocina:peruana', 'momento:almuerzo', 'tipo:bowl', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'La quinoa viene de los Andes y tiene proteína completa. Con pollo, maíz y limón queda fresca y colorida.',
    ingredientes: [
      i(QUINOA, 555, '3 tazas de quinoa cocida'),
      i(PECHUGA, 450, '2 pechugas'),
      i(PIMENTON, 150, '1 pimentón rojo'),
      i(CEBOLLA, 110, '1 cebolla morada'),
      i(MAIZ, 100, '1 mazorca desgranada'),
      i(LIMON, 30, 'jugo de 2 limones'),
      i(ACEITE, 13, '1 cucharada'),
    ],
    pasos: [
      'Dora el pollo en tiras con sal y la mitad del aceite.',
      'Saltea el pimentón, la cebolla y el maíz 4 minutos.',
      'Mezcla con la quinoa, el pollo y el jugo de limón.',
    ],
  },

  // ——— Batidos ———
  {
    nombre: 'Batido de banano, avena y whey',
    porciones: 1,
    minutos: 5,
    etiquetas: ['tipo:batido', 'momento:post-entreno', 'batido:post-entreno', 'dificultad:facil'],
    ficha: 'El clásico después de entrenar: proteína para tus músculos y carbohidratos del banano y la avena para recuperar energía.',
    ingredientes: [
      i(LECHE_DESCREMADA, 250, '1 taza de leche'),
      i(BANANO, 100, '1 banano'),
      i(AVENA, 30, '3 cucharadas de avena'),
      i(WHEY, 30, '1 scoop de whey'),
      i(CANELA, 1, 'una pizca'),
    ],
    pasos: ['Licúa todo 30 segundos. Si te gusta frío, usa el banano congelado.'],
  },
  {
    nombre: 'Batido verde de fibra',
    porciones: 1,
    minutos: 5,
    etiquetas: ['tipo:batido', 'momento:desayuno', 'batido:fibra', 'batido:desayuno-rapido', 'dificultad:facil'],
    ficha: 'Verde pero dulce, gracias al banano. Chía, linaza y espinaca suman mucha fibra, y el yogur griego le da cremosidad y proteína.',
    ingredientes: [
      i(LECHE_ALMENDRAS, 250, '1 taza de leche de almendras'),
      i(ESPINACA, 30, '1 taza de espinaca'),
      i(BANANO, 100, '1 banano'),
      i(CHIA, 12, '1 cucharada de chía'),
      i(LINAZA, 7, '1 cucharada de linaza molida'),
      i(YOGUR_GRIEGO, 100, '⅔ de pote de yogur griego'),
    ],
    pasos: ['Licúa todo 40 segundos, hasta que no queden pedacitos de espinaca.'],
  },
  {
    nombre: 'Batido de fresa y yogur griego',
    porciones: 1,
    minutos: 5,
    etiquetas: ['tipo:batido', 'momento:desayuno', 'batido:desayuno-rapido', 'dificultad:facil'],
    ficha: 'Rosado, fresco y rápido. El yogur griego trae proteína y las fresas, vitamina C.',
    ingredientes: [
      i(LECHE, 200, '1 vaso de leche'),
      i(FRESA, 150, '1 taza de fresas'),
      i(YOGUR_GRIEGO, 170, '1 pote de yogur griego'),
      i(AVENA, 20, '2 cucharadas de avena'),
      i(MIEL, 10, '½ cucharada de miel'),
    ],
    pasos: ['Licúa todo hasta que quede cremoso.'],
  },
  {
    nombre: 'Batido de cacao y maní (para días sin hambre)',
    porciones: 1,
    minutos: 5,
    etiquetas: ['tipo:batido', 'momento:merienda', 'batido:sin-hambre', 'dificultad:facil'],
    ficha: 'Para esos días en que comer cuesta: se toma fácil, sabe a postre y en un vaso trae mucha proteína y energía.',
    ingredientes: [
      i(LECHE, 250, '1 taza de leche'),
      i(WHEY, 30, '1 scoop de whey'),
      i(CACAO, 5, '1 cucharada de cacao'),
      i(MANI, 16, '1 cucharada de mantequilla de maní'),
      i(BANANO, 50, '½ banano'),
    ],
    pasos: ['Licúa todo con hielo si lo quieres bien frío.'],
  },
  {
    nombre: 'Batido de papaya, avena y linaza',
    porciones: 1,
    minutos: 5,
    etiquetas: ['tipo:batido', 'momento:desayuno', 'batido:fibra', 'batido:desayuno-rapido', 'dificultad:facil'],
    ficha: 'Suave para la mañana. La papaya trae vitamina C y la avena con linaza suman fibra que te acompaña hasta el almuerzo.',
    ingredientes: [
      i(PAPAYA, 200, '1½ taza de papaya'),
      i(LECHE, 200, '1 vaso de leche'),
      i(AVENA, 30, '3 cucharadas de avena'),
      i(LINAZA, 7, '1 cucharada de linaza molida'),
    ],
    pasos: ['Licúa todo 30 segundos.'],
  },
  {
    nombre: 'Batido de arándanos y cottage',
    porciones: 1,
    minutos: 5,
    etiquetas: ['tipo:batido', 'momento:post-entreno', 'batido:post-entreno', 'dificultad:facil'],
    ficha: 'Morado y cremoso. El queso cottage aporta proteína de forma suave y los arándanos, color y antioxidantes.',
    ingredientes: [
      i(LECHE, 200, '1 vaso de leche'),
      i(ARANDANOS, 100, '⅔ taza de arándanos'),
      i(COTTAGE, 113, '½ taza de queso cottage'),
      i(AVENA, 20, '2 cucharadas de avena'),
    ],
    pasos: ['Licúa todo hasta que quede liso.'],
  },

  // ——— Snacks, postres y salsas ———
  {
    nombre: 'Pudín de chía con mango',
    porciones: 2,
    minutos: 5,
    etiquetas: ['cocina:otra', 'momento:merienda', 'tipo:postre', 'tipo:meal-prep', 'dificultad:facil'],
    ficha: 'Se prepara en 5 minutos y la nevera hace el resto. La chía se hidrata y forma un pudín lleno de fibra.',
    ingredientes: [
      i(CHIA, 36, '3 cucharadas de chía'),
      i(LECHE, 300, '1¼ taza de leche'),
      i(MANGO, 200, '1 mango'),
      i(MIEL, 10, '½ cucharada de miel'),
    ],
    pasos: [
      'Mezcla la chía con la leche y la miel, y revuelve bien.',
      'Deja en la nevera mínimo 4 horas (o toda la noche).',
      'Sirve con el mango en cubos.',
    ],
  },
  {
    nombre: 'Hummus con palitos de verdura',
    porciones: 2,
    minutos: 10,
    etiquetas: ['cocina:mediterránea', 'momento:merienda', 'tipo:snack', 'dificultad:facil'],
    ficha: 'Una merienda crujiente para picar sin culpa ni prisa. El hummus trae proteína y fibra del garbanzo.',
    ingredientes: [
      i(HUMMUS, 120, '8 cucharadas de hummus'),
      i(ZANAHORIA, 140, '2 zanahorias'),
      i(PEPINO, 200, '1 pepino'),
    ],
    pasos: ['Corta la zanahoria y el pepino en bastones y sirve con el hummus.'],
  },
  {
    nombre: 'Yogur griego con fruta y semillas',
    porciones: 1,
    minutos: 5,
    etiquetas: ['cocina:otra', 'momento:desayuno', 'momento:merienda', 'tipo:snack', 'dificultad:facil'],
    ficha: 'Un bowl bonito para cualquier hora: proteína del yogur, dulce de la fruta y un toque crujiente de semillas.',
    ingredientes: [
      i(YOGUR_GRIEGO, 170, '1 pote de yogur griego'),
      i(FRESA, 100, '⅔ taza de fresas'),
      i(AVENA, 20, '2 cucharadas de avena'),
      i(PEPITAS, 9, '1 cucharada de semillas de calabaza'),
      i(MIEL, 10, '½ cucharada de miel'),
    ],
    pasos: ['Sirve el yogur y ponle encima la fruta, la avena, las semillas y la miel.'],
  },
  {
    nombre: 'Salsa de yogur y hierbas',
    porciones: 4,
    minutos: 5,
    etiquetas: ['cocina:mediterránea', 'tipo:salsa', 'dificultad:facil'],
    ficha: 'Una salsa fresca para pollo, pescado, ensaladas o papas. Más ligera que la mayonesa y con proteína del yogur.',
    ingredientes: [
      i(YOGUR, 170, '1 pote de yogur natural'),
      i(AJO, 5, '1 diente'),
      i(LIMON, 15, 'jugo de ½ limón'),
      i(PEREJIL, 10, 'un puñado de perejil'),
      i(OLIVA, 13, '1 cucharada de aceite de oliva'),
    ],
    pasos: ['Pica fino el perejil y el ajo, y mezcla todo con sal. Dura 3 días en la nevera.'],
  },
]

/** Versión del recetario inicial: si cambia, se agregan las recetas nuevas. */
export const VERSION_RECETARIO = 1

export const RECETAS_INICIALES: Receta[] = SEMILLAS.map((s, n) => ({
  ...s,
  id: `ini-${String(n + 1).padStart(2, '0')}`,
  fuente: 'Recetario inicial de Combi Rutinas',
}))
