import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { nombreVisible } from '../../datos/alimentos'
import { CATEGORIA_POR_ID } from '../../datos/categorias'
import type { Catalogo } from '../../datos/catalogo'
import { buscarParecidos } from '../../logica/buscar'
import { mapearBusquedaOFF, URLS_BUSQUEDA_OFF, type ProductoOFF } from '../../logica/openfoodfacts'
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

      {q.trim() !== '' && <BuscarEnInternet key={q.trim()} texto={q.trim()} alElegir={setEscaneo} />}

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

type ResultadoOFF = ProductoOFF & { codigo: string }
const sinTildes = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * Para productos de marca (Zucaritas, una proteína en polvo…): busca por nombre en Open Food Facts.
 * Solo se conecta cuando tocas el botón. Al elegir uno se revisa y se guarda como alimento tuyo,
 * igual que al escanear el código de barras, y desde ahí funciona sin internet.
 */
function BuscarEnInternet({ texto, alElegir }: { texto: string; alElegir: (p: ProductoOFF) => void }) {
  const [estado, setEstado] = useState<'listo' | 'cargando' | 'error' | ResultadoOFF[]>('listo')

  async function buscar() {
    setEstado('cargando')
    try {
      // Las tildes cambian los resultados: se busca con y sin ellas, todo junto.
      const pedir = async (t: string) => {
        const urls = [...new Set([t, sinTildes(t)])].flatMap(URLS_BUSQUEDA_OFF)
        return mapearBusquedaOFF(...(await Promise.all(urls.map(async (u) => (await fetch(u)).json()))))
      }
      // Si la frase completa no da nada, se quitan palabras del final ("zucaritas chocolate" → "zucaritas").
      const palabras = texto.split(/\s+/)
      let lista: ResultadoOFF[] = []
      for (let n = palabras.length; n > 0 && lista.length === 0; n--) lista = await pedir(palabras.slice(0, n).join(' '))
      // Primero los que tienen todas las palabras que escribiste.
      const claves = palabras.map((p) => sinTildes(p.toLowerCase()))
      const aciertos = (p: ResultadoOFF) => claves.filter((c) => sinTildes(`${p.nombre} ${p.marca ?? ''}`.toLowerCase()).includes(c)).length
      setEstado([...lista].sort((a, b) => aciertos(b) - aciertos(a)))
    } catch {
      setEstado('error')
    }
  }

  if (estado === 'listo' || estado === 'error') {
    return (
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={buscar} className="flex min-h-12 items-center gap-2 rounded-full bg-pista px-5 text-left text-sm font-bold">
          <Icono nombre="buscar" tam={18} /> ¿Es de marca? Buscar "{texto}" en internet
        </button>
        {estado === 'error' && (
          <p className="px-1 text-sm text-tinta-suave">No pude conectarme. Revisa el internet e inténtalo otra vez.</p>
        )}
      </div>
    )
  }
  if (estado === 'cargando') return <p className="px-1 text-sm text-tinta-suave">Buscando en Open Food Facts…</p>
  if (estado.length === 0) {
    return <p className="px-1 text-sm text-tinta-suave">Tampoco lo encontré en internet. Puedes crearlo con la tabla del empaque.</p>
  }
  return (
    <section className="flex flex-col gap-1 rounded-[22px] bg-tarjeta p-2">
      <p className="px-2 pt-1 text-sm font-bold">En internet (Open Food Facts)</p>
      <p className="px-2 text-xs text-tinta-suave">Datos cargados por personas voluntarias: revísalos con el empaque antes de guardar.</p>
      <ul className="flex flex-col">
        {estado.map((p) => (
          <li key={`${p.codigo}-${p.nombre}`}>
            <button
              type="button"
              onClick={() => alElegir(p)}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors duration-150 active:bg-pista"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{p.nombre}</span>
                <span className="block truncate text-xs text-tinta-suave">
                  {p.marca ? `${p.marca} · ` : ''}
                  {p.n.kcal} kcal por 100 g
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
