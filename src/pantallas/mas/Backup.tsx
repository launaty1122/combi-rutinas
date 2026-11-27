import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { leerAjuste } from '../../db/ajustes'
import { exportarBackup, restaurarBackup } from '../../db/backup'
import { leerBackup, type Backup as TBackup } from '../../logica/backup'
import { diasHasta, fechaCorta, hoyISO } from '../../logica/fechas'

/** Guardar y recuperar tus datos. Como todo vive solo en el celular, esto es tu seguro. */
export function SeccionBackup() {
  const ultimo = useLiveQuery(() => leerAjuste<string | null>('ultimoBackup', null), [], null)
  const archivo = useRef<HTMLInputElement>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [pendiente, setPendiente] = useState<{ backup: TBackup; resumen: string } | null>(null)

  const diasDesde = ultimo ? -diasHasta(hoyISO(new Date(ultimo)), hoyISO()) : null

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-titulo text-xl font-semibold">Backup</h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Tus datos viven solo en este celular. Guarda un backup de vez en cuando (en Drive, en tu correo…): si cambias o
          pierdes el celular, lo recuperas todo.
        </p>
      </div>

      <p
        className={`rounded-[18px] px-4 py-2.5 text-sm ${
          diasDesde === null || diasDesde > 14 ? 'bg-mantequilla text-noche' : 'bg-pista'
        }`}
      >
        {ultimo
          ? `Último backup: ${fechaCorta(hoyISO(new Date(ultimo)))}${diasDesde && diasDesde > 14 ? ` (hace ${diasDesde} días: buen momento para otro)` : ''}.`
          : 'Todavía no has guardado ningún backup.'}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={async () => {
            const nombre = await exportarBackup()
            setMensaje({ tipo: 'ok', texto: `Se descargó "${nombre}". Guárdalo en un lugar seguro.` })
          }}
          className="h-13 rounded-full bg-limon-verde py-3.5 font-bold text-noche"
        >
          Exportar
        </button>
        <button type="button" onClick={() => archivo.current?.click()} className="h-13 rounded-full bg-pista py-3.5 font-bold">
          Importar
        </button>
      </div>
      <input
        ref={archivo}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Elegir archivo de backup"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          const l = leerBackup(await f.text())
          if (!l.ok) setMensaje({ tipo: 'error', texto: l.error })
          else setPendiente({ backup: l.backup, resumen: l.resumen })
        }}
      />

      {pendiente && (
        <div role="alertdialog" aria-label="Confirmar importación" className="flex flex-col gap-3 rounded-[22px] bg-rosa-claro p-4 text-noche">
          <p className="text-sm">
            <strong>¿Reemplazar tus datos?</strong> El backup tiene {pendiente.resumen}. Todo lo que hay ahora en la app se
            reemplaza por eso, y no se puede deshacer.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPendiente(null)} className="h-11 rounded-full bg-crema font-bold">
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                await restaurarBackup(pendiente.backup)
                setPendiente(null)
                setMensaje({ tipo: 'ok', texto: 'Listo: se recuperaron tus datos.' })
              }}
              className="h-11 rounded-full bg-noche font-bold text-crema"
            >
              Reemplazar
            </button>
          </div>
        </div>
      )}

      {mensaje && (
        <p role="status" className={`text-sm ${mensaje.tipo === 'error' ? 'font-bold text-chili dark:text-rosa-claro' : 'text-tinta-suave'}`}>
          {mensaje.texto}
        </p>
      )}
    </section>
  )
}
