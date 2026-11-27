import { describe, expect, it } from 'vitest'
import {
  clavePrecio,
  formatearPrecio,
  leerPrecio,
  precioSugerido,
  sugerirCompras,
  terminarCompra,
  totalLista,
} from './mercado'
import type { ItemMercado, Receta } from './tipos'

const receta = (id: string, nombre: string, porciones: number, ings: [string, number][]): Receta => ({
  id,
  nombre,
  porciones,
  minutos: 10,
  ingredientes: ings.map(([alimentoId, gramos]) => ({ alimentoId, gramos, texto: '' })),
  pasos: [],
  ficha: '',
  etiquetas: [],
})

const item = (x: Partial<ItemMercado>): ItemMercado => ({
  id: x.id ?? 'm',
  tipo: 'alimento',
  comprado: false,
  motivo: 'manual',
  creado: '2026-11-27',
  ...x,
})

describe('sugerencias del mercado', () => {
  const recetas = new Map([
    ['r1', receta('r1', 'Omelete', 1, [['huevo', 150], ['espinaca', 60], ['sal', 2]])],
    ['r2', receta('r2', 'Crepioca', 1, [['huevo', 100], ['tapioca', 30]])],
  ])
  const base = {
    alacena: [{ id: 'a', alimentoId: 'huevo', gramos: 100 }],
    basicos: new Set(['sal']),
    recetas,
    minimos: {},
    acabados: [],
    lista: [],
  }

  it('suma lo que piden varias recetas y resta lo que hay', () => {
    const s = sugerirCompras({ ...base, planeadas: [{ recetaId: 'r1', porciones: 1 }, { recetaId: 'r2', porciones: 1 }] })
    const huevo = s.find((x) => x.alimentoId === 'huevo')
    expect(huevo?.gramos).toBe(150) // 250 pedidos − 100 que hay
    expect(huevo?.detalle).toBe('para Omelete, Crepioca')
    expect(s.find((x) => x.alimentoId === 'sal')).toBeUndefined() // básico
  })

  it('escala por porciones planeadas', () => {
    const s = sugerirCompras({ ...base, alacena: [], planeadas: [{ recetaId: 'r2', porciones: 2 }] })
    expect(s.find((x) => x.alimentoId === 'tapioca')?.gramos).toBe(60)
  })

  it('no repite lo que ya está en la lista', () => {
    const s = sugerirCompras({
      ...base,
      planeadas: [{ recetaId: 'r2', porciones: 1 }],
      lista: [item({ alimentoId: 'tapioca', gramos: 500 })],
    })
    expect(s.find((x) => x.alimentoId === 'tapioca')).toBeUndefined()
  })

  it('sugiere completar el mínimo "siempre en casa"', () => {
    const s = sugerirCompras({ ...base, planeadas: [], minimos: { huevo: 300 } })
    expect(s).toEqual([{ alimentoId: 'huevo', gramos: 200, motivo: 'minimo', detalle: 'por debajo de tu mínimo' }])
  })

  it('sugiere lo que se acabó, si sigue sin haber', () => {
    const s = sugerirCompras({ ...base, planeadas: [], acabados: ['avena', 'huevo'] })
    expect(s.map((x) => x.alimentoId)).toEqual(['avena'])
  })

  it('cada alimento aparece una sola vez (gana la receta)', () => {
    const s = sugerirCompras({ ...base, alacena: [], planeadas: [{ recetaId: 'r2', porciones: 1 }], minimos: { huevo: 600 }, acabados: ['huevo'] })
    expect(s.filter((x) => x.alimentoId === 'huevo')).toHaveLength(1)
    expect(s.find((x) => x.alimentoId === 'huevo')?.motivo).toBe('receta')
  })
})

describe('precios', () => {
  it('lee precios escritos de varias formas', () => {
    expect(leerPrecio('12,5')).toBe(12.5)
    expect(leerPrecio('R$ 7.99')).toBe(7.99)
    expect(leerPrecio('')).toBeUndefined()
    expect(leerPrecio('abc')).toBeUndefined()
  })

  it('muestra en reales', () => {
    expect(formatearPrecio(12.5).replace(/\s/g, ' ')).toBe('R$ 12,50')
  })

  it('sugiere el precio proporcional a la cantidad', () => {
    expect(precioSugerido({ clave: 'arroz', precio: 10, gramos: 500, fecha: '' }, 1000)).toBe(20)
    expect(precioSugerido({ clave: 'otro:jabon', precio: 4.5, fecha: '' })).toBe(4.5)
    expect(precioSugerido(undefined, 100)).toBeUndefined()
  })

  it('el total suma solo lo que tiene precio y avisa cuántos no', () => {
    expect(totalLista([item({ precio: 10 }), item({ precio: 2.35 }), item({})])).toEqual({ total: 12.35, sinPrecio: 1 })
  })

  it('las claves de "otros" ignoran tildes y mayúsculas', () => {
    expect(clavePrecio({ tipo: 'otro', nombre: 'Jabón ' })).toBe(clavePrecio({ tipo: 'otro', nombre: 'jabon' }))
  })
})

describe('terminar la compra', () => {
  it('lo comprado de comida pasa a la alacena; los "otros" no; guarda precios y total', () => {
    const lista = [
      item({ id: '1', alimentoId: 'huevo', gramos: 600, precio: 18, comprado: true }),
      item({ id: '2', tipo: 'otro', nombre: 'Jabón', seccion: 'aseo', precio: 4.5, comprado: true }),
      item({ id: '3', alimentoId: 'avena', gramos: 500, comprado: false }),
    ]
    const r = terminarCompra(lista, '2026-11-27')
    expect(r.nuevosEnAlacena).toEqual([{ alimentoId: 'huevo', gramos: 600, compradoEl: '2026-11-27' }])
    expect(r.total).toBe(22.5)
    expect(r.terminados).toEqual(['1', '2'])
    expect(r.precios).toEqual([
      { clave: 'huevo', precio: 18, gramos: 600, fecha: '2026-11-27' },
      { clave: 'otro:jabon', precio: 4.5, gramos: undefined, fecha: '2026-11-27' },
    ])
  })
})
