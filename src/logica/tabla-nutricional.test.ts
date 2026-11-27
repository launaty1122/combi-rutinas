import { describe, expect, it } from 'vitest'
import { parsearTablaNutricional } from './tabla-nutricional'

describe('tabla nutricional (texto leído por OCR)', () => {
  it('formato nuevo ANVISA: toma la columna de 100 g', () => {
    const t = `INFORMAÇÃO NUTRICIONAL
Porções por embalagem: 10
Porção: 30 g (3 colheres de sopa)
100 g 30 g %VD*
Valor energético (kcal) 380 114 6
Carboidratos totais (g) 60 18 6
Açúcares totais (g) 2,0 0,6
Açúcares adicionados (g) 0 0 0
Proteínas (g) 14 4,2 8
Gorduras totais (g) 7,0 2,1 3
Gorduras saturadas (g) 1,2 0,4 2
Gorduras trans (g) 0 0 0
Fibras alimentares (g) 9,5 2,9 12
Sódio (mg) 5 1,5 0`
    const r = parsearTablaNutricional(t)
    expect(r.base).toBe('por100')
    expect(r.gramosPorcion).toBe(30)
    expect(r.valores).toEqual({
      kcal: '380',
      carbohidratos: '60',
      proteina: '14',
      grasa: '7',
      grasaSaturada: '1,2',
      fibra: '9,5',
      sodio: '5',
    })
    expect(r.encontrados).toBe(7)
  })

  it('formato viejo: valores por porción, kcal junto a kJ', () => {
    const t = `INFORMAÇÃO NUTRICIONAL
Porção de 200 ml (1 copo)
Quantidade por porção %VD(*)
Valor energético 120 kcal = 504 kJ 6%
Carboidratos 10 g 3%
Proteínas 6,2 g 8%
Gorduras totais 6,0 g 11%
Gorduras saturadas 3,8 g 17%
Fibra alimentar 0 g 0%
Sódio 100 mg 4%
Cálcio 240 mg 24%`
    const r = parsearTablaNutricional(t)
    expect(r.base).toBe('porcion')
    expect(r.gramosPorcion).toBe(200)
    expect(r.valores.kcal).toBe('120')
    expect(r.valores.proteina).toBe('6,2')
    expect(r.valores.calcio).toBe('240')
    expect(r.valores.fibra).toBe('0')
  })

  it('corrige errores típicos del OCR (O por 0)', () => {
    const r = parsearTablaNutricional('100 g\nProteínas (g) 1O 3')
    expect(r.valores.proteina).toBe('10')
  })

  it('una foto ilegible no rompe: no encuentra nada', () => {
    const r = parsearTablaNutricional('asdf qwer ###')
    expect(r.encontrados).toBe(0)
  })
})
