import { describe, expect, it } from 'vitest'
import { nutrientesVacios } from './nutricion'
import { codigoValido, mapearOFF } from './openfoodfacts'
import { cambio, diasEntre, masRicosEn, promedios, serieDe } from './progreso'
import type { Alimento, Medida, RegistroComida } from './tipos'

const m = (fecha: string, tipo: Medida['tipo'], valor: number, id = fecha + tipo + valor): Medida => ({ id, fecha, tipo, valor })

describe('medidas', () => {
  const medidas = [m('2026-11-20', 'cintura', 80), m('2026-11-01', 'cintura', 82), m('2026-11-20', 'cintura', 79.5, 'x'), m('2026-11-10', 'peso', 65)]

  it('ordena por fecha y deja la última del mismo día', () => {
    expect(serieDe(medidas, 'cintura')).toEqual([
      { fecha: '2026-11-01', valor: 82 },
      { fecha: '2026-11-20', valor: 79.5 },
    ])
  })

  it('calcula el cambio desde la primera medida', () => {
    expect(cambio(serieDe(medidas, 'cintura'))).toEqual({ desde: '2026-11-01', diferencia: -2.5 })
    expect(cambio(serieDe(medidas, 'peso'))).toBeNull()
  })
})

describe('días y promedios', () => {
  const reg = (fecha: string, proteina: number): RegistroComida => ({
    id: fecha + proteina,
    fecha,
    momento: 'almuerzo',
    item: { tipo: 'alimento', alimentoId: 'x', gramos: 1 },
    nombre: 'x',
    n: { ...nutrientesVacios(), proteina, fibra: 5, kcal: 500 },
    incompletos: [],
    creado: '',
  })
  const dias = diasEntre(
    '2026-11-24',
    '2026-11-27',
    [reg('2026-11-24', 60), reg('2026-11-24', 30), reg('2026-11-26', 100)],
    [{ id: 'w', fecha: '2026-11-24', ml: 2000, creado: '' }],
  )

  it('arma un día por fecha, incluso sin registros', () => {
    expect(dias.map((d) => d.fecha)).toEqual(['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'])
    expect(dias[0].proteina).toBe(90)
    expect(dias[1].conComidas).toBe(false)
  })

  it('promedia solo los días con registro (un día sin anotar no es un día sin comer)', () => {
    const p = promedios(dias)
    expect(p.diasConRegistro).toBe(2)
    expect(p.proteina).toBe(95)
    expect(p.aguaMl).toBe(2000)
  })

  it('sin registros, los promedios son "sin dato"', () => {
    expect(promedios(diasEntre('2026-11-01', '2026-11-02', [], [])).proteina).toBeNull()
  })
})

describe('buscador por nutriente', () => {
  const a = (id: string, fibra: number | null): Alimento => ({
    id,
    nombre: id,
    alias: [],
    categoria: 'otros',
    fuente: 'TACO',
    n: { ...nutrientesVacios(), fibra },
    porciones: [],
  })
  it('primero lo que hay en casa, luego el resto; ignora "sin dato" y ceros', () => {
    const r = masRicosEn([a('chia', 34), a('avena', 9), a('lentejas', 8), a('pollo', 0), a('miel', null)], 'fibra', new Set(['lentejas']))
    expect(r.map((x) => x.alimento.id)).toEqual(['lentejas', 'chia', 'avena'])
    expect(r[0].enCasa).toBe(true)
  })
})

describe('Open Food Facts', () => {
  it('valida códigos de barras', () => {
    expect(codigoValido('7891000100103')).toBe(true)
    expect(codigoValido('12345')).toBe(false)
  })

  it('convierte unidades: minerales de g a mg, kJ a kcal si falta kcal', () => {
    const p = mapearOFF({
      status: 1,
      product: {
        product_name: 'Iogurte natural',
        brands: 'Marca X, Otra',
        serving_quantity: 170,
        serving_size: '170 g',
        nutriments: { 'energy-kj_100g': 251, proteins_100g: 4, 'sodium_100g': 0.05, 'calcium_100g': 0.14, fiber_100g: '' },
      },
    })
    expect(p?.nombre).toBe('Iogurte natural')
    expect(p?.marca).toBe('Marca X')
    expect(p?.n.kcal).toBe(60)
    expect(p?.n.sodio).toBe(50)
    expect(p?.n.calcio).toBe(140)
    expect(p?.n.fibra).toBeNull()
    expect(p?.porcion).toEqual({ nombre: '1 porción (170 g)', gramos: 170 })
  })

  it('producto no encontrado → null', () => {
    expect(mapearOFF({ status: 0 })).toBeNull()
    expect(mapearOFF(null)).toBeNull()
  })
})
