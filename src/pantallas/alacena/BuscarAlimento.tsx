import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { nombreVisible } from '../../datos/alimentos'
import { CATEGORIA_POR_ID } from '../../datos/categorias'
import type { Catalogo } from '../../datos/catalogo'
import type { Alimento } from '../../logica/tipos'

/** Buscador de alimentos (TACO, USDA y personales) para elegir uno. */
export function BuscarAlimento({ catalogo, alElegir }: { catalogo: Catalogo; alElegir: (a: Alimento) => void }) {
  const [q, setQ] = useState('')
  const resultados = catalogo.buscar(q, 25)

  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-14 items-center gap-3 rounded-full bg-pista px-5">
        <Icono nombre="buscar" className="text-tinta-suave" />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca: huevo, frijol, chía…"
          aria-label="Buscar alimento"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-tinta-suave"
        />
      </label>

      {q.trim() === '' && (
        <p className="px-1 text-sm text-tinta-suave">Escribe en español o en portugués. No importan las tildes.</p>
      )}
      {q.trim() !== '' && resultados.length === 0 && (
        <p className="px-1 text-sm text-tinta-suave">No encontré "{q}". Prueba con otra palabra.</p>
      )}

      <ul className="flex flex-col">
        {resultados.map((a) => {
          const cat = CATEGORIA_POR_ID.get(a.categoria)
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => alElegir(a)}
                className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors duration-150 active:bg-pista"
              >
                <span className="size-3 shrink-0 rounded-full" style={{ background: cat?.color }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{nombreVisible(a)}</span>
                  <span className="block truncate text-xs text-tinta-suave">
                    {a.alias.length > 0 ? `${a.nombre} · ` : ''}
                    {cat?.nombre}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
