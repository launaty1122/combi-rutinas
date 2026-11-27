import type { Alimento, ComidaGuardada, Medida, Compra, ItemAlacena, ItemMercado, PrecioGuardado, Receta, RegistroAgua, RegistroComida } from './tipos'

export const APP_BACKUP = 'combi-rutinas'
export const VERSION_BACKUP = 4

export interface DatosBackup {
  alacena: ItemAlacena[]
  alimentosPersonales: Alimento[]
  recetas: Receta[]
  ajustes: { clave: string; valor: unknown }[]
  /** Desde la versión 2 (lista del mercado). En backups de la versión 1 vienen vacías. */
  mercado: ItemMercado[]
  precios: PrecioGuardado[]
  compras: Compra[]
  /** Desde la versión 3 (diario y agua). */
  diario: RegistroComida[]
  agua: RegistroAgua[]
  comidasGuardadas: ComidaGuardada[]
  /** Desde la versión 4 (peso y medidas). */
  medidas: Medida[]
}

export interface Backup {
  app: typeof APP_BACKUP
  version: number
  creado: string
  datos: DatosBackup
}

export function crearBackup(datos: DatosBackup, ahora = new Date()): Backup {
  return { app: APP_BACKUP, version: VERSION_BACKUP, creado: ahora.toISOString(), datos }
}

/** Nombre del archivo: combi-rutinas-backup-2026-11-27.json */
export function nombreArchivoBackup(ahora = new Date()): string {
  const f = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`
  return `combi-rutinas-backup-${f}.json`
}

export type LecturaBackup = { ok: true; backup: Backup; resumen: string } | { ok: false; error: string }

/** Lee un archivo de backup y revisa que sea de esta app y que esté completo. */
export function leerBackup(texto: string): LecturaBackup {
  let o: unknown
  try {
    o = JSON.parse(texto)
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido. ¿Es el archivo de backup de Combi Rutinas?' }
  }
  const b = o as Partial<Backup>
  if (!b || b.app !== APP_BACKUP) return { ok: false, error: 'Este archivo no es un backup de Combi Rutinas.' }
  if (typeof b.version !== 'number' || b.version > VERSION_BACKUP) {
    return { ok: false, error: 'Este backup es de una versión más nueva de la app. Actualiza la app e inténtalo de nuevo.' }
  }
  const d = b.datos as Partial<DatosBackup> | undefined
  const listas = ['alacena', 'alimentosPersonales', 'recetas', 'ajustes'] as const
  if (!d || !listas.every((k) => Array.isArray(d[k]))) {
    return { ok: false, error: 'El backup está incompleto o dañado.' }
  }
  const datos: DatosBackup = {
    ...(d as DatosBackup),
    mercado: Array.isArray(d.mercado) ? d.mercado : [],
    precios: Array.isArray(d.precios) ? d.precios : [],
    compras: Array.isArray(d.compras) ? d.compras : [],
    diario: Array.isArray(d.diario) ? d.diario : [],
    agua: Array.isArray(d.agua) ? d.agua : [],
    comidasGuardadas: Array.isArray(d.comidasGuardadas) ? d.comidasGuardadas : [],
    medidas: Array.isArray(d.medidas) ? d.medidas : [],
  }
  const malos =
    datos.alacena.some((i) => typeof i?.id !== 'string' || typeof i?.alimentoId !== 'string' || typeof i?.gramos !== 'number') ||
    datos.recetas.some((r) => typeof r?.id !== 'string' || typeof r?.nombre !== 'string' || !Array.isArray(r?.ingredientes)) ||
    datos.alimentosPersonales.some((a) => typeof a?.id !== 'string' || typeof a?.n !== 'object') ||
    datos.ajustes.some((a) => typeof a?.clave !== 'string') ||
    datos.mercado.some((m) => typeof m?.id !== 'string' || (m?.tipo !== 'alimento' && m?.tipo !== 'otro')) ||
    datos.diario.some((r) => typeof r?.id !== 'string' || typeof r?.fecha !== 'string' || typeof r?.n !== 'object') ||
    datos.agua.some((a) => typeof a?.id !== 'string' || typeof a?.ml !== 'number') ||
    datos.medidas.some((m) => typeof m?.id !== 'string' || typeof m?.valor !== 'number')
  if (malos) return { ok: false, error: 'El backup tiene datos dañados. No se importó nada.' }

  const resumen = `${datos.recetas.length} recetas, ${datos.alacena.length} cosas en la alacena, ${datos.mercado.length} en la lista del mercado, ${datos.alimentosPersonales.length} alimentos propios y ${datos.diario.length} registros del diario`
  return { ok: true, backup: { ...(b as Backup), datos }, resumen }
}
