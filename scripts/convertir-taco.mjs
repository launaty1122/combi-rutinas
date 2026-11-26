// Convierte los CSV de la tabla TACO (datos-fuente/taco) al formato de la app.
// Uso: node scripts/convertir-taco.mjs
//
// Fuente: TACO – Tabela Brasileira de Composição de Alimentos, 4ª ed. (NEPA/UNICAMP, 2011).
// CSV normalizados por el proyecto taco-api (github.com/raulfdm/taco-api, licencia MIT):
//   "NA" (no aplica / sin dato) → vacío  → aquí queda null ("sin dato")
//   "Tr" (trazas)               → 0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const fuente = join(raiz, 'datos-fuente', 'taco')
const salida = join(raiz, 'src', 'datos', 'alimentos-taco.json')

// Lector de CSV sencillo que respeta comillas.
function leerCsv(nombre) {
  const texto = readFileSync(join(fuente, nombre), 'utf8').replace(/^﻿/, '')
  const filas = []
  let fila = []
  let campo = ''
  let enComillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (enComillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') enComillas = false
      else campo += c
    } else if (c === '"') enComillas = true
    else if (c === ',') { fila.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      fila.push(campo); filas.push(fila); fila = []; campo = ''
    } else campo += c
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila) }
  const [cabecera, ...datos] = filas.filter((f) => f.some((v) => v.trim() !== ''))
  return datos.map((f) => Object.fromEntries(cabecera.map((k, j) => [k.trim(), (f[j] ?? '').trim()])))
}

// Vacío → null (sin dato). Nunca convertimos "sin dato" en 0.
function num(v) {
  if (v === undefined || v === null || v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// Categorías TACO → categorías de la alacena.
const CATEGORIAS = {
  1: 'granos',
  2: 'verduras',
  3: 'frutas',
  4: 'grasas',
  5: 'proteinas',
  6: 'proteinas',
  7: 'lacteos',
  8: 'bebidas',
  9: 'proteinas',
  10: 'dulces',
  11: 'otros',
  12: 'otros',
  13: 'preparados',
  14: 'legumbres',
  15: 'semillas',
}

const alimentos = leerCsv('food.csv')
const nutrientes = new Map(leerCsv('nutrients.csv').map((n) => [n.foodId, n]))
const grasas = new Map(leerCsv('fatty-acids.csv').map((g) => [g.foodId, g]))

// Categorías TACO de origen animal o grasas puras: no tienen fibra dietética.
// TACO marca su fibra como "NA" (no aplica); aquí la dejamos en 0, porque es un
// cero real y no un dato que falte. Así un huevo no deja "incompleta" la fibra de una receta.
const SIN_FIBRA = new Set(['4', '5', '6', '7', '9'])

const resultado = alimentos.map((a) => {
  const n = nutrientes.get(a.id) ?? {}
  const g = grasas.get(a.id) ?? {}
  const fibra = num(n.dietaryFiber) ?? (SIN_FIBRA.has(a.categoryId) ? 0 : null)
  return {
    id: `taco-${a.id}`,
    nombre: a.name.replace(/\s+/g, ' ').trim(),
    categoria: CATEGORIAS[a.categoryId] ?? 'otros',
    fuente: 'TACO',
    // Todo por cada 100 g (o 100 ml en bebidas).
    n: {
      kcal: num(n.kcal),
      proteina: num(n.protein),
      carbohidratos: num(n.carbohydrates),
      fibra,
      grasa: num(n.lipids),
      grasaSaturada: num(g.saturated),
      sodio: num(n.sodium),
      calcio: num(n.calcium),
      hierro: num(n.iron),
      potasio: num(n.potassium),
      vitaminaC: num(n.vitaminC),
      // Vitamina A en µg RAE (equivalentes de actividad de retinol).
      vitaminaA: num(n.rae),
    },
  }
})

mkdirSync(dirname(salida), { recursive: true })
writeFileSync(salida, JSON.stringify(resultado) + '\n')
console.log(`Listo: ${resultado.length} alimentos → ${salida}`)
