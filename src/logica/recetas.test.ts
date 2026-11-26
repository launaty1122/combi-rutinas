import { describe, expect, it } from 'vitest'
import { ALIMENTOS_BASE } from '../datos/alimentos'
import { NOMBRE_ETIQUETA } from '../datos/etiquetas'
import { RECETAS_INICIALES } from '../datos/recetas-iniciales'
import { calcularDisponibilidad, type Disponibilidad } from './disponibilidad'
import { filtrarRecetas, objetivoDe, cumpleTiempo, type RecetaConDatos } from './filtros'
import { nutricionReceta } from './nutricion'
import type { Receta } from './tipos'

const porId = new Map(ALIMENTOS_BASE.map((a) => [a.id, a]))

describe('recetario inicial', () => {
  it('tiene unas 30 recetas, con al menos 6 batidos y varias rápidas', () => {
    expect(RECETAS_INICIALES.length).toBeGreaterThanOrEqual(30)
    expect(RECETAS_INICIALES.filter((r) => r.etiquetas.includes('tipo:batido')).length).toBeGreaterThanOrEqual(6)
    expect(RECETAS_INICIALES.filter((r) => r.minutos < 20).length).toBeGreaterThanOrEqual(8)
    for (const c of ['cocina:colombiana', 'cocina:brasileña', 'cocina:japonesa']) {
      expect(RECETAS_INICIALES.some((r) => r.etiquetas.includes(c))).toBe(true)
    }
  })

  it('todos los ingredientes existen en la base de alimentos', () => {
    const faltan = RECETAS_INICIALES.flatMap((r) =>
      r.ingredientes.filter((i) => !porId.has(i.alimentoId)).map((i) => `${r.nombre}: ${i.alimentoId}`),
    )
    expect(faltan).toEqual([])
  })

  it('todas las etiquetas son conocidas y todo tiene textico y pasos', () => {
    for (const r of RECETAS_INICIALES) {
      for (const e of r.etiquetas) expect(NOMBRE_ETIQUETA.has(e), `${r.nombre}: ${e}`).toBe(true)
      expect(r.ficha.length).toBeGreaterThan(40)
      expect(r.pasos.length).toBeGreaterThan(0)
    }
  })

  it('ninguna receta queda con calorías o proteína incompletas', () => {
    for (const r of RECETAS_INICIALES) {
      const { incompletos } = nutricionReceta(r, porId)
      expect(incompletos.has('kcal'), r.nombre).toBe(false)
      expect(incompletos.has('proteina'), r.nombre).toBe(false)
    }
  })

  it('las recetas que prometen "mucha proteína" la tienen (≥ 20 g por porción)', () => {
    for (const r of RECETAS_INICIALES.filter((x) => /mucha proteína/i.test(x.ficha))) {
      const n = nutricionReceta(r, porId)
      expect(n.porPorcion.proteina, r.nombre).toBeGreaterThanOrEqual(20)
    }
  })

  it('las que prometen "mucha fibra" la tienen (≥ 6 g por porción)', () => {
    for (const r of RECETAS_INICIALES.filter((x) => /mucha fibra|llenos? de fibra/i.test(x.ficha))) {
      const n = nutricionReceta(r, porId)
      expect(n.porPorcion.fibra, r.nombre).toBeGreaterThanOrEqual(6)
    }
  })
})

describe('filtros del recetario', () => {
  const base = (r: Partial<Receta>): Receta => ({
    id: 'x',
    nombre: 'X',
    porciones: 1,
    minutos: 10,
    ingredientes: [],
    pasos: [],
    ficha: '',
    etiquetas: [],
    ...r,
  })
  const disp = (completa: boolean, faltantes: number): Disponibilidad => ({
    detalle: [],
    tengo: 0,
    total: 0,
    porcentaje: 0,
    completa,
    faltantes,
  })
  const lista: RecetaConDatos[] = [
    { receta: base({ id: 'a', nombre: 'Crepioca', minutos: 15, etiquetas: ['cocina:brasileña', 'momento:post-entreno'] }), disponibilidad: disp(true, 0), objetivo: ['objetivo:alta-en-proteina'], nombresIngredientes: ['Huevo crudo'] },
    { receta: base({ id: 'b', nombre: 'Ajiaco', minutos: 50, etiquetas: ['cocina:colombiana'] }), disponibilidad: disp(false, 1), objetivo: [], nombresIngredientes: ['Papa'] },
    { receta: base({ id: 'c', nombre: 'Feijoada', minutos: 18, etiquetas: ['cocina:brasileña'], favorita: true }), disponibilidad: disp(false, 3), objetivo: [], nombresIngredientes: ['Frijol'] },
  ]
  const ids = (r: RecetaConDatos[]) => r.map((x) => x.receta.id)

  it('combina grupos: brasileña + post-entreno + menos de 20 min', () => {
    expect(ids(filtrarRecetas(lista, { texto: '', modo: 'todas', etiquetas: ['cocina:brasileña', 'momento:post-entreno', 'tiempo:20'] }))).toEqual(['a'])
  })

  it('dentro de un grupo suma opciones: brasileña o colombiana', () => {
    expect(ids(filtrarRecetas(lista, { texto: '', modo: 'todas', etiquetas: ['cocina:brasileña', 'cocina:colombiana'] }))).toEqual(['a', 'b', 'c'])
  })

  it('"¿Qué puedo cocinar ya?" y "Me falta 1"', () => {
    expect(ids(filtrarRecetas(lista, { texto: '', modo: 'puedo', etiquetas: [] }))).toEqual(['a'])
    expect(ids(filtrarRecetas(lista, { texto: '', modo: 'falta1', etiquetas: [] }))).toEqual(['b'])
  })

  it('busca por nombre o por ingrediente, sin tildes', () => {
    expect(ids(filtrarRecetas(lista, { texto: 'ajíaco', modo: 'todas', etiquetas: [] }))).toEqual(['b'])
    expect(ids(filtrarRecetas(lista, { texto: 'huevo', modo: 'todas', etiquetas: [] }))).toEqual(['a'])
  })

  it('filtra favoritas y objetivo', () => {
    expect(ids(filtrarRecetas(lista, { texto: '', modo: 'todas', etiquetas: ['favoritas'] }))).toEqual(['c'])
    expect(ids(filtrarRecetas(lista, { texto: '', modo: 'todas', etiquetas: ['objetivo:alta-en-proteina'] }))).toEqual(['a'])
  })

  it('tiempos: "cocina rápido" es menos de 20 min', () => {
    expect(cumpleTiempo(19, 'tiempo:20')).toBe(true)
    expect(cumpleTiempo(20, 'tiempo:20')).toBe(false)
    expect(cumpleTiempo(45, 'tiempo:elaborada')).toBe(true)
  })

  it('el objetivo corregido a mano gana sobre el sugerido', () => {
    const n = nutricionReceta(RECETAS_INICIALES[5], porId).porPorcion
    expect(objetivoDe({ objetivo: ['objetivo:alta-en-fibra'] }, n)).toEqual(['objetivo:alta-en-fibra'])
    expect(objetivoDe({}, n).length).toBeGreaterThan(0)
  })

  it('una receta sin ingredientes que cuenten aparece como lista para cocinar', () => {
    expect(calcularDisponibilidad([], [], new Set()).completa).toBe(true)
  })
})
