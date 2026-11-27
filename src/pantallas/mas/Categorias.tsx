import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { borrarEtiqueta, crearEtiqueta, renombrarEtiqueta, useGruposEtiquetas } from '../../db/etiquetas'

/** Crear, renombrar y borrar categorías de recetas. */
export function EditarCategorias() {
  const { grupos } = useGruposEtiquetas()
  const [editando, setEditando] = useState<{ id: string; nombre: string } | null>(null)
  const [nueva, setNueva] = useState<Record<string, string>>({})
  const [borrando, setBorrando] = useState<{ id: string; nombre: string } | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {grupos.map((g) => (
        <section key={g.id} className="flex flex-col gap-2">
          <h3 className="font-titulo text-lg font-semibold">{g.nombre}</h3>
          <ul className="flex flex-col rounded-[22px] bg-tarjeta py-1">
            {g.opciones.map((o) => (
              <li key={o.id} className="flex min-h-12 items-center gap-2 px-4">
                {editando?.id === o.id ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      await renombrarEtiqueta(o.id, editando.nombre)
                      setEditando(null)
                    }}
                  >
                    <input
                      autoFocus
                      value={editando.nombre}
                      onChange={(e) => setEditando({ id: o.id, nombre: e.target.value })}
                      aria-label={`Nuevo nombre para ${o.nombre}`}
                      className="h-10 min-w-0 flex-1 rounded-xl bg-pista px-3 outline-none focus-visible:ring-3 focus-visible:ring-limon"
                    />
                    <button type="submit" className="h-10 rounded-full bg-limon-verde px-4 text-sm font-bold text-noche">
                      Listo
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-semibold">{o.nombre}</span>
                    <button
                      type="button"
                      onClick={() => setEditando({ id: o.id, nombre: o.nombre })}
                      className="h-10 px-2 text-sm font-bold underline underline-offset-2"
                    >
                      Renombrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setBorrando(o)}
                      aria-label={`Borrar ${o.nombre}`}
                      className="flex size-10 items-center justify-center rounded-full text-tinta-suave"
                    >
                      <Icono nombre="basura" tam={18} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (await crearEtiqueta(g.id, nueva[g.id] ?? '')) setNueva((n) => ({ ...n, [g.id]: '' }))
            }}
          >
            <input
              value={nueva[g.id] ?? ''}
              onChange={(e) => setNueva((n) => ({ ...n, [g.id]: e.target.value }))}
              placeholder={`Nueva en "${g.nombre}"`}
              aria-label={`Nueva categoría en ${g.nombre}`}
              className="h-11 min-w-0 flex-1 rounded-full bg-pista px-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-limon"
            />
            <button type="submit" className="h-11 rounded-full bg-noche px-4 text-sm font-bold text-crema dark:bg-crema dark:text-noche">
              Agregar
            </button>
          </form>
        </section>
      ))}

      {borrando && (
        <div role="alertdialog" aria-label="Confirmar borrado" className="sticky bottom-0 flex flex-col gap-3 rounded-[22px] bg-rosa-claro p-4 text-noche">
          <p className="text-sm">
            ¿Borrar <strong>{borrando.nombre}</strong>? Se quitará de todas las recetas que la tengan. Las recetas no se borran.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setBorrando(null)} className="h-11 rounded-full bg-crema font-bold">
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                await borrarEtiqueta(borrando.id)
                setBorrando(null)
              }}
              className="h-11 rounded-full bg-noche font-bold text-crema"
            >
              Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
