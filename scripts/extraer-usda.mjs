// Extrae de la tabla USDA "SR Legacy" (FoodData Central, abril 2018) solo los alimentos
// que TACO no trae y que usa la app.
//
// Uso: node scripts/extraer-usda.mjs <carpeta descomprimida de FoodData_Central_sr_legacy_food_csv_2018-04>
// Descarga: https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip
// Licencia: dominio público (gobierno de EE. UU.).
import { readFileSync, writeFileSync, createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const carpeta = process.argv[2]
if (!carpeta) {
  console.error('Falta la carpeta de USDA. Uso: node scripts/extraer-usda.mjs <carpeta>')
  process.exit(1)
}
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const salida = join(raiz, 'src', 'datos', 'alimentos-usda.json')

// fdc_id elegidos: se leen de src/datos/extras-usda.ts (ahí están los nombres en español y las porciones),
// así la lista vive en un solo lugar.
const IDS = new Set([...readFileSync(join(raiz, 'src', 'datos', 'extras-usda.ts'), 'utf8').matchAll(/^ {2}'(\d+)': \{/gm)].map((m) => m[1]))

// Número de nutriente USDA → campo de la app.
const NUTRIENTES = {
  1008: 'kcal',
  1003: 'proteina',
  1005: 'carbohidratos',
  1079: 'fibra',
  1004: 'grasa',
  1258: 'grasaSaturada',
  1093: 'sodio',
  1087: 'calcio',
  1089: 'hierro',
  1092: 'potasio',
  1162: 'vitaminaC',
  1106: 'vitaminaA', // µg RAE
}

const campos = (linea) => linea.slice(1, -1).split('","')

// Descripciones originales.
const descripciones = new Map()
for (const linea of readFileSync(join(carpeta, 'food.csv'), 'utf8').split(/\r?\n/).slice(1)) {
  if (!linea) continue
  const [id, , desc] = campos(linea)
  if (IDS.has(id)) descripciones.set(id, desc)
}

// Valores (el archivo es grande: se lee línea por línea).
const valores = new Map([...IDS].map((id) => [id, Object.fromEntries(Object.values(NUTRIENTES).map((k) => [k, null]))]))
const lector = createInterface({ input: createReadStream(join(carpeta, 'food_nutrient.csv')) })
for await (const linea of lector) {
  const [, fdc, nutriente, cantidad] = campos(linea)
  if (!IDS.has(fdc)) continue
  const campo = NUTRIENTES[nutriente]
  if (!campo) continue
  const n = Number(cantidad)
  valores.get(fdc)[campo] = Number.isFinite(n) ? n : null
}

const resultado = [...IDS].map((id) => ({ id: `usda-${id}`, nombre: descripciones.get(id) ?? id, fuente: 'USDA', n: valores.get(id) }))
const faltan = resultado.filter((r) => r.nombre === r.id.replace('usda-', ''))
if (faltan.length) console.warn('No encontrados:', faltan.map((f) => f.id))
writeFileSync(salida, JSON.stringify(resultado, null, 1) + '\n')
console.log(`Listo: ${resultado.length} alimentos USDA → ${salida}`)
