import { describe, expect, it } from 'vitest'
import { ALIMENTOS_BASE } from '../datos/alimentos'
import { RECETAS_INICIALES } from '../datos/recetas-iniciales'
import { crearBuscador } from './buscar'
import { calcularItem, gastoEstimado, progreso, resumirDia } from './diario'
import { nutricionReceta, nutrientesVacios } from './nutricion'
import { interpretarTexto } from './texto-comida'
import type { RegistroComida } from './tipos'

const porId = new Map(ALIMENTOS_BASE.map((a) => [a.id, a]))
const recetas = new Map(RECETAS_INICIALES.map((r) => [r.id, r]))
const buscar = crearBuscador(ALIMENTOS_BASE)

describe('lo que se comió', () => {
  it('calcula un alimento por gramos', () => {
    const c = calcularItem({ tipo: 'alimento', alimentoId: 'taco-489', gramos: 100 }, porId, recetas)
    expect(c?.nombre).toBe('Huevo crudo')
    expect(c?.n.proteina).toBeCloseTo(porId.get('taco-489')!.n.proteina as number, 5)
  })

  it('calcula porciones de una receta', () => {
    const r = RECETAS_INICIALES[6]
    const c = calcularItem({ tipo: 'receta', recetaId: r.id, porciones: 1.5 }, porId, recetas)
    expect(c?.n.proteina).toBeCloseTo((nutricionReceta(r, porId).porPorcion.proteina as number) * 1.5, 5)
  })

  it('devuelve null si el alimento o la receta ya no existen', () => {
    expect(calcularItem({ tipo: 'receta', recetaId: 'no', porciones: 1 }, porId, recetas)).toBeNull()
  })
})

describe('resumen del día', () => {
  const reg = (momento: RegistroComida['momento'], proteina: number | null, fibra: number | null): RegistroComida => ({
    id: Math.random().toString(),
    fecha: '2026-11-27',
    momento,
    item: { tipo: 'alimento', alimentoId: 'x', gramos: 1 },
    nombre: 'x',
    n: { ...nutrientesVacios(), proteina, fibra },
    incompletos: fibra === null ? ['fibra'] : [],
    creado: '',
  })

  it('suma el día y por comida', () => {
    const r = resumirDia([reg('desayuno', 20, 5), reg('almuerzo', 35, 10), reg('desayuno', 10, null)])
    expect(r.total.proteina).toBe(65)
    expect(r.total.fibra).toBe(15)
    expect(r.incompletos.has('fibra')).toBe(true)
    expect(r.porMomento.get('desayuno')?.proteina).toBe(30)
  })

  it('un día vacío no rompe', () => {
    expect(resumirDia([]).total.proteina).toBeNull()
  })

  it('el progreso puede pasar de la meta sin problema', () => {
    expect(progreso(120, 100)).toBe(1.2)
    expect(progreso(null, 100)).toBe(0)
  })
})

describe('gasto estimado (Mifflin-St Jeor)', () => {
  it('mujer, 25 años, 157 cm, 65 kg, moderada', () => {
    // 10×65 + 6,25×157 − 5×25 − 161 = 1345,25 → ×1,55
    const g = gastoEstimado({ sexo: 'mujer', pesoKg: 65, alturaCm: 157, edad: 25, actividad: 'moderada' })
    expect(g.basal).toBe(1345)
    expect(g.total).toBe(2085)
  })
})

