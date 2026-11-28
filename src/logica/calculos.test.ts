import { describe, expect, it } from 'vitest'
import { ALIMENTOS_BASE, ALIMENTOS_TACO, ALIMENTOS_USDA } from '../datos/alimentos'
import { descontarDeAlacena } from './alacena'
import { buscarParecidos, crearBuscador } from './buscar'
import { calcularDisponibilidad } from './disponibilidad'
import { escalarIngredientes, factorPorciones } from './escalar'
import { sugerirEtiquetas } from './etiquetas'
import { carbohidratosNetos, nutricionReceta, nutrientesDe, nutrientesVacios, sumarNutrientes } from './nutricion'
import { normalizar } from './texto'
import type { IngredienteReceta, ItemAlacena, Nutrientes } from './tipos'
import { aGramos, describirCantidad, enPorciones, formatearGramos, nombrePorcion } from './unidades'
import { diasHasta, textoVencimiento } from './fechas'
import { metaAgua, PERFIL_POR_DEFECTO } from '../db/perfil'

const porId = new Map(ALIMENTOS_TACO.map((a) => [a.id, a]))
const HUEVO = 'taco-489'
const ARROZ = 'taco-3'
const FRIJOL = 'taco-561'
const SAL = 'usda-173468'
const ACEITE = 'usda-171411'

describe('base de alimentos TACO', () => {
  it('trae los 597 alimentos con nombres en español donde los hay', () => {
    expect(ALIMENTOS_TACO).toHaveLength(597)
    expect(porId.get(HUEVO)?.alias[0]).toBe('Huevo crudo')
    expect(porId.get(FRIJOL)?.nombre).toBe('Feijão, carioca, cozido')
  })

  it('deja en null lo que no tiene dato (nunca 0)', () => {
    // El café (infusión) no tiene dato de fibra en TACO.
    expect(porId.get('taco-471')?.n.fibra).toBeNull()
  })

  it('pone fibra 0 en alimentos de origen animal (TACO la marca como "no aplica")', () => {
    expect(porId.get(HUEVO)?.n.fibra).toBe(0)
  })
})

