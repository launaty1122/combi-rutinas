import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { GRUPOS_ETIQUETAS, type GrupoEtiquetas } from '../datos/etiquetas'
import { normalizar } from '../logica/texto'
import { guardarAjuste, leerAjuste } from './ajustes'
import { db } from './db'

/** Cambios que hiciste a las categorías de recetas (se guardan en el celular). */
interface CambiosEtiquetas {
  agregadas: { grupo: string; id: string; nombre: string }[]
  renombres: Record<string, string>
  ocultas: string[]
}

const VACIO: CambiosEtiquetas = { agregadas: [], renombres: {}, ocultas: [] }
const CLAVE = 'etiquetasPersonales'

/** Une las categorías de la app con las tuyas (nuevas, renombradas, borradas). */
export function aplicarCambios(base: GrupoEtiquetas[], c: CambiosEtiquetas): GrupoEtiquetas[] {
  const ocultas = new Set(c.ocultas)
  return base.map((g) => ({
    ...g,
    opciones: [...g.opciones, ...c.agregadas.filter((a) => a.grupo === g.id).map(({ id, nombre }) => ({ id, nombre }))]
      .filter((o) => !ocultas.has(o.id))
      .map((o) => ({ ...o, nombre: c.renombres[o.id] ?? o.nombre })),
  }))
}

export function useGruposEtiquetas(): { grupos: GrupoEtiquetas[]; nombre: Map<string, string> } {
  const cambios = useLiveQuery(() => leerAjuste<CambiosEtiquetas>(CLAVE, VACIO), [], VACIO)
  return useMemo(() => {
    const grupos = aplicarCambios(GRUPOS_ETIQUETAS, cambios)
    return { grupos, nombre: new Map(grupos.flatMap((g) => g.opciones.map((o) => [o.id, o.nombre]))) }
  }, [cambios])
}

/** Todas las etiquetas válidas en este momento (para importar recetas). */
export async function etiquetasValidas(): Promise<string[]> {
  const c = await leerAjuste<CambiosEtiquetas>(CLAVE, VACIO)
  return aplicarCambios(GRUPOS_ETIQUETAS, c).flatMap((g) => g.opciones.map((o) => o.id))
}

export async function crearEtiqueta(grupo: string, nombre: string): Promise<string | null> {
  const limpio = nombre.trim()
  if (!limpio) return null
  const id = `${grupo}:${normalizar(limpio).replace(/\s+/g, '-')}`
  const c = await leerAjuste<CambiosEtiquetas>(CLAVE, VACIO)
  const existe = aplicarCambios(GRUPOS_ETIQUETAS, c).some((g) => g.opciones.some((o) => o.id === id))
  if (existe) return null
  await guardarAjuste(CLAVE, {
    ...c,
    agregadas: [...c.agregadas, { grupo, id, nombre: limpio }],
    ocultas: c.ocultas.filter((x) => x !== id),
  })
  return id
}

export async function renombrarEtiqueta(id: string, nombre: string): Promise<void> {
  const limpio = nombre.trim()
  if (!limpio) return
  const c = await leerAjuste<CambiosEtiquetas>(CLAVE, VACIO)
  await guardarAjuste(CLAVE, { ...c, renombres: { ...c.renombres, [id]: limpio } })
}

/** Borra una categoría y la quita de todas las recetas que la tenían. */
export async function borrarEtiqueta(id: string): Promise<void> {
  const c = await leerAjuste<CambiosEtiquetas>(CLAVE, VACIO)
  await db.transaction('rw', db.ajustes, db.recetas, async () => {
    await guardarAjuste(CLAVE, { ...c, ocultas: [...new Set([...c.ocultas, id])] })
    const conEtiqueta = await db.recetas.filter((r) => r.etiquetas.includes(id)).toArray()
    for (const r of conEtiqueta) await db.recetas.update(r.id, { etiquetas: r.etiquetas.filter((e) => e !== id) })
  })
}

export async function guardarEtiquetasReceta(recetaId: string, etiquetas: string[]): Promise<void> {
  await db.recetas.update(recetaId, { etiquetas })
}
