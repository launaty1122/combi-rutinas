# Formato para importar recetas

Combi Rutinas puede importar recetas escritas en **JSON**, un formato de texto que las apps entienden. No hace falta escribirlo a mano: lo arma una IA (Claude, ChatGPT…).

## La forma fácil

1. En la app: **Recetas → Importar → "Copiar instrucciones para IA"**. Se copian estas reglas, listas para pegar.
2. Abre tu chat de IA, pega las instrucciones y debajo pega la receta: el texto de la descripción de TikTok, tus notas desordenadas o capturas de pantalla.
3. Copia el JSON que te devuelva la IA.
4. En la app: **Recetas → Importar**, pégalo y toca **Revisar**.
5. Si algún ingrediente no coincide con un alimento de la app, te pide elegirlo entre sugerencias o buscarlo. Después, **Guardar**.

## Las reglas

| Campo | Qué es | Obligatorio |
| --- | --- | --- |
| `nombre` | Nombre de la receta | Sí |
| `porciones` | Cuántas porciones rinde (número) | Sí |
| `minutos` | Tiempo total aproximado (número) | Sí |
| `ingredientes` | Lista de ingredientes (ver abajo) | Sí |
| `pasos` | Lista de pasos, en orden | Sí |
| `ficha` | 1–2 frases cálidas: qué es y qué aporta | No |
| `etiquetas` | Lista de etiquetas válidas (ver abajo) | No |
| `fuente` | De dónde salió ("TikTok de @…") | No |

Cada ingrediente:

| Campo | Qué es | Obligatorio |
| --- | --- | --- |
| `alimento` | Nombre simple en español: "huevo", "arroz blanco cocido", "pechuga de pollo cruda" | Sí |
| `gramos` | Cantidad para **toda** la receta, en gramos (ml si es líquido) | Sí |
| `texto` | Cómo se dice en la receta: "2 huevos", "1 cucharada" | No |
| `alimentoId` | Id exacto del alimento en la app (`taco-489`, `usda-170554`). Casi nunca hace falta | No |

- No incluyas el agua.
- Las cantidades caseras se convierten a gramos aproximados (1 huevo ≈ 50 g, 1 cucharada de chía ≈ 12 g, 1 taza de arroz cocido ≈ 160 g).
- En `ficha`, nada de promesas médicas ("quema grasa", "desinflama", "cura").
- Se puede importar una receta sola o una lista de recetas: `[ {…}, {…} ]`.

### Etiquetas válidas

- **Cocina:** `cocina:colombiana`, `cocina:brasileña`, `cocina:japonesa`, `cocina:mexicana`, `cocina:mediterránea`, `cocina:peruana`, `cocina:india`, `cocina:italiana`, `cocina:otra`
- **Momento:** `momento:desayuno`, `momento:almuerzo`, `momento:cena`, `momento:merienda`, `momento:pre-entreno`, `momento:post-entreno`
- **Tipo:** `tipo:batido`, `tipo:ensalada`, `tipo:sopa`, `tipo:bowl`, `tipo:snack`, `tipo:postre`, `tipo:salsa`, `tipo:meal-prep`
- **Batidos para…:** `batido:post-entreno`, `batido:desayuno-rapido`, `batido:fibra`, `batido:sin-hambre`
- **Dificultad:** `dificultad:facil`, `dificultad:media`

Las categorías que crees en la app también valen; el botón "Copiar instrucciones para IA" siempre incluye la lista actualizada. Las etiquetas de **tiempo** y de **objetivo** (alta en proteína, alta en fibra, baja en carbohidratos) las calcula la app sola.

## Ejemplo completo

```json
{
  "nombre": "Crepioca de pollo y queso",
  "porciones": 1,
  "minutos": 15,
  "ficha": "Mitad crepe, mitad tapioca: queda suave por dentro y doradita por fuera. Con pollo y requeijão es un desayuno con mucha proteína.",
  "etiquetas": [
    "cocina:brasileña",
    "momento:desayuno",
    "dificultad:facil"
  ],
  "fuente": "TikTok de @ejemplo",
  "ingredientes": [
    {
      "alimento": "huevo",
      "gramos": 100,
      "texto": "2 huevos"
    },
    {
      "alimento": "goma de tapioca",
      "gramos": 30,
      "texto": "2 cucharadas"
    },
    {
      "alimento": "pechuga de pollo cocida",
      "gramos": 60,
      "texto": "½ taza desmechada"
    },
    {
      "alimento": "requeijão",
      "gramos": 20,
      "texto": "1 cucharada"
    }
  ],
  "pasos": [
    "Bate los huevos con la goma de tapioca y una pizca de sal.",
    "Vierte en una sartén antiadherente caliente y tapa 2 minutos.",
    "Voltéala, pon el pollo y el requeijão en una mitad y dóblala."
  ]
}
```
