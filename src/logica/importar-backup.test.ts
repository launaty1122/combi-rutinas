import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALIMENTOS_BASE } from '../datos/alimentos'
import { GRUPOS_ETIQUETAS } from '../datos/etiquetas'
import { EJEMPLO_RECETA, instruccionesParaIA } from '../datos/instrucciones-ia'
import { crearBackup, leerBackup, nombreArchivoBackup } from './backup'
import { crearBuscador } from './buscar'
import { construirReceta, emparejarIngrediente, validarRecetasJSON } from './importar'
import { aPor100, crearAlimentoPersonal, leerNumero } from './personales'

const conocidas = new Set(GRUPOS_ETIQUETAS.flatMap((g) => g.opciones.map((o) => o.id)))
const porId = new Map(ALIMENTOS_BASE.map((a) => [a.id, a]))
const buscar = crearBuscador(ALIMENTOS_BASE)

describe('importar recetas en JSON', () => {
  it('el ejemplo de docs/formato-receta.md es válido e igual al de la app', () => {
    const doc = readFileSync(join(__dirname, '../../docs/formato-receta.md'), 'utf8')
    const bloque = doc.match(/```json\n([\s\S]*?)```/)?.[1] ?? ''
    expect(JSON.parse(bloque)).toEqual(EJEMPLO_RECETA)
    const r = validarRecetasJSON(bloque, conocidas)
    expect(r.errores).toEqual([])
    expect(r.recetas).toHaveLength(1)
  })

  it('las etiquetas del documento son exactamente las de la app', () => {
    const doc = readFileSync(join(__dirname, '../../docs/formato-receta.md'), 'utf8')
    const enDoc = new Set([...doc.matchAll(/`([a-z-]+:[a-záéíóúñ-]+)`/g)].map((m) => m[1]))
    expect(enDoc).toEqual(conocidas)
  })

  it('las instrucciones para IA incluyen el ejemplo y las etiquetas', () => {
    const t = instruccionesParaIA([...conocidas])
    expect(t).toContain('"nombre": "Crepioca de pollo y queso"')
    expect(t).toContain('cocina:brasileña')
  })

  it('acepta el JSON envuelto en ```json … ``` (como lo devuelve una IA)', () => {
    const r = validarRecetasJSON('Aquí está:\n```json\n' + JSON.stringify(EJEMPLO_RECETA) + '\n```', conocidas)
    expect(r.errores).toEqual([])
  })

  it('acepta una lista de recetas', () => {
    const r = validarRecetasJSON(JSON.stringify([EJEMPLO_RECETA, EJEMPLO_RECETA]), conocidas)
    expect(r.recetas).toHaveLength(2)
  })

  it('JSON mal formado: error claro, sin romperse', () => {
    const r = validarRecetasJSON('{ "nombre": "a", ', conocidas)
    expect(r.recetas).toEqual([])
    expect(r.errores[0]).toMatch(/no es un JSON válido/)
  })

  it('explica qué falta', () => {
    const r = validarRecetasJSON(JSON.stringify({ nombre: 'X', porciones: 0, ingredientes: [{ alimento: 'huevo' }], pasos: [] }), conocidas)
    expect(r.errores[0]).toMatch(/porciones/)
    expect(r.errores[0]).toMatch(/minutos/)
    expect(r.errores[0]).toMatch(/gramos/)
  })

  it('ignora etiquetas desconocidas con un aviso', () => {
    const r = validarRecetasJSON(JSON.stringify({ ...EJEMPLO_RECETA, etiquetas: ['cocina:brasileña', 'inventada'] }), conocidas)
    expect(r.recetas[0].etiquetas).toEqual(['cocina:brasileña'])
    expect(r.avisos[0]).toMatch(/inventada/)
  })

  it('empareja solo si es inequívoco; si no, sugiere', () => {
    expect(emparejarIngrediente({ alimento: 'huevo', gramos: 50 }, porId, buscar).elegido?.id).toBe('taco-489')
    const dudoso = emparejarIngrediente({ alimento: 'pollo a la plancha', gramos: 100 }, porId, buscar)
    expect(dudoso.elegido).toBeNull()
    expect(dudoso.sugerencias.length).toBeGreaterThan(0)
    expect(emparejarIngrediente({ alimento: 'x', alimentoId: 'usda-170554', gramos: 12 }, porId, buscar).elegido?.id).toBe('usda-170554')
  })

  it('construye la receta final', () => {
    const r = validarRecetasJSON(JSON.stringify(EJEMPLO_RECETA), conocidas).recetas[0]
    const elegidos = r.ingredientes.map(() => porId.get('taco-489')!)
    const receta = construirReceta(r, elegidos, 'imp-1')
    expect(receta.ingredientes[0]).toEqual({ alimentoId: 'taco-489', gramos: 100, texto: '2 huevos' })
    expect(receta.pasos).toHaveLength(3)
  })
})

