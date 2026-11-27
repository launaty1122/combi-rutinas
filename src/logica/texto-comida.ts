import type { Alimento, MomentoComida } from './tipos'
import { normalizar } from './texto'

/**
 * Entender lo que escribes (o dictas) en el diario:
 * "dos huevos y una tajada de pan en el desayuno" →
 *   [{2 huevos → Huevo, 100 g}, {1 tajada de pan → Pan integral, 25 g}], desayuno.
 * Es una propuesta: siempre se muestra para que la confirmes o la corrijas.
 */

const NUMEROS: Record<string, number> = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, medio: 0.5, media: 0.5, '½': 0.5, '¼': 0.25, cuarto: 0.25,
}

const MOMENTOS: [RegExp, MomentoComida][] = [
  // Verbos, en español y portugués: "almorcé", "desayuné", "jantei"…
  [/\b(desayune|desayunamos|cafe da manha)\b/, 'desayuno'],
  [/\b(almorce|almorzamos|almocei)\b/, 'almuerzo'],
  [/\b(cene|cenamos|jantei)\b/, 'cena'],
  [/\b(merende|lanchei)\b/, 'merienda'],
  [/\b(en el |de |para el |al )?desayuno\b/, 'desayuno'],
  [/\b(en el |de |para el |al )?almuerzo\b/, 'almuerzo'],
  [/\b(en la |de |para la |a la )?(cena|comida de la noche)\b/, 'cena'],
  [/\b(en la |de |para la |a la )?(merienda|onces|algo)\b/, 'merienda'],
]

const GRAMOS: Record<string, number> = { g: 1, gr: 1, gramo: 1, gramos: 1, ml: 1, kg: 1000, kilo: 1000, kilos: 1000, l: 1000, litro: 1000, litros: 1000 }

export interface ParteInterpretada {
  /** El pedazo de texto original ("una tajada de pan"). */
  texto: string
  cantidad: number
  unidad: string | null
  /** Alimento propuesto (puede ser null si no se encontró nada). */
  alimento: Alimento | null
  alternativas: Alimento[]
  gramos: number
  /** false si la cantidad en gramos es una suposición (conviene revisarla). */
  seguro: boolean
  /** true si no encontró el nombre completo y usó solo una parte ("pollo teriyaki" → pollo). */
  aproximado: boolean
}

export interface Interpretacion {
  partes: ParteInterpretada[]
  momento: MomentoComida | null
}

/** Palabras de la frase que no son comida: "hoy me comí…", "eu comi…". */
const RELLENO =
  /\b(hoy|ayer|anoche|hoje|ontem|me|yo|eu|comi|comimos|tome|tomei|bebi|desayune|almorce|almocei|cene|jantei|merende|lanchei|tambien|ademas|tambem)\b/g

/** En un diario casi nada se come crudo (salvo frutas y verduras): se prefiere lo cocido. */
function esCrudo(a: Alimento) {
  const n = normalizar(`${a.alias[0] ?? ''} ${a.nombre}`)
  return /\bcrud[oa]s?\b|, cru(a|s)?\b/.test(n) && !['frutas', 'verduras'].includes(a.categoria)
}

/**
 * Busca el alimento; si no aparece ("pollo teriyaki"), prueba quitando palabras del final ("pollo").
 * aproximado = true cuando tuvo que recortar.
 */
function buscarConRespaldo(nombre: string, buscar: (q: string, limite?: number) => Alimento[]) {
  const pideCrudo = /\bcrud|\bcru\b/.test(nombre)
  const palabras = nombre.split(' ')
  for (let n = palabras.length; n >= 1; n--) {
    const r = buscar(palabras.slice(0, n).join(' '), 8)
    if (r.length) {
      const ordenados = pideCrudo ? r : [...r.filter((a) => !esCrudo(a)), ...r.filter(esCrudo)]
      return { candidatos: ordenados, aproximado: n < palabras.length }
    }
  }
  return { candidatos: [] as Alimento[], aproximado: false }
}

const singular = (p: string) => p.replace(/(es|s)$/, '')

/** Busca entre las porciones del alimento una que coincida con la unidad ("tajada" ↔ "1 tajada"). */
function porcionDeUnidad(a: Alimento, unidad: string) {
  const u = singular(normalizar(unidad))
  return a.porciones.find((p) => {
    const palabra = normalizar(p.nombre).replace(/^(1|½|¼)\s+/, '').split(' ')[0]
    return singular(palabra) === u
  })
}

