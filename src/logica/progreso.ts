import { sumarDias } from './fechas'
import { sumarNutrientes } from './nutricion'
import type { Alimento, Medida, Nutriente, RegistroAgua, RegistroComida, TipoMedida } from './tipos'

export const MEDIDAS: { tipo: TipoMedida; nombre: string; unidad: string }[] = [
  { tipo: 'cintura', nombre: 'Cintura', unidad: 'cm' },
  { tipo: 'cadera', nombre: 'Cadera', unidad: 'cm' },
  { tipo: 'brazo', nombre: 'Brazo', unidad: 'cm' },
  { tipo: 'muslo', nombre: 'Muslo', unidad: 'cm' },
  { tipo: 'peso', nombre: 'Peso', unidad: 'kg' },
]

export interface Punto {
  fecha: string
  valor: number
}

/** Serie de una medida, ordenada por fecha. Si hay dos el mismo día, vale la última anotada. */
export function serieDe(medidas: Medida[], tipo: TipoMedida): Punto[] {
  const porFecha = new Map<string, number>()
  for (const m of medidas.filter((x) => x.tipo === tipo)) porFecha.set(m.fecha, m.valor)
  return [...porFecha.entries()].map(([fecha, valor]) => ({ fecha, valor })).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

/** Cambio entre la primera y la última medida (negativo = bajó). */
export function cambio(serie: Punto[]): { desde: string; diferencia: number } | null {
  if (serie.length < 2) return null
  const primero = serie[0]
  const ultimo = serie[serie.length - 1]
  return { desde: primero.fecha, diferencia: Math.round((ultimo.valor - primero.valor) * 10) / 10 }
}

export interface DiaResumen {
  fecha: string
  /** false si ese día no anotaste ninguna comida (no cuenta para los promedios de comida). */
  conComidas: boolean
  proteina: number
  fibra: number
  kcal: number
  aguaMl: number
}

/** Un resumen por día entre dos fechas (incluidas), para las gráficas. */
export function diasEntre(desde: string, hasta: string, diario: RegistroComida[], agua: RegistroAgua[]): DiaResumen[] {
  const dias: DiaResumen[] = []
  for (let f = desde; f <= hasta; f = sumarDias(f, 1)) {
    const del = diario.filter((r) => r.fecha === f)
    const t = sumarNutrientes(del.map((r) => r.n)).total
    dias.push({
      fecha: f,
      conComidas: del.length > 0,
      proteina: t.proteina ?? 0,
      fibra: t.fibra ?? 0,
      kcal: t.kcal ?? 0,
      aguaMl: agua.filter((a) => a.fecha === f).reduce((s, a) => s + a.ml, 0),
    })
  }
  return dias
}

/**
 * Promedios del periodo. Los de comida usan solo los días en que anotaste algo
 * (un día sin registro no es un día sin comer); el agua, los días con agua anotada.
 */
export function promedios(dias: DiaResumen[]) {
  const conComida = dias.filter((d) => d.conComidas)
  const conAgua = dias.filter((d) => d.aguaMl > 0)
  const prom = (xs: DiaResumen[], k: 'proteina' | 'fibra' | 'kcal' | 'aguaMl') =>
    xs.length ? Math.round((xs.reduce((s, d) => s + d[k], 0) / xs.length) * 10) / 10 : null
  return {
    diasConRegistro: conComida.length,
    proteina: prom(conComida, 'proteina'),
    fibra: prom(conComida, 'fibra'),
    kcal: prom(conComida, 'kcal'),
    aguaMl: prom(conAgua, 'aguaMl'),
  }
}

/**
 * Buscador por nutriente: los alimentos más ricos en ese nutriente (por 100 g),
 * primero los que tienes en la alacena.
 */
export function masRicosEn(
  alimentos: Alimento[],
  nutriente: Nutriente,
  enAlacena: Set<string>,
  limite = 30,
): { alimento: Alimento; valor: number; enCasa: boolean }[] {
  const conValor = alimentos
    .filter((a) => a.n[nutriente] !== null && (a.n[nutriente] as number) > 0)
    .map((a) => ({ alimento: a, valor: a.n[nutriente] as number, enCasa: enAlacena.has(a.id) }))
    .sort((a, b) => b.valor - a.valor)
  const casa = conValor.filter((x) => x.enCasa)
  const resto = conValor.filter((x) => !x.enCasa)
  return [...casa, ...resto].slice(0, limite)
}
