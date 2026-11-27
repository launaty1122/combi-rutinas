import { crearBackup, nombreArchivoBackup, type Backup } from '../logica/backup'
import { guardarAjuste } from './ajustes'
import { db } from './db'

/** Arma el backup con todo lo guardado y lo descarga como archivo .json. */
export async function exportarBackup(): Promise<string> {
  const ahora = new Date()
  await guardarAjuste('ultimoBackup', ahora.toISOString())
  const backup = crearBackup(
    {
      alacena: await db.alacena.toArray(),
      alimentosPersonales: await db.alimentosPersonales.toArray(),
      recetas: await db.recetas.toArray(),
      ajustes: await db.ajustes.toArray(),
      mercado: await db.mercado.toArray(),
      precios: await db.precios.toArray(),
      compras: await db.compras.toArray(),
      diario: await db.diario.toArray(),
      agua: await db.agua.toArray(),
      comidasGuardadas: await db.comidasGuardadas.toArray(),
      medidas: await db.medidas.toArray(),
    },
    ahora,
  )
  const nombre = nombreArchivoBackup(ahora)
  const blob = new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return nombre
}

/** Reemplaza TODOS los datos por los del backup. Todo o nada. */
export async function restaurarBackup(b: Backup): Promise<void> {
  const tablas = [db.alacena, db.alimentosPersonales, db.recetas, db.ajustes, db.mercado, db.precios, db.compras, db.diario, db.agua, db.comidasGuardadas, db.medidas]
  await db.transaction('rw', tablas, async () => {
    await Promise.all(tablas.map((t) => t.clear()))
    await db.mercado.bulkPut(b.datos.mercado)
    await db.precios.bulkPut(b.datos.precios)
    await db.compras.bulkPut(b.datos.compras)
    await db.diario.bulkPut(b.datos.diario)
    await db.agua.bulkPut(b.datos.agua)
    await db.comidasGuardadas.bulkPut(b.datos.comidasGuardadas)
    await db.medidas.bulkPut(b.datos.medidas)
    await db.alacena.bulkPut(b.datos.alacena)
    await db.alimentosPersonales.bulkPut(b.datos.alimentosPersonales)
    await db.recetas.bulkPut(b.datos.recetas)
    await db.ajustes.bulkPut(b.datos.ajustes)
  })
}