describe('alimentos extra del USDA', () => {
  it('trae los 28 alimentos que faltan o están incompletos en TACO, con nombre en español y porciones', () => {
    expect(ALIMENTOS_USDA).toHaveLength(28)
    for (const a of ALIMENTOS_USDA) {
      expect(a.alias.length).toBeGreaterThan(0)
      expect(a.porciones.length).toBeGreaterThan(0)
      expect(a.n.kcal).not.toBeNull()
    }
  })

  it('la chía tiene sus valores del USDA', () => {
    const chia = ALIMENTOS_USDA.find((a) => a.id === 'usda-170554')
    expect(chia?.alias[0]).toBe('Chía')
    expect(chia?.n.fibra).toBe(34.4)
  })

  it('no repite ids entre TACO y USDA', () => {
    const ids = ALIMENTOS_BASE.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('conversión de unidades', () => {
  it('pasa porciones a gramos', () => {
    expect(aGramos(2, { nombre: '1 huevo', gramos: 50 })).toBe(100)
    expect(aGramos(1.5, { nombre: '1 cucharada', gramos: 12 })).toBe(18)
  })

  it('sin porción, la cantidad ya son gramos', () => {
    expect(aGramos(120)).toBe(120)
  })

  it('cantidades raras (0, negativas, vacías) cuentan como 0', () => {
    expect(aGramos(0, { nombre: '1 huevo', gramos: 50 })).toBe(0)
    expect(aGramos(-3)).toBe(0)
    expect(aGramos(Number.NaN)).toBe(0)
  })

  it('muestra gramos y ml de forma legible', () => {
    expect(formatearGramos(120)).toBe('120 g')
    expect(formatearGramos(1500)).toBe('1,5 kg')
    expect(formatearGramos(200, true)).toBe('200 ml')
  })

  it('nombra porciones en plural de forma natural', () => {
    expect(nombrePorcion('1 huevo', 8)).toBe('8 huevos')
    expect(nombrePorcion('1 cucharón', 10)).toBe('10 cucharones')
    expect(nombrePorcion('1 banano mediano', 5)).toBe('5 bananos medianos')
    expect(nombrePorcion('1 huevo de codorniz', 3)).toBe('3 huevos de codorniz')
    expect(nombrePorcion('1 taza', 0.5)).toBe('½ taza')
    expect(nombrePorcion('½ taza', 10)).toBe('5 tazas')
    expect(nombrePorcion('½ taza', 1)).toBe('½ taza')
    expect(nombrePorcion('¼ taza', 2)).toBe('½ taza')
    expect(nombrePorcion('1 lata escurrida', 1)).toBe('1 lata escurrida')
  })

  it('describe la cantidad con porciones solo si es un número redondo y pequeño', () => {
    const huevo = [{ nombre: '1 huevo', gramos: 50 }]
    expect(describirCantidad(400, huevo)).toBe('8 huevos · 400 g')
    expect(describirCantidad(2000, [{ nombre: '1 taza', gramos: 160 }])).toBe('2 kg')
    expect(describirCantidad(130, huevo)).toBe('130 g')
  })

  it('reconoce cantidades redondas de una porción', () => {
    const r = enPorciones(100, [{ nombre: '1 huevo', gramos: 50 }])
    expect(r?.cantidad).toBe(2)
    expect(enPorciones(73, [{ nombre: '1 huevo', gramos: 50 }])).toBeNull()
  })
})

describe('cálculo nutricional', () => {
  it('escala por 100 g', () => {
    const n = nutrientesDe({ n: { ...nutrientesVacios(), proteina: 10, fibra: null } }, 250)
    expect(n.proteina).toBe(25)
    expect(n.fibra).toBeNull()
  })

  it('suma marcando como incompleto lo que le falta a algún ingrediente', () => {
    const a: Nutrientes = { ...nutrientesVacios(), proteina: 5, fibra: 2 }
    const b: Nutrientes = { ...nutrientesVacios(), proteina: 3, fibra: null }
    const { total, incompletos } = sumarNutrientes([a, b])
    expect(total.proteina).toBe(8)
    expect(total.fibra).toBe(2)
    expect(incompletos.has('fibra')).toBe(true)
    expect(incompletos.has('proteina')).toBe(false)
    expect(total.vitaminaC).toBeNull() // nadie lo tiene → sin dato
  })

  it('calcula total y por porción de una receta con datos TACO', () => {
    const r = nutricionReceta(
      {
        porciones: 2,
        ingredientes: [
          { alimentoId: FRIJOL, gramos: 200, texto: '' }, // 4,8 g prot/100 g
          { alimentoId: HUEVO, gramos: 100, texto: '2 huevos' }, // 13 g prot/100 g
        ],
      },
      porId,
    )
    const protEsperada = 4.8 * 2 + (porId.get(HUEVO)!.n.proteina as number)
    expect(r.total.proteina).toBeCloseTo(protEsperada, 5)
    expect(r.porPorcion.proteina).toBeCloseTo(protEsperada / 2, 5)
    expect(r.total.fibra).toBeCloseTo(8.5 * 2, 5)
  })

  it('una receta sin ingredientes no rompe: todo sin dato', () => {
    const r = nutricionReceta({ porciones: 1, ingredientes: [] }, porId)
    expect(r.total.kcal).toBeNull()
    expect(r.porPorcion.proteina).toBeNull()
  })

  it('avisa si un ingrediente no existe en la base', () => {
    const r = nutricionReceta({ porciones: 1, ingredientes: [{ alimentoId: 'no-existe', gramos: 50, texto: '' }] }, porId)
    expect(r.sinAlimento).toEqual(['no-existe'])
  })

  it('carbohidratos netos = carbohidratos − fibra', () => {
    expect(carbohidratosNetos({ carbohidratos: 20, fibra: 8 })).toBe(12)
    expect(carbohidratosNetos({ carbohidratos: 20, fibra: null })).toBeNull()
  })
})

describe('etiquetas sugeridas', () => {
  it('sigue las reglas de proteína, fibra y carbohidratos netos', () => {
    const n: Nutrientes = { ...nutrientesVacios(), proteina: 24, fibra: 7, carbohidratos: 20 }
    expect(sugerirEtiquetas(n)).toEqual(['alta-en-proteina', 'alta-en-fibra', 'baja-en-carbohidratos'])
  })

  it('no sugiere si falta el dato', () => {
    expect(sugerirEtiquetas(nutrientesVacios())).toEqual([])
  })
})

describe('escalado de porciones', () => {
  const receta = { porciones: 2, ingredientes: [{ alimentoId: ARROZ, gramos: 160, texto: '1 taza' }] }

  it('escala de 2 a 3 porciones', () => {
    expect(factorPorciones(2, 3)).toBe(1.5)
    expect(escalarIngredientes(receta, 3)[0].gramos).toBe(240)
  })

  it('con porciones inválidas no cambia nada', () => {
    expect(escalarIngredientes(receta, 0)[0].gramos).toBe(160)
  })

  it('no modifica la receta original', () => {
    escalarIngredientes(receta, 4)
    expect(receta.ingredientes[0].gramos).toBe(160)
  })
})

describe('disponibilidad según la alacena', () => {
  const ingredientes: IngredienteReceta[] = [
    { alimentoId: FRIJOL, gramos: 300, texto: '' },
    { alimentoId: ARROZ, gramos: 200, texto: '' },
    { alimentoId: HUEVO, gramos: 100, texto: '2 huevos' },
    { alimentoId: SAL, gramos: 3, texto: 'al gusto' },
  ]
  const basicos = new Set([SAL, ACEITE])

  it('marca tengo / poco / falta y no cuenta los básicos', () => {
    const alacena: ItemAlacena[] = [
      { id: '1', alimentoId: FRIJOL, gramos: 1000 },
      { id: '2', alimentoId: ARROZ, gramos: 150 },
    ]
    const d = calcularDisponibilidad(ingredientes, alacena, basicos)
    expect(d.total).toBe(3)
    expect(d.tengo).toBe(1)
    const est = Object.fromEntries(d.detalle.map((x) => [x.alimentoId, x]))
    expect(est[FRIJOL].estado).toBe('tengo')
    expect(est[ARROZ].estado).toBe('poco')
    expect(est[ARROZ].faltan).toBe(50)
    expect(est[HUEVO].estado).toBe('falta')
    expect(est[SAL].estado).toBe('basico')
    expect(d.completa).toBe(false)
  })

  it('suma varias compras del mismo alimento', () => {
    const alacena: ItemAlacena[] = [
      { id: '1', alimentoId: HUEVO, gramos: 50 },
      { id: '2', alimentoId: HUEVO, gramos: 50 },
    ]
    const d = calcularDisponibilidad([{ alimentoId: HUEVO, gramos: 100, texto: '' }], alacena, basicos)
    expect(d.completa).toBe(true)
    expect(d.porcentaje).toBe(100)
  })

  it('con la alacena vacía, falta todo (menos los básicos)', () => {
    const d = calcularDisponibilidad(ingredientes, [], basicos)
    expect(d.tengo).toBe(0)
    expect(d.porcentaje).toBe(0)
    expect(d.faltantes).toBe(3)
  })

  it('una receta solo con básicos se puede cocinar', () => {
    const d = calcularDisponibilidad([{ alimentoId: SAL, gramos: 2, texto: '' }], [], basicos)
    expect(d.completa).toBe(true)
  })

  it('un ingrediente "al gusto" (0 g) se cumple con tener algo', () => {
    const d = calcularDisponibilidad(
      [{ alimentoId: ARROZ, gramos: 0, texto: 'al gusto' }],
      [{ id: '1', alimentoId: ARROZ, gramos: 10 }],
      basicos,
    )
    expect(d.completa).toBe(true)
  })
})

describe('descuento de la alacena al cocinar', () => {
  const basicos = new Set([SAL])

  it('descuenta, gasta primero lo que vence antes y saca lo que llega a 0', () => {
    const alacena: ItemAlacena[] = [
      { id: 'nuevo', alimentoId: HUEVO, gramos: 300, venceEl: '2026-12-20' },
      { id: 'viejo', alimentoId: HUEVO, gramos: 100, venceEl: '2026-12-01' },
      { id: 'sal', alimentoId: SAL, gramos: 500 },
    ]
    const { alacena: nueva, resumen } = descontarDeAlacena(
      alacena,
      [
        { alimentoId: HUEVO, gramos: 150, texto: '3 huevos' },
        { alimentoId: SAL, gramos: 3, texto: '' },
      ],
      basicos,
    )
    expect(nueva.find((i) => i.id === 'viejo')).toBeUndefined()
    expect(nueva.find((i) => i.id === 'nuevo')?.gramos).toBe(250)
    expect(nueva.find((i) => i.id === 'sal')?.gramos).toBe(500) // los básicos no se tocan
    expect(resumen).toEqual([{ alimentoId: HUEVO, pedido: 150, descontado: 150, noHabia: 0 }])
  })

  it('si no alcanza, descuenta lo que hay y avisa cuánto no había', () => {
    const { alacena, resumen } = descontarDeAlacena(
      [{ id: '1', alimentoId: ARROZ, gramos: 100 }],
      [{ alimentoId: ARROZ, gramos: 160, texto: '' }],
      basicos,
    )
    expect(alacena).toEqual([])
    expect(resumen[0].descontado).toBe(100)
    expect(resumen[0].noHabia).toBe(60)
  })

  it('no modifica la alacena original', () => {
    const original: ItemAlacena[] = [{ id: '1', alimentoId: ARROZ, gramos: 100 }]
    descontarDeAlacena(original, [{ alimentoId: ARROZ, gramos: 50, texto: '' }], basicos)
    expect(original[0].gramos).toBe(100)
  })
})

describe('metas', () => {
  it('meta de agua automática: 35 ml por kg', () => {
    expect(metaAgua(PERFIL_POR_DEFECTO)).toBe(2275)
    expect(metaAgua({ ...PERFIL_POR_DEFECTO, metaAguaMl: 2000 })).toBe(2000)
  })
})

describe('fechas de vencimiento', () => {
  it('cuenta días entre fechas sin líos de horario', () => {
    expect(diasHasta('2026-11-28', '2026-11-26')).toBe(2)
    expect(diasHasta('2026-11-25', '2026-11-26')).toBe(-1)
    expect(diasHasta('2027-01-01', '2026-12-31')).toBe(1)
  })

  it('dice el vencimiento con palabras amables', () => {
    expect(textoVencimiento(0)).toBe('vence hoy')
    expect(textoVencimiento(1)).toBe('mañana')
    expect(textoVencimiento(3)).toBe('en 3 días')
    expect(textoVencimiento(-2)).toBe('venció hace 2 días')
  })
})

describe('búsqueda de alimentos', () => {
  const buscar = crearBuscador(ALIMENTOS_BASE)

  it('encuentra preparaciones comunes: "huevo revuelto", "pollo a la plancha"', () => {
    expect(buscar('Huevo revuelto')[0].id).toBe('taco-490')
    expect(buscar('pollo a la plancha')[0].id).toBe('taco-410')
  })

  it('encuentra palabras en cualquier orden: "pollo plancha"', () => {
    expect(buscar('pollo plancha').map((a) => a.id)).toContain('taco-410')
  })

  it('si no hay nada, propone lo más parecido con menos palabras', () => {
    const r = buscarParecidos(buscar, 'huevo con salsa inventada xyz')
    expect(r?.consulta).toMatch(/^huevo/)
    expect(r?.resultados.length).toBeGreaterThan(0)
    const r2 = buscarParecidos(buscar, 'arepa de chócolo rellena')
    expect(r2?.resultados.length).toBeGreaterThan(0)
  })

  it('pone primero el nombre más simple', () => {
    expect(buscar('huevo')[0].id).toBe(HUEVO)
  })

  it('encuentra los extras del USDA (chía, whey)', () => {
    expect(buscar('chia')[0].id).toBe('usda-170554')
    expect(buscar('whey')[0].id).toBe('usda-173180')
  })

  it('ignora tildes y mayúsculas', () => {
    expect(normalizar('Plátano')).toBe('platano')
    expect(buscar('platano')[0].id).toBe('taco-175')
    expect(buscar('PLÁTANO')[0].id).toBe('taco-175')
  })

  it('encuentra en español o en portugués', () => {
    const porEsp = buscar('frijol').map((a) => a.id)
    const porPor = buscar('feijão').map((a) => a.id)
    expect(porEsp).toContain(FRIJOL)
    expect(porPor).toContain(FRIJOL)
  })

  it('tolera pequeños errores al escribir', () => {
    expect(buscar('aguacte').map((a) => a.id)).toContain('taco-163')
  })

  it('una búsqueda vacía no devuelve nada', () => {
    expect(buscar('   ')).toEqual([])
  })
})
