import { href } from '../../rutas'

/** Pestañas de la pantalla Alacena: lo que hay en casa y la lista del mercado. */
export function PestanasAlacena({ activa }: { activa: 'casa' | 'mercado' }) {
  const tabs = [
    { id: 'casa', nombre: 'En casa', href: href('alacena') },
    { id: 'mercado', nombre: 'Mercado', href: href('alacena', 'mercado') },
  ] as const
  return (
    <nav aria-label="Secciones de la alacena" className="grid grid-cols-2 gap-1 rounded-full bg-noche/12 p-1">
      {tabs.map((t) => (
        <a
          key={t.id}
          href={t.href}
          aria-current={activa === t.id ? 'page' : undefined}
          className={`flex h-11 items-center justify-center rounded-full font-bold transition-colors duration-200 ${
            activa === t.id ? 'bg-hoja text-tinta' : 'text-fondo-tinta'
          }`}
        >
          {t.nombre}
        </a>
      ))}
    </nav>
  )
}
