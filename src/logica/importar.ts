import type { Alimento, IngredienteReceta, Receta } from './tipos'
import { buscarParecidos } from './buscar'
import { normalizar } from './texto'
import { cantidadSegura } from './unidades'

/**
 * Formato para importar recetas (ver docs/formato-receta.md).
 * Se acepta una receta sola o una lista de recetas.
 */
export interface IngredienteImportado {
  /** Nombre del alimento como lo diría una persona ("huevo", "feijão carioca cocido"). */
  alimento: string
  /** Cantidad para la receta completa, en gramos (o ml). */
  gramos: number
  /** Cómo se muestra: "2 huevos", "1 cucharada". */
  texto?: string
  /** Opcional: id exacto del alimento en la app (taco-489, usda-170554…). */
  alimentoId?: string
}

export interface RecetaImportada {
  nombre: string
  porciones: number
  minutos: number
  ingredientes: IngredienteImportado[]
  pasos: string[]
  ficha?: string
  etiquetas?: string[]
  fuente?: string
}

export interface ResultadoValidacion {
  recetas: RecetaImportada[]
  /** Errores que impiden importar (el texto no sirve). */
  errores: string[]
  /** Avisos que no impiden importar (etiquetas desconocidas, etc.). */
  avisos: string[]
}

const esTexto = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const esNumero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** Quita los ``` de un bloque de código, por si la IA devuelve el JSON envuelto así. */
function limpiar(texto: string): string {
  const t = texto.trim()
  const bloque = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  return (bloque ? bloque[1] : t).trim()
}

/** Lee y valida el texto pegado. Nunca lanza errores: los devuelve en una lista. */
export function validarRecetasJSON(texto: string, etiquetasConocidas: Set<string>): ResultadoValidacion {
  const errores: string[] = []
  const avisos: string[] = []
  let datos: unknown
  try {
    datos = JSON.parse(limpiar(texto))
  } catch {
    return {
      recetas: [],
      errores: ['El texto no es un JSON válido. Revisa que esté completo, desde la primera { hasta la última }.'],
      avisos,
    }
  }

  const lista = Array.isArray(datos) ? datos : [datos]
  if (lista.length === 0) return { recetas: [], errores: ['La lista de recetas está vacía.'], avisos }

  const recetas: RecetaImportada[] = []
  lista.forEach((r, n) => {
    const quien = lista.length > 1 ? `Receta ${n + 1}: ` : ''
    if (typeof r !== 'object' || r === null) {
      errores.push(`${quien}no tiene el formato de una receta.`)
      return
    }
    const o = r as Record<string, unknown>
    const propios: string[] = []
    if (!esTexto(o.nombre)) propios.push('falta "nombre"')
    const porciones = esNumero(o.porciones) && o.porciones > 0 ? o.porciones : null
    if (porciones === null) propios.push('"porciones" debe ser un número mayor que 0')
    const minutos = esNumero(o.minutos) && o.minutos >= 0 ? o.minutos : null
    if (minutos === null) propios.push('"minutos" debe ser un número')
    if (!Array.isArray(o.ingredientes) || o.ingredientes.length === 0) propios.push('faltan "ingredientes"')
    if (!Array.isArray(o.pasos) || !o.pasos.every(esTexto)) propios.push('"pasos" debe ser una lista de textos')

    const ingredientes: IngredienteImportado[] = []
    if (Array.isArray(o.ingredientes)) {
      o.ingredientes.forEach((i, k) => {
        const ing = (i ?? {}) as Record<string, unknown>
        if (!esTexto(ing.alimento) && !esTexto(ing.alimentoId)) {
          propios.push(`al ingrediente ${k + 1} le falta "alimento"`)
          return
        }
        if (!esNumero(ing.gramos) || ing.gramos < 0) {
          propios.push(`el ingrediente ${k + 1} (${String(ing.alimento ?? ing.alimentoId)}) necesita "gramos" como número`)
          return
        }
        ingredientes.push({
          alimento: esTexto(ing.alimento) ? ing.alimento.trim() : String(ing.alimentoId),
          gramos: ing.gramos,
          texto: esTexto(ing.texto) ? ing.texto.trim() : undefined,
          alimentoId: esTexto(ing.alimentoId) ? ing.alimentoId.trim() : undefined,
        })
      })
    }

    const etiquetas: string[] = []
    if (Array.isArray(o.etiquetas)) {
      for (const e of o.etiquetas) {
        if (typeof e === 'string' && etiquetasConocidas.has(e.trim().toLowerCase())) etiquetas.push(e.trim().toLowerCase())
        else if (typeof e === 'string') avisos.push(`${quien}etiqueta desconocida "${e}" (se ignora).`)
      }
    }

    if (propios.length) {
      errores.push(`${quien}${propios.join('; ')}.`)
      return
    }
    recetas.push({
      nombre: (o.nombre as string).trim(),
      porciones: porciones as number,
      minutos: minutos as number,
      ingredientes,
      pasos: (o.pasos as string[]).map((p) => p.trim()),
      ficha: esTexto(o.ficha) ? o.ficha.trim() : undefined,
      etiquetas,
      fuente: esTexto(o.fuente) ? o.fuente.trim() : undefined,
    })
  })

  return { recetas: errores.length ? [] : recetas, errores, avisos }
}

export interface Coincidencia {
  /** Alimento elegido automáticamente, si la coincidencia es clara. */
  elegido: Alimento | null
  /** Sugerencias por parecido, para que la persona elija. */
  sugerencias: Alimento[]
}

/**
 * Busca el alimento de la app que corresponde a un ingrediente importado.
 * Solo elige solo cuando es inequívoco (id exacto o nombre idéntico); si no, sugiere.
 */
export function emparejarIngrediente(
  ing: IngredienteImportado,
  porId: Map<string, Alimento>,
  buscar: (q: string, limite?: number) => Alimento[],
): Coincidencia {
  if (ing.alimentoId && porId.has(ing.alimentoId)) {
    return { elegido: porId.get(ing.alimentoId) as Alimento, sugerencias: [] }
  }
  const q = normalizar(ing.alimento)
  // Si no hay nada con el nombre completo ("pollo al curry"), sugiere lo más parecido ("pollo").
  const directas = buscar(ing.alimento, 6)
  const sugerencias = directas.length ? directas : (buscarParecidos(buscar, ing.alimento, 6)?.resultados ?? [])
  const exacto = sugerencias.find((a) => a.alias.some((x) => normalizar(x) === q) || normalizar(a.nombre) === q)
  return { elegido: exacto ?? null, sugerencias }
}

/** Arma la receta final con los alimentos ya elegidos. */
export function construirReceta(
  r: RecetaImportada,
  elegidos: (Alimento | null)[],
  id: string,
): Receta {
  const ingredientes: IngredienteReceta[] = r.ingredientes.map((ing, n) => ({
    alimentoId: (elegidos[n] as Alimento).id,
    gramos: cantidadSegura(ing.gramos),
    texto: ing.texto ?? `${Math.round(ing.gramos)} g`,
  }))
  return {
    id,
    nombre: r.nombre,
    porciones: r.porciones,
    minutos: r.minutos,
    ingredientes,
    pasos: r.pasos,
    ficha: r.ficha ?? '',
    etiquetas: r.etiquetas ?? [],
    fuente: r.fuente,
  }
}
