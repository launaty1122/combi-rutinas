import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { nombreVisible } from '../../datos/alimentos'
import { CATEGORIA_POR_ID } from '../../datos/categorias'
import type { Catalogo } from '../../datos/catalogo'
import { buscarParecidos } from '../../logica/buscar'
import type { ProductoOFF } from '../../logica/openfoodfacts'
import type { Alimento } from '../../logica/tipos'
import { CrearAlimento } from './CrearAlimento'
import { EscanearProducto } from './EscanearProducto'

/** Buscador de alimentos (TACO, USDA y personales) para elegir uno. */
export function BuscarAlimento({
  catalogo,
  alElegir,
  consultaInicial = '',
  alCrear,
}: {
  catalogo: Catalogo
  alElegir: (a: Alimento) => void
  consultaInicial?: string
  /** Si se pasa, aparece "Crear alimento" para lo que no está en la base. */
  alCrear?: (nombre: string) => void
}) {
  const [q, setQ] = useState(consultaInicial)
  // Escáner de código de barras: escanear → revisar/crear el alimento → elegirlo.
  const [escaneo, setEscaneo] = useState<null | 'camara' | 'manual' | ProductoOFF>(null)

  if (escaneo === 'camara') {
    return (
      <div className="flex flex-col gap-3">
        <EscanearProducto alEncontrar={setEscaneo} alCrearManual={() => setEscaneo('manual')} />
        <button type="button" onClick={() => setEscaneo(null)} className="h-11 font-bold text-tinta-suave">
          Volver a buscar
        </button>
      </div>
    )
  }
  if (escaneo !== null) {
    return (
      <div className="flex flex-col gap-3">
        {escaneo !== 'manual' && (
          <p className="rounded-[20px] bg-verde-claro px-4 py-3 text-sm text-noche">
            Encontré <strong>{escaneo.nombre}</strong>{escaneo.marca ? ` (${escaneo.marca})` : ''}. Revisa los valores con el empaque y guarda.
          </p>
        )}
        <CrearAlimento plantilla={escaneo === 'manual' ? undefined : escaneo} alGuardar={alElegir} />
      </div>
    )
  }
  const exactos = catalogo.buscar(q, 25)
  // Si no hay nada con la frase completa, se muestra lo más parecido con menos palabras.
  const parecidos = q.trim() && exactos.length === 0 ? buscarParecidos(catalogo.buscar, q, 25) : null
  const resultados = exactos.length ? exactos : (parecidos?.resultados ?? [])

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

      <button
        type="button"
        onClick={() => setEscaneo('camara')}
        className="flex min-h-11 items-center gap-2 self-start rounded-full bg-pista px-4 text-sm font-bold"
      >
        <Icono nombre="codigo" tam={18} /> Escanear código de barras
      </button>

      {q.trim() === '' && (
        <p className="px-1 text-sm text-tinta-suave">Escribe en español o en portugués. No importan las tildes.</p>
      )}
      {q.trim() !== '' && resultados.length === 0 && (
        <p className="px-1 text-sm text-tinta-suave">No encontré "{q}". Prueba con otra palabra.</p>
      )}
      {parecidos && (
        <p className="px-1 text-sm text-tinta-suave">
          No tengo "{q}" tal cual. Esto es lo más parecido a <strong className="text-tinta">"{parecidos.consulta}"</strong>:
        </p>
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

      {alCrear && q.trim() !== '' && (
        <button
          type="button"
          onClick={() => alCrear(q.trim())}
          className="flex min-h-12 items-center gap-2 rounded-full bg-pista px-5 text-left text-sm font-bold"
        >
          <Icono nombre="agregar" tam={18} /> ¿No está? Crear "{q.trim()}" con la tabla del empaque
        </button>
      )}
    </div>
  )
}