describe('backup', () => {
  const datos = {
    alacena: [{ id: 'a1', alimentoId: 'taco-489', gramos: 100 }],
    alimentosPersonales: [],
    recetas: [{ id: 'r1', nombre: 'X', porciones: 1, minutos: 5, ingredientes: [], pasos: [], ficha: '', etiquetas: [] }],
    ajustes: [{ clave: 'sinCalorias', valor: true }],
    mercado: [{ id: 'm1', tipo: 'otro' as const, nombre: 'Jabón', seccion: 'aseo' as const, precio: 4.5, comprado: false, motivo: 'manual' as const, creado: '2026-11-27' }],
    precios: [{ clave: 'taco-489', precio: 18, gramos: 600, fecha: '2026-11-27' }],
    compras: [{ id: 'c1', fecha: '2026-11-27', total: 22.5, items: 2 }],
    diario: [],
    agua: [{ id: 'w1', fecha: '2026-11-27', ml: 250, creado: '' }],
    comidasGuardadas: [],
  }

  it('exporta y vuelve a leer lo mismo', () => {
    const texto = JSON.stringify(crearBackup(datos, new Date('2026-11-27T10:00:00Z')))
    const l = leerBackup(texto)
    expect(l.ok).toBe(true)
    if (l.ok) {
      expect(l.backup.datos).toEqual(datos)
      expect(l.resumen).toMatch(/1 recetas, 1 cosas en la alacena, 1 en la lista/)
    }
  })

  it('lee backups viejos (versión 1, sin mercado)', () => {
    const { mercado: _m, precios: _p, compras: _c, diario: _d, agua: _a, comidasGuardadas: _g, ...v1 } = datos
    const l = leerBackup(JSON.stringify({ app: 'combi-rutinas', version: 1, creado: '', datos: v1 }))
    expect(l.ok).toBe(true)
    if (l.ok) expect(l.backup.datos.mercado).toEqual([])
  })

  it('rechaza archivos que no son backups o están dañados, con mensaje claro', () => {
    expect(leerBackup('hola')).toMatchObject({ ok: false })
    expect(leerBackup(JSON.stringify({ app: 'otra' }))).toMatchObject({ ok: false, error: expect.stringMatching(/no es un backup/) })
    expect(leerBackup(JSON.stringify({ app: 'combi-rutinas', version: 1, datos: { alacena: [] } }))).toMatchObject({ ok: false })
    const danado = crearBackup({ ...datos, alacena: [{ id: 1 } as never] })
    expect(leerBackup(JSON.stringify(danado))).toMatchObject({ ok: false, error: expect.stringMatching(/dañados/) })
  })

  it('nombra el archivo con la fecha', () => {
    expect(nombreArchivoBackup(new Date(2026, 10, 27))).toBe('combi-rutinas-backup-2026-11-27.json')
  })
})

describe('alimentos personalizados', () => {
  it('lee números con coma y deja vacío como "sin dato"', () => {
    expect(leerNumero('12,5')).toBe(12.5)
    expect(leerNumero('')).toBeNull()
    expect(leerNumero('abc')).toBeNull()
  })

  it('convierte valores de una porción de etiqueta (30 g) a por 100 g', () => {
    const n = aPor100({ proteina: '24', kcal: '120', fibra: '' }, 30)
    expect(n.proteina).toBe(80)
    expect(n.kcal).toBe(400)
    expect(n.fibra).toBeNull()
  })

  it('crea el alimento con sus porciones válidas', () => {
    const a = crearAlimentoPersonal(
      {
        nombre: ' Whey de mi marca ',
        categoria: 'proteinas',
        gramosBase: 30,
        valores: { proteina: '24' },
        porciones: [{ nombre: '1 scoop', gramos: 30 }, { nombre: '', gramos: 10 }],
        liquido: false,
      },
      'p-1',
    )
    expect(a.nombre).toBe('Whey de mi marca')
    expect(a.fuente).toBe('personal')
    expect(a.porciones).toEqual([{ nombre: '1 scoop', gramos: 30 }])
    expect(a.n.proteina).toBe(80)
  })
})
