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
    expect(r.partes[0].alimento?.id).toBe('taco-489')
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

  it('texto vacío o sin sentido: no rompe', () => {
    expect(interpretarTexto('', buscar).partes).toEqual([])
    const r = interpretarTexto('xyzqw', buscar)
    expect(r.partes[0]?.alimento ?? null).toBeNull()
  })
})
