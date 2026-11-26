import { useState } from 'react'
import { Hoja } from '../componentes/Hoja'
import { Icono } from '../componentes/Icono'
import { Pantalla } from '../componentes/Pantalla'
import { nombreVisible } from '../datos/alimentos'
import { useCatalogo } from '../datos/catalogo'
import { alternarBasico, guardarAjuste, useBasicos, useSinCalorias } from '../db/ajustes'
import type { Tema } from '../tema'
import { BuscarAlimento } from './alacena/BuscarAlimento'

export function Mas({ tema, setTema, alAgregar }: { tema: Tema; setTema: (t: Tema) => void; alAgregar: () => void }) {
  const catalogo = useCatalogo()
  const basicos = useBasicos()
  const sinCalorias = useSinCalorias()
  const [agregandoBasico, setAgregandoBasico] = useState(false)
  const listaBasicos = [...basicos]
    .map((id) => catalogo.porId.get(id))
    .filter((a) => a !== undefined)
    .sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), 'es'))

  return (
    <Pantalla ruta="mas" titulo="Más" subtitulo="Ajustes de tu Combi" alAgregar={alAgregar}>
      <div className="flex flex-col gap-6">
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
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-titulo text-xl font-semibold">Calorías</h2>
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
                onClick={() => setAgregandoBasico(true)}
                className="flex min-h-11 items-center gap-2 rounded-full bg-pista px-4 text-sm font-bold"
              >
                <Icono nombre="agregar" tam={16} /> Agregar básico
              </button>
            </li>
          </ul>
        </section>

        <section className="rounded-[24px] bg-tarjeta p-4 text-sm text-tinta-suave">
          <p>
            <strong className="text-tinta">Pronto aquí:</strong> metas de proteína, fibra y agua, tus datos, y el backup
            para guardar y recuperar tu información.
          </p>
        </section>
      </div>

      <Hoja abierta={agregandoBasico} titulo="Agregar básico" alCerrar={() => setAgregandoBasico(false)}>
        <BuscarAlimento
          catalogo={catalogo}
          alElegir={async (a) => {
            if (!basicos.has(a.id)) await alternarBasico(a.id)
            setAgregandoBasico(false)
          }}
        />
      </Hoja>
    </Pantalla>
  )
}