describe('registrar por texto', () => {
  it('entiende "dos huevos y una tajada de pan en el desayuno"', () => {
    const r = interpretarTexto('Dos huevos y una tajada de pan en el desayuno', buscar)
    expect(r.momento).toBe('desayuno')
    expect(r.partes).toHaveLength(2)
    // En el diario se prefiere el huevo cocido (no el crudo): es lo que uno se come.
    expect(r.partes[0].alimento?.id).toBe('taco-488')
    expect(r.partes[0].gramos).toBe(100)
    expect(r.partes[1].alimento?.porciones.some((p) => p.nombre === '1 tajada')).toBe(true)
    expect(r.partes[1].gramos).toBe(25)
  })

  it('entiende gramos y unidades pegadas', () => {
    const r = interpretarTexto('200 g de arroz, 150g de feijão', buscar)
    expect(r.partes[0].gramos).toBe(200)
    expect(r.partes[0].alimento?.alias.join(' ')).toMatch(/arroz/i)
    expect(r.partes[1].gramos).toBe(150)
  })

  it('entiende la cantidad al final y quita "bowl de"', () => {
    const r = interpretarTexto('bowl de quinoa cocida 150 g', buscar)
    expect(r.partes[0].alimento?.id).toBe('usda-168917')
    expect(r.partes[0].gramos).toBe(150)
    expect(r.partes[0].seguro).toBe(true)
  })

  it('entiende porciones con nombre: "1 scoop de whey"', () => {
    const r = interpretarTexto('1 scoop de whey', buscar)
    expect(r.partes[0].alimento?.id).toBe('usda-173180')
    expect(r.partes[0].gramos).toBe(30)
  })

  it('"medio aguacate" usa la porción de ½', () => {
    const r = interpretarTexto('medio aguacate', buscar)
    expect(r.partes[0].alimento?.id).toBe('taco-163')
    expect(r.partes[0].gramos).toBe(100)
  })

  it('si no sabe la cantidad, propone 100 g y lo marca para revisar', () => {
    const r = interpretarTexto('rúcula', buscar)
    expect(r.partes[0].seguro).toBe(false)
  })

  it('frases naturales: "hoy almorcé arroz con pollo y ensalada"', () => {
    const r = interpretarTexto('Hoy almorcé arroz con pollo y ensalada', buscar)
    expect(r.momento).toBe('almuerzo')
    expect(r.partes.map((p) => p.alimento?.id)).toEqual([
      'taco-3', // arroz blanco cocido (no el crudo)
      expect.stringMatching(/^taco-/),
      'taco-161', // ensalada de tomate
    ])
    // El pollo se busca cocido/asado, no crudo.
    expect(r.partes[1].alimento?.alias[0]).not.toMatch(/crud/i)
  })

  it('el poke: "me comí un bowl de quinoa con pollo teriyaki, rúcula y piña"', () => {
    const r = interpretarTexto('Me comí un bowl de quinoa con pollo teriyaki, rúcula y piña', buscar)
    expect(r.partes.map((p) => p.alimento?.alias[0] ?? null)).toEqual([
      'Quinoa cocida',
      expect.stringMatching(/pollo/i),
      'Rúgula cruda',
      'Piña',
    ])
    // "pollo teriyaki" no existe: usó "pollo" y lo marca para revisar.
    expect(r.partes[1].aproximado).toBe(true)
  })

  it('la frase de Lau: "3 cucharadas de arroz, ensalada, 2 pedazos de carne de cerdo."', () => {
    const r = interpretarTexto('3 cucharadas de arroz, ensalada, 2 pedazos de carne de cerdo.', buscar)
    expect(r.partes).toHaveLength(3)
    expect(r.partes[0].alimento?.id).toBe('taco-3')
    expect(r.partes[0].gramos).toBe(75)
    expect(r.partes[1].alimento?.id).toBe('taco-161')
    expect(r.partes[1].gramos).toBe(100)
    expect(r.partes[1].seguro).toBe(true)
    expect(r.partes[2].alimento?.alias[0]).toMatch(/cerdo/i) // cerdo, no res
    expect(r.partes[2].gramos).toBe(160) // 2 pedazos × 80 g
    expect(r.partes[2].seguro).toBe(true)
    // Sin sugerencias absurdas: todas comparten alguna palabra con lo que escribiste.
    expect(r.partes[1].alternativas.every((a) => /ensalada|salada/i.test(a.alias.join(' ') + a.nombre))).toBe(true)
  })

  it('medidas con la mano: "carne de cerdo del tamaño de mi mano"', () => {
    const r = interpretarTexto('carne de cerdo del tamaño de mi mano', buscar)
    expect(r.partes[0].alimento?.alias[0]).toMatch(/cerdo/i)
    expect(r.partes[0].mano).toBe('palma')
    expect(r.partes[0].gramos).toBe(100)
  })

  it('"un puño de arroz" ≈ 1 taza; "dos palmas de pollo"; "un puñado de maní"; "un pulgar de mantequilla"', () => {
    const r = interpretarTexto('un puño de arroz, dos palmas de pollo, un puñado de maní y un pulgar de mantequilla', buscar)
    expect(r.partes.map((p) => [p.mano, p.gramos])).toEqual([
      ['puno', 160],
      ['palma', 200],
      ['punado', 30],
      ['pulgar', 13],
    ])
  })

  it('el desayuno de Lau: "desayuné huevos revueltos con chirizo y un pan"', () => {
    const r = interpretarTexto('desayuné huevos revueltos con chirizo y un pan', buscar)
    expect(r.momento).toBe('desayuno')
    expect(r.partes.map((p) => p.alimento?.alias[0])).toEqual(['Huevo revuelto', 'Chorizo de cerdo a la plancha', 'Pan francés'])
    expect(r.partes[0].gramos).toBe(110) // "huevos" en plural sin número → 2, para revisar
    expect(r.partes[0].seguro).toBe(false)
    expect(r.partes[1].gramos).toBe(55) // 1 chorizo
  })

  it('comidas de todos los días que antes fallaban', () => {
    const uno = (t: string) => interpretarTexto(t, buscar).partes[0]
    expect(uno('2 tajadas de pan de molde').alimento?.alias[0]).toBe('Pan blanco de molde')
    expect(uno('2 tajadas de pan de molde').gramos).toBe(50)
    expect(uno('1 tajada de pan forma').alimento?.alias[0]).toBe('Pan blanco de molde')
    expect(uno('pasta').alimento?.alias[0]).toBe('Pasta cocida')
    expect(uno('salchicha').alimento?.alias[0]).toBe('Salchicha')
    expect(uno('tostadas').alimento?.alias[0]).toBe('Tostada de pan francés')
    expect(uno('patacones').alimento?.alias[0]).toBe('Patacones')
    expect(uno('plátano maduro frito').alimento?.alias[0]).toBe('Plátano maduro frito')
    expect(uno('una arepa').alimento?.alias[0]).toBe('Arepa (de harina precocida)')
    expect(uno('una arepa').gramos).toBe(40)
    expect(uno('granola').alimento?.alias[0]).toBe('Granola')
    expect(uno('atún en agua').alimento?.alias[0]).toBe('Atún en agua (lata)')
    expect(uno('un pancito').alimento?.alias[0]).toBe('Pan francés')
  })

  it('"2 trozos de yuca" sin porción "trozo": estima y lo marca para revisar', () => {
    const r = interpretarTexto('2 trozos de lentejas', buscar)
    expect(r.partes[0].seguro).toBe(false)
    expect(r.partes[0].gramos).toBeGreaterThan(0)
  })

  it('"feijão" es el carioca (el de todos los días en Brasil)', () => {
    expect(interpretarTexto('feijão', buscar).partes[0].alimento?.id).toBe('taco-561')
  })

  it('texto vacío o sin sentido: no rompe', () => {
    expect(interpretarTexto('', buscar).partes).toEqual([])
    const r = interpretarTexto('xyzqw', buscar)
    expect(r.partes[0]?.alimento ?? null).toBeNull()
  })
})
