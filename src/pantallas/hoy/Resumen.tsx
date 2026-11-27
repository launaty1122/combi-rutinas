import { Mancha } from '../../componentes/Icono'
import type { Perfil } from '../../db/perfil'
import { metaAgua } from '../../db/perfil'
import { gastoEstimado, type ResumenDia } from '../../logica/diario'
import { carbohidratosNetos } from '../../logica/nutricion'
import { formatearNumero } from '../../logica/texto'

const g = (n: number | null) => (n === null ? '—' : formatearNumero(n, n < 10 ? 1 : 0))

function Barra({ valor, meta, color }: { valor: number; meta: number; color: string }) {
  const p = meta > 0 ? Math.min(1, valor / meta) : 0
  return (
    <div className="h-3 overflow-hidden rounded-full bg-pista">
      <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${p * 100}%`, background: color }} />
    </div>
  )
}

/**
 * Resumen del día en tarjetas que se deslizan:
 * 1) proteína, fibra y agua (siempre primero), 2) calorías (se oculta en "Modo sin calorías"),
 * 3) macros, 4) micronutrientes.
 */
export function ResumenDelDia({
  resumen,
  aguaMl,
  perfil,
  sinCalorias,
}: {
  resumen: ResumenDia
  aguaMl: number
  perfil: Perfil
  sinCalorias: boolean
}) {
  // Un día sin nada anotado es 0 (no "sin dato"): todavía no has comido nada.
  const vacio = resumen.porMomento.size === 0
  const t = vacio ? Object.fromEntries(Object.keys(resumen.total).map((k) => [k, 0])) as typeof resumen.total : resumen.total
  const inc = resumen.incompletos
  const aguaMeta = metaAgua(perfil)
  const gasto = gastoEstimado(perfil).total
  const prot = t.proteina ?? 0

  const tarjeta = 'relative w-[86%] shrink-0 snap-center overflow-hidden rounded-[28px] p-5'

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Resumen del día">
      <section className={`${tarjeta} bg-tarjeta`} aria-label="Proteína, fibra y agua">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-tinta-suave">Proteína</p>
            <p className="font-titulo text-[52px] leading-none font-semibold tabular-nums">
              {g(t.proteina)}
              <span className="text-2xl"> g</span>
            </p>
          </div>
          <p className="pb-1.5 text-sm font-bold text-tinta-suave">de {perfil.metaProteina} g</p>
        </div>
        <div className="mt-3">
          <Barra valor={prot} meta={perfil.metaProteina} color="var(--principal)" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-[22px] bg-verde-claro p-3 text-noche">
            <Mancha className="pointer-events-none absolute -top-6 -right-6 w-20 text-limon-verde" />
            <p className="relative text-xs font-bold">Fibra{inc.has('fibra') ? ' (≥)' : ''}</p>
            <p className="relative font-titulo text-2xl font-semibold tabular-nums">
              {g(t.fibra)} <span className="text-sm">/ {perfil.metaFibra} g</span>
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[22px] bg-[#CFE8F6] p-3 text-noche">
            <Mancha className="pointer-events-none absolute -top-6 -right-6 w-20 text-cielo" />
            <p className="relative text-xs font-bold">Agua</p>
            <p className="relative font-titulo text-2xl font-semibold tabular-nums">
              {formatearNumero(aguaMl / 1000, 2)} <span className="text-sm">/ {formatearNumero(aguaMeta / 1000, 1)} L</span>
            </p>
          </div>
        </div>
      </section>

      {!sinCalorias && (
        <section className={`${tarjeta} bg-mantequilla text-noche`} aria-label="Calorías">
          <Mancha className="pointer-events-none absolute -right-12 -bottom-16 w-44 text-limon" />
          <p className="relative text-sm font-bold">Calorías</p>
          <div className="relative mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              ['Consumido', g(t.kcal)],
              ['Gasto estimado', formatearNumero(gasto, 0)],
              ['Restante', t.kcal === null ? formatearNumero(gasto, 0) : formatearNumero(gasto - t.kcal, 0)],
            ].map(([n, v]) => (
              <div key={n}>
                <p className="font-titulo text-[28px] leading-tight font-semibold tabular-nums">{v}</p>
                <p className="text-xs font-bold">{n}</p>
              </div>
            ))}
          </div>
          <p className="relative mt-3 text-xs">El gasto es una estimación (± 10 %) con tus datos y tu actividad.</p>
        </section>
      )}

      <section className={`${tarjeta} bg-lila text-noche`} aria-label="Macros">
        <Mancha className="pointer-events-none absolute -top-14 -right-12 w-40 text-[#B1A7F2]" />
        <p className="relative text-sm font-bold">Macros</p>
        <dl className="relative mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            ['Proteína', t.proteina],
            ['Carbos netos', carbohidratosNetos(t)],
            ['Grasa', t.grasa],
          ].map(([n, v]) => (
            <div key={n as string}>
              <dd className="font-titulo text-[28px] leading-tight font-semibold tabular-nums">
                {g(v as number | null)}
                <span className="text-base"> g</span>
              </dd>
              <dt className="text-xs font-bold">{n}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${tarjeta} bg-rosa-claro text-noche`} aria-label="Micronutrientes">
        <p className="text-sm font-bold">Micronutrientes</p>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[15px]">
          {(
            [
              ['Hierro', t.hierro, 'mg', 'hierro'],
              ['Calcio', t.calcio, 'mg', 'calcio'],
              ['Vitamina C', t.vitaminaC, 'mg', 'vitaminaC'],
              ['Potasio', t.potasio, 'mg', 'potasio'],
            ] as const
          ).map(([n, v, u, k]) => (
            <div key={n} className="flex justify-between gap-2">
              <dt>{n}</dt>
              <dd className="font-bold tabular-nums">{v === null ? 'sin dato' : `${inc.has(k) ? '≥ ' : ''}${g(v)} ${u}`}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
