# Alimentos extra del USDA

Alimentos que la tabla TACO no trae: chía, whey, quinoa, mantequilla de maní, yogur griego, etc.

**Fuente:** U.S. Department of Agriculture, Agricultural Research Service. *FoodData Central – SR Legacy* (abril 2018).
https://fdc.nal.usda.gov/ — **dominio público**.

Archivo descargado: `FoodData_Central_sr_legacy_food_csv_2018-04.zip` (6 MB), desde
https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip

El zip **no** se guarda en el proyecto (es grande y solo se usan 21 alimentos). Para regenerar
`src/datos/alimentos-usda.json`: descarga y descomprime el zip, y corre

```bash
node scripts/extraer-usda.mjs "<carpeta descomprimida>"
```

| fdc_id | Descripción USDA | Nombre en la app |
| --- | --- | --- |
| 170554 | Seeds, chia seeds, dried | Chía |
| 173180 | Beverages, Protein powder whey based | Proteína whey (polvo) |
| 168917 | Quinoa, cooked | Quinoa cocida |
| 168874 | Quinoa, uncooked | Quinoa cruda |
| 174266 | Peanut butter, smooth style, with salt | Mantequilla de maní |
| 171304 | Yogurt, Greek, plain, whole milk | Yogur griego natural |
| 170894 | Yogurt, Greek, plain, nonfat | Yogur griego descremado |
| 168922 | Cornmeal, degermed, enriched, white | Harina de maíz precocida (arepas)* |
| 169593 | Cocoa, dry powder, unsweetened | Cacao en polvo sin azúcar |
| 171320 | Spices, cinnamon, ground | Canela molida |
| 174832 | Beverages, almond milk, unsweetened, shelf stable | Leche de almendras sin azúcar |
| 172182 | Cheese, cottage, lowfat, 2% milkfat | Queso cottage |
| 173757 | Chickpeas, mature seeds, cooked, boiled, without salt | Garbanzos cocidos |
| 175036 | Tortillas, ready-to-bake or -fry, corn | Tortilla de maíz |
| 170562 | Seeds, sunflower seed kernels, dried | Semillas de girasol |
| 170556 | Seeds, pumpkin and squash seed kernels, dried | Semillas de calabaza |
| 168411 | Edamame, frozen, prepared | Edamame cocido |
| 171711 | Blueberries, raw | Arándanos |
| 171412 | Oil, coconut | Aceite de coco |
| 168910 | Pasta, whole-wheat, cooked | Pasta integral cocida |
| 174289 | Hummus, commercial | Hummus |

\* El USDA no tiene "harina precocida para arepas"; se usa la harina de maíz blanca desgerminada, que es la más parecida. Los valores son aproximados.

Nota: los datos de "whey" son de un polvo de proteína genérico. Cada marca es distinta: si quieres exactitud, crea tu whey como alimento personalizado con la tabla de su empaque.

## Agregados después (comidas de todos los días)

Leches y aceites (TACO no trae sus macros): 171265, 171269, 171411, 171413, 172336, 171025 y sal 173468.
Pan blanco de molde 174924, pasta cocida 169737, salchicha 172968, salchicha de pollo 171624,
plátano maduro frito 168200, patacones 168199, plátano maduro asado 169131, tortilla de trigo 167535,
granola 171646, atún en agua 173709, jamón tajado 173864.
