import { useState } from 'react'
import { Icono } from '../../componentes/Icono'
import { nombreVisible } from '../../datos/alimentos'
import type { Catalogo } from '../../datos/catalogo'
import { reemplazarAlacena } from '../../db/alacena'
import { descontarDeAlacena } from '../../logica/alacena'
import { escalarIngredientes } from '../../logica/escalar'
import type { ItemAlacena, Receta } from '../../logica/tipos'
import { formatearGramos } from '../../logica/unidades'

interface Props {
  receta: Receta
  porcionesIniciales: number
  alacena: ItemAlacena[]
  basicos: Set<string>
  catalogo: Catalogo
  alTerminar: () => void
}

/** "Cociné esto": pregunta porciones, muestra qué se descuenta y, al confirmar, lo descuenta. */
export function CocineEsto({ receta, porcionesIniciales, alacena, basicos, catalogo, alTerminar }: Props) {
  const [paso, setPaso] = useState<'porciones' | 'listo'>('porciones')
  const [porciones, setPorciones] = useState(porcionesIniciales)
  const [guardando, setGuardando] = useState(false)

  const ingredientes = escalarIngredientes(receta, porciones)
  const { alacena: nueva, resumen } = descontarDeAlacena(alacena, ingredientes, basicos)
  const nombre = (id: string) => {
    const a = catalogo.porId.get(id)
    return a ? nombreVisible(a) : id
  }
  const liquido = (id: string) => catalogo.porId.get(id)?.liquido

  if (paso === 'listo') {
    return (
      <div className="flex flex-col items-center gap-4 pt-2 text-center">
        <div className="flex size-28 items-center justify-center rounded-[46%_54%_58%_42%/52%_44%_56%_48%] bg-limon-verde text-noche">
          <Icono nombre="check" tam={44} />
        </div>
        <p className="font-titulo text-2xl font-semibold">¡Que lo disfrutes!</p>
        <p className="max-w-xs text-tinta-suave">
          Ya descontamos los ingredientes de tu alacena. Cuando llegue el diario (Fase 2), aquí anotarás cuántas
          porciones comiste.
        </p>
        <button
          type="button"
          onClick={alTerminar}
          className="h-14 w-full rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche"
        >
          Listo
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-[24px] bg-pista p-2 pl-5">
        <span className="font-bold">¿Cuántas porciones cocinaste?</span>
        <Contador valor={porciones} alCambiar={setPorciones} />
      </div>

      <div>
        <h3 className="mb-2 font-titulo text-lg font-semibold">Esto sale de tu alacena</h3>
        {resumen.length === 0 ? (
          <p className="text-sm text-tinta-suave">Esta receta solo usa básicos: no hay nada que descontar.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {resumen.map((l) => (
              <li key={l.alimentoId} className="flex items-baseline justify-between gap-3 text-[15px]">
                <span className="font-semibold">{nombre(l.alimentoId)}</span>
                <span className="text-right tabular-nums">
                  {l.descontado > 0 ? `−${formatearGramos(l.descontado, liquido(l.alimentoId))}` : '—'}
                  {l.noHabia > 0 && (
                    <span className="block text-xs text-tinta-suave">
                      no estaba registrado: {formatearGramos(l.noHabia, liquido(l.alimentoId))}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-tinta-suave">Los básicos (sal, aceite…) no se descuentan.</p>
      </div>

      <button
        type="button"
        disabled={guardando}
        onClick={async () => {
          setGuardando(true)
          await reemplazarAlacena(nueva)
          setGuardando(false)
          setPaso('listo')
        }}
        className="h-14 rounded-full bg-limon-verde font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-50"
      >
        Confirmar y descontar
      </button>
    </div>
  )
}

export function Contador({
  valor,
  alCambiar,
  min = 1,
  oscuro = false,
}: {
  valor: number
  alCambiar: (n: number) => void
  min?: number
  oscuro?: boolean
}) {
  const fondo = oscuro ? 'bg-white/10 text-crema dark:bg-noche/10 dark:text-noche' : 'bg-hoja'
  return (
    <div className={`flex h-12 items-center rounded-full ${fondo}`}>
      <button
        type="button"
        aria-label="Una porción menos"
        disabled={valor <= min}
        onClick={() => alCambiar(Math.max(min, valor - 1))}
        className="flex size-12 items-center justify-center disabled:opacity-35"
      >
        <Icono nombre="menos" tam={18} />
      </button>
      <span className="min-w-16 text-center font-extrabold tabular-nums" aria-live="polite">
        {valor} porc.
      </span>
      <button
        type="button"
        aria-label="Una porción más"
        onClick={() => alCambiar(valor + 1)}
        className="flex size-12 items-center justify-center"
      >
        <Icono nombre="agregar" tam={18} />
      </button>
    </div>
  )
}