export function interpretarTexto(texto: string, buscar: (q: string, limite?: number) => Alimento[]): Interpretacion {
  let t = normalizar(texto).replace(/[.;:!?()¿¡"]/g, ' ')
  let momento: MomentoComida | null = null
  for (const [re, m] of MOMENTOS) {
    if (re.test(t)) {
      momento = m
      t = t.replace(re, ' ')
      break
    }
  }

  t = t.replace(RELLENO, ' ')

  const trozos = t
    .split(/,|\+|\by\b|\bcon\b|\be\b/)
    .map((x) => x.replace(/\s+/g, ' ').trim())
    .filter((x) => x.length > 1)

  const partes: ParteInterpretada[] = trozos.map((trozo) => {
    // Cantidad al final: "quinoa cocida 150 g" → "150 g de quinoa cocida".
    const alFinal = trozo.match(/^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|ml|kg)$/)
    const ordenado = alFinal ? `${alFinal[2]} ${alFinal[3]} de ${alFinal[1]}` : trozo
    const palabras = ordenado.split(' ')
    // 1. Cantidad: número ("2", "1,5", "200g") o palabra ("dos", "media").
    let cantidad = 1
    let i = 0
    let unidad: string | null = null
    const pegado = palabras[0]?.match(/^(\d+(?:[.,]\d+)?)([a-z]+)?$/)
    if (pegado) {
      cantidad = Number(pegado[1].replace(',', '.'))
      if (pegado[2]) unidad = pegado[2]
      i = 1
    } else if (palabras[0] && NUMEROS[palabras[0]] !== undefined) {
      cantidad = NUMEROS[palabras[0]]
      i = 1
      if (palabras[0] === 'un' && palabras[1] === 'cuarto') {
        cantidad = 0.25
        i = 2
      }
    }
    // 2. Unidad: "g", "tajada", "taza"… seguida de "de".
    if (!unidad && palabras[i + 1] === 'de' && palabras[i]) {
      unidad = palabras[i]
      i += 2
    } else if (!unidad && palabras[i] && GRAMOS[palabras[i]] !== undefined) {
      unidad = palabras[i]
      i += 1
      if (palabras[i] === 'de') i += 1
    } else if (unidad && palabras[i] === 'de') {
      i += 1
    }
    // Palabras de "recipiente" que no son el alimento: "bowl de quinoa" → "quinoa".
    const nombre = palabras
      .slice(i)
      .join(' ')
      .replace(/^(de|del|la|el|los|las)\s+/, '')
      .replace(/^(bowl|plato|porcion|poco|poquito)\s+(de\s+)?/, '')

    // 3. Alimento: entre los resultados, se prefiere uno que tenga esa unidad como porción.
    const { candidatos, aproximado } = nombre
      ? buscarConRespaldo(nombre, buscar)
      : { candidatos: [] as Alimento[], aproximado: false }
    const conUnidad = unidad && GRAMOS[unidad] === undefined ? candidatos.find((a) => porcionDeUnidad(a, unidad as string)) : undefined
    const alimento = conUnidad ?? candidatos[0] ?? null

    // 4. Gramos.
    let gramos = 100
    let seguro = false
    if (alimento) {
      if (unidad && GRAMOS[unidad] !== undefined) {
        gramos = cantidad * GRAMOS[unidad]
        seguro = true
      } else if (unidad) {
        const p = porcionDeUnidad(alimento, unidad)
        if (p) {
          const fraccion = p.nombre.startsWith('½') ? 0.5 : p.nombre.startsWith('¼') ? 0.25 : 1
          gramos = (cantidad * p.gramos) / fraccion
          seguro = true
        }
      } else if (alimento.porciones[0]) {
        const p = alimento.porciones[0]
        const fraccion = p.nombre.startsWith('½') ? 0.5 : p.nombre.startsWith('¼') ? 0.25 : 1
        gramos = (cantidad * p.gramos) / fraccion
        seguro = true
      } else {
        gramos = cantidad * 100
      }
    }
    return {
      texto: trozo,
      cantidad,
      unidad,
      alimento,
      alternativas: candidatos.filter((a) => a !== alimento).slice(0, 4),
      gramos: Math.round(gramos * 10) / 10,
      seguro,
      aproximado,
    }
  })

  return { partes, momento }
}
