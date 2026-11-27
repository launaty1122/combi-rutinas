import { useState } from 'react'
import { Hoja } from '../componentes/Hoja'
import { Icono } from '../componentes/Icono'
import { Pantalla } from '../componentes/Pantalla'
import { nombreVisible } from '../datos/alimentos'
import { useCatalogo } from '../datos/catalogo'
import { alternarBasico, guardarAjuste, useBasicos, useSinCalorias } from '../db/ajustes'
import { borrarAlimentoPersonal, useAlimentosPersonales, usosDeAlimento } from '../db/alimentos'
import { metaAgua, usePerfil } from '../db/perfil'
import type { Alimento } from '../logica/tipos'
import { formatearNumero } from '../logica/texto'
import type { Tema } from '../tema'
import { BuscarAlimento } from './alacena/BuscarAlimento'
import { CrearAlimento } from './alacena/CrearAlimento'
import { SeccionBackup } from './mas/Backup'
import { EditarCategorias } from './mas/Categorias'
import { FormularioMetas } from './mas/Metas'

type HojaAbierta = null | 'basico' | 'metas' | 'categorias' | 'alimento'

export function Mas({ tema, setTema, alAgregar }: { tema: Tema; setTema: (t: Tema) => void; alAgregar: () => void }) {
  const catalogo = useCatalogo()
  const basicos = useBasicos()
  const sinCalorias = useSinCalorias()
  const perfil = usePerfil()
  const propios = useAlimentosPersonales()
  const [hoja, setHoja] = useState<HojaAbierta>(null)
  const [editandoAlimento, setEditandoAlimento] = useState<Alimento | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const listaBasicos = [...basicos]
    .map((id) => catalogo.porId.get(id))
    .filter((a) => a !== undefined)
    .sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), 'es'))

  async function borrarPropio(a: Alimento) {
    const usos = await usosDeAlimento(a.id)
    if (usos.recetas > 0 || usos.alacena > 0) {
      setAviso(
        `"${a.nombre}" se usa en ${usos.recetas} receta(s) y ${usos.alacena} cosa(s) de la alacena. Quítalo de ahí antes de borrarlo.`,
      )
      return
    }
    await borrarAlimentoPersonal(a.id)
    setAviso(null)
  }

  return (
    <Pantalla ruta="mas" titulo="Más" subtitulo="Ajustes de tu Combi" alAgregar={alAgregar}>
      <div className="flex flex-col gap-7">
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-titulo text-xl font-semibold">Mis metas</h2>
            <button type="button" onClick={() => setHoja('metas')} className="text-sm font-bold underline underline-offset-2">
              Editar
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { n: 'Proteína', v: `${perfil.metaProteina} g`, c: '#C9C2F7' },
              { n: 'Fibra', v: `${perfil.metaFibra} g`, c: '#AED140' },
              { n: 'Agua', v: `${formatearNumero(metaAgua(perfil) / 1000, 2)} L`, c: '#9BD0EC' },
            ].map((m) => (
              <div key={m.n} className="flex flex-col items-center rounded-[22px] py-3 text-noche" style={{ background: m.c }}>
                <span className="font-titulo text-xl font-semibold tabular-nums">{m.v}</span>
                <span className="text-xs font-bold">{m.n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-titulo text-xl font-semibold">Apariencia</h2>
          <div role="radiogroup" aria-label="Tema" className="grid grid-cols-2 gap-1 rounded-full bg-pista p-1">
            {(['claro', 'oscuro'] as Tema[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tema === t}
                onClick={() => setTema(t)}
                className={`h-11 rounded-full font-bold capitalize transition-colors duration-200 ${
                  tema === t ? 'bg-noche text-crema dark:bg-limon-verde dark:text-noche' : ''
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 rounded-[20px] bg-pista px-4 py-3">
            <input
              type="checkbox"
              checked={sinCalorias}
              onChange={(e) => guardarAjuste('sinCalorias', e.target.checked)}
              className="size-5 accent-finca"
            />
            <span className="text-sm">
              <strong>Modo sin calorías</strong>
              <span className="block text-tinta-suave">Oculta las calorías en toda la app. Proteína y fibra siguen al frente.</span>
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-titulo text-xl font-semibold">Básicos</h2>
            <p className="mt-1 text-sm text-tinta-suave">
              Lo que casi siempre hay en casa. No cuenta como faltante en las recetas ni se descuenta al cocinar.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {listaBasicos.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => alternarBasico(a.id)}
                  aria-label={`Quitar ${nombreVisible(a)} de los básicos`}
                  className="flex min-h-11 items-center gap-2 rounded-full bg-verde-claro py-1 pr-2 pl-4 text-sm font-bold text-noche"
                >
                  {nombreVisible(a)}
                  <span className="flex size-7 items-center justify-center rounded-full bg-crema/70">
                    <Icono nombre="cerrar" tam={14} />
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setHoja('basico')}
                className="flex min-h-11 items-center gap-2 rounded-full bg-pista px-4 text-sm font-bold"
              >
                <Icono nombre="agregar" tam={16} /> Agregar básico
              </button>
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-titulo text-xl font-semibold">Mis alimentos</h2>
            <p className="mt-1 text-sm text-tinta-suave">Los que creaste con la tabla del empaque (tu whey, tu yogur…).</p>
          </div>
          {propios.length > 0 && (
            <ul className="flex flex-col rounded-[22px] bg-tarjeta py-1">
              {propios.map((a) => (
                <li key={a.id} className="flex min-h-12 items-center gap-2 px-4">
                  <span className="flex-1 font-semibold">{a.nombre}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoAlimento(a)
                      setHoja('alimento')
                    }}
                    className="h-10 px-2 text-sm font-bold underline underline-offset-2"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => borrarPropio(a)}
                    aria-label={`Borrar ${a.nombre}`}
                    className="flex size-10 items-center justify-center rounded-full text-tinta-suave"
                  >
                    <Icono nombre="basura" tam={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {aviso && <p className="text-sm font-semibold text-chili dark:text-rosa-claro">{aviso}</p>}
          <button
            type="button"
            onClick={() => {
              setEditandoAlimento(null)
              setHoja('alimento')
            }}
            className="flex min-h-11 items-center gap-2 self-start rounded-full bg-pista px-4 text-sm font-bold"
          >
            <Icono nombre="agregar" tam={16} /> Crear alimento
          </button>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="font-titulo text-xl font-semibold">Categorías de recetas</h2>
            <p className="mt-1 text-sm text-tinta-suave">Crea, renombra o borra cocinas, momentos y tipos.</p>
          </div>
          <button type="button" onClick={() => setHoja('categorias')} className="h-12 self-start rounded-full bg-pista px-5 font-bold">
            Editar categorías
          </button>
        </section>

        <SeccionBackup />
      </div>

      <Hoja abierta={hoja === 'basico'} titulo="Agregar básico" alCerrar={() => setHoja(null)}>
        <BuscarAlimento
          catalogo={catalogo}
          alElegir={async (a) => {
            if (!basicos.has(a.id)) await alternarBasico(a.id)
            setHoja(null)
          }}
        />
      </Hoja>
      <Hoja abierta={hoja === 'metas'} titulo="Metas y datos" alCerrar={() => setHoja(null)}>
        <FormularioMetas perfil={perfil} alGuardar={() => setHoja(null)} />
      </Hoja>
      <Hoja abierta={hoja === 'categorias'} titulo="Categorías" alCerrar={() => setHoja(null)}>
        <EditarCategorias />
      </Hoja>
      <Hoja abierta={hoja === 'alimento'} titulo={editandoAlimento ? 'Editar alimento' : 'Nuevo alimento'} alCerrar={() => setHoja(null)}>
        <CrearAlimento key={editandoAlimento?.id ?? 'nuevo'} inicial={editandoAlimento ?? undefined} alGuardar={() => setHoja(null)} />
      </Hoja>
    </Pantalla>
  )
}
