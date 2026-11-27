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
  await db.transaction('rw', [db.alacena, db.alimentosPersonales, db.recetas, db.ajustes], async () => {
    await Promise.all([db.alacena.clear(), db.alimentosPersonales.clear(), db.recetas.clear(), db.ajustes.clear()])
    await db.alacena.bulkPut(b.datos.alacena)
    await db.alimentosPersonales.bulkPut(b.datos.alimentosPersonales)
    await db.recetas.bulkPut(b.datos.recetas)
    await db.ajustes.bulkPut(b.datos.ajustes)
  })
}
