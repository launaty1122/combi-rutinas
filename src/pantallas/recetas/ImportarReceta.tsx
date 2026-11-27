import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { nombreVisible } from '../../datos/alimentos'
import type { Catalogo } from '../../datos/catalogo'
import { instruccionesParaIA } from '../../datos/instrucciones-ia'
import { db, nuevoId } from '../../db/db'
import { etiquetasValidas } from '../../db/etiquetas'
import { construirReceta, emparejarIngrediente, validarRecetasJSON, type RecetaImportada } from '../../logica/importar'
import type { Alimento } from '../../logica/tipos'
import { formatearGramos } from '../../logica/unidades'
import { href } from '../../rutas'
import { BuscarAlimento } from '../alacena/BuscarAlimento'
import { CrearAlimento } from '../alacena/CrearAlimento'

interface Revision {
  receta: RecetaImportada
  elegidos: (Alimento | null)[]
  sugerencias: Alimento[][]
}

/** Importar recetas pegando JSON (el que arma una IA con las instrucciones). */
export function ImportarReceta({ catalogo, alTerminar }: { catalogo: Catalogo; alTerminar: () => void }) {
  const [texto, setTexto] = useState('')
  const [errores, setErrores] = useState<string[]>([])
  const [avisos, setAvisos] = useState<string[]>([])
  const [revision, setRevision] = useState<Revision[] | null>(null)
  const [copiado, setCopiado] = useState<'no' | 'si' | 'manual'>('no')
  const [instrucciones, setInstrucciones] = useState('')
  const [buscando, setBuscando] = useState<{ r: number; i: number } | null>(null)
  const [guardadas, setGuardadas] = useState<string[] | null>(null)
  const [creando, setCreando] = useState<string | null>(null)

  async function copiar() {
    const t = instruccionesParaIA(await etiquetasValidas())
    try {
      await navigator.clipboard.writeText(t)
      setCopiado('si')
    } catch {
      // Si el navegador no deja copiar solo, se muestra el texto para copiarlo a mano.
      setInstrucciones(t)
      setCopiado('manual')
    }
  }

  async function revisar() {
    const v = validarRecetasJSON(texto, new Set(await etiquetasValidas()))
    setErrores(v.errores)
    setAvisos(v.avisos)
    if (v.errores.length || v.recetas.length === 0) return
    setRevision(
      v.recetas.map((receta) => {
        const m = receta.ingredientes.map((ing) => emparejarIngrediente(ing, catalogo.porId, catalogo.buscar))
        return { receta, elegidos: m.map((x) => x.elegido), sugerencias: m.map((x) => x.sugerencias) }
      }),
    )
  }

  function elegir(r: number, i: number, a: Alimento) {
    setRevision((rev) =>
      rev ? rev.map((x, n) => (n === r ? { ...x, elegidos: x.elegidos.map((e, k) => (k === i ? a : e)) } : x)) : rev,
    )
    setBuscando(null)
    setCreando(null)
  }

  async function guardar() {
    if (!revision) return
    const recetas = revision.map((x) => construirReceta(x.receta, x.elegidos, nuevoId('imp-')))
    await db.recetas.bulkPut(recetas)
    setGuardadas(recetas.map((r) => r.id))
  }

  if (guardadas) {
    return (
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div className="flex size-24 items-center justify-center rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-limon-verde text-noche">
          <Icono nombre="check" tam={40} />
        </div>
        <p className="font-titulo text-2xl font-semibold">
          {guardadas.length === 1 ? '¡Receta guardada!' : `¡${guardadas.length} recetas guardadas!`}
        </p>
        <a
          href={href('recetas', guardadas[0])}
          onClick={alTerminar}
          className="flex h-14 w-full items-center justify-center rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche"
        >
          Verla
        </a>
        <button type="button" onClick={alTerminar} className="h-12 font-bold text-tinta-suave">
          Volver al recetario
        </button>
      </div>
    )
  }

  if (buscando && revision) {
    const ing = revision[buscando.r].receta.ingredientes[buscando.i]
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">
          Elige el alimento para <strong>"{ing.alimento}"</strong>
        </p>
        {creando !== null ? (
          <CrearAlimento nombreInicial={creando} alGuardar={(a) => elegir(buscando.r, buscando.i, a)} />
        ) : (
          <BuscarAlimento
            catalogo={catalogo}
            alElegir={(a) => elegir(buscando.r, buscando.i, a)}
            consultaInicial={ing.alimento}
            alCrear={setCreando}
          />
        )}
        <button
          type="button"
          onClick={() => {
            setBuscando(null)
            setCreando(null)
          }}
          className="h-12 font-bold text-tinta-suave"
        >
          Volver
        </button>
      </div>
    )
  }

  if (revision) {
    const faltan = revision.reduce((s, x) => s + x.elegidos.filter((e) => !e).length, 0)
    return (
      <div className="flex flex-col gap-5">
        {avisos.length > 0 && (
          <ul className="rounded-[20px] bg-mantequilla px-4 py-3 text-sm text-noche">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        {revision.map((x, r) => (
          <section key={r} className="flex flex-col gap-2">
            <h3 className="font-titulo text-xl font-semibold">{x.receta.nombre}</h3>
            <p className="text-sm text-tinta-suave">
              {x.receta.porciones} {x.receta.porciones === 1 ? "porción" : "porciones"} · {x.receta.minutos} min · {x.receta.pasos.length} pasos
            </p>
            <ul className="flex flex-col gap-2">
              {x.receta.ingredientes.map((ing, i) => {
                const elegido = x.elegidos[i]
                return (
                  <li key={i} className="rounded-[20px] bg-tarjeta px-4 py-3">
                    <p className="text-sm">
                      <strong>{ing.texto ?? ing.alimento}</strong>
                      <span className="text-tinta-suave"> · {formatearGramos(ing.gramos)} · "{ing.alimento}"</span>
                    </p>
                    {elegido ? (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-bold">
                          <span className="flex size-6 items-center justify-center rounded-full bg-finca text-crema">
                            <Icono nombre="check" tam={13} />
                          </span>
                          {nombreVisible(elegido)}
                        </span>
                        <button type="button" onClick={() => setBuscando({ r, i })} className="text-sm font-bold underline">
                          cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex flex-col gap-2">
                        <span className="text-sm font-bold">¿Cuál de estos es?</span>
                        <div className="flex flex-wrap gap-1.5">
                          {x.sugerencias[i].slice(0, 4).map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => elegir(r, i, a)}
                              className="min-h-10 rounded-full bg-pista px-3 text-left text-sm font-semibold"
                            >
                              {nombreVisible(a)}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setBuscando({ r, i })}
                            className="min-h-10 rounded-full bg-noche px-3 text-sm font-bold text-crema dark:bg-crema dark:text-noche"
                          >
                            Buscar otro
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        <button
          type="button"
          disabled={faltan > 0}
          onClick={guardar}
          className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45"
        >
          {faltan > 0 ? `Elige ${faltan} ${faltan === 1 ? 'alimento' : 'alimentos'} más` : 'Guardar'}
        </button>
        <button type="button" onClick={() => setRevision(null)} className="h-11 font-bold text-tinta-suave">
          Volver a pegar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-tinta-suave">
        <li>Copia las instrucciones y pégalas en tu chat de IA, con la receta debajo.</li>
        <li>Copia el JSON que te devuelva y pégalo aquí.</li>
      </ol>
      <button
        type="button"
        onClick={copiar}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-noche font-bold text-crema dark:bg-crema dark:text-noche"
      >
        {copiado === 'si' ? (
          <>
            <Icono nombre="check" tam={18} /> ¡Copiadas!
          </>
        ) : (
          'Copiar instrucciones para IA'
        )}
      </button>
      {copiado === 'manual' && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-bold">Tu navegador no dejó copiar solo. Selecciona este texto y cópialo:</span>
          <textarea readOnly value={instrucciones} rows={5} className="rounded-[16px] bg-pista p-3 text-xs" />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">Pega aquí el JSON</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          aria-label="Pega aquí el JSON"
          placeholder='{ "nombre": "…", "porciones": 2, … }'
          spellCheck={false}
          className="rounded-[20px] bg-pista px-4 py-3 font-mono text-sm outline-none placeholder:text-tinta-suave focus-visible:ring-3 focus-visible:ring-limon"
        />
      </label>
      {errores.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 rounded-[20px] bg-rosa-claro px-4 py-3 text-sm text-noche">
          {errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        disabled={!texto.trim()}
        onClick={revisar}
        className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche disabled:opacity-45"
      >
        Revisar
      </button>
    </div>
  )
}
