import { useCallback, useEffect, useState } from 'react'
import { Hoja } from './componentes/Hoja'
import { Icono, type NombreIcono } from './componentes/Icono'
import { agregarAgua } from './db/diario'
import { usePerfil } from './db/perfil'
import { sembrarRecetas } from './db/recetas'
import { hoyISO } from './logica/fechas'
import { Alacena } from './pantallas/alacena/Alacena'
import { Mercado } from './pantallas/alacena/Mercado'
import { Hoy } from './pantallas/hoy/Hoy'
import { Mas } from './pantallas/Mas'
import { Progreso } from './pantallas/progreso/Progreso'
import { Receta } from './pantallas/recetas/Receta'
import { Recetas } from './pantallas/recetas/Recetas'
import { useUbicacion } from './rutas'
import { useTema } from './tema'

type Destino = 'comida' | 'alacena' | null

export default function App() {
  const { ruta, param } = useUbicacion()
  const [tema, setTema] = useTema()
  const perfil = usePerfil()

  // La primera vez, carga el recetario inicial en el celular.
  useEffect(() => {
    sembrarRecetas().catch((e) => console.error('No se pudo cargar el recetario inicial', e))
  }, [])

  // Botón "+" del menú: abre un menú rápido (comida, agua, alacena, mercado).
  const [menuRapido, setMenuRapido] = useState(false)
  const [abrir, setAbrir] = useState<Destino>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const alAgregar = useCallback(() => setMenuRapido(true), [])
  const cerrarAbrir = useCallback(() => setAbrir(null), [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 3000)
    return () => clearTimeout(t)
  }, [aviso])

  const ir = (hash: string, destino: Destino) => {
    setMenuRapido(false)
    window.location.hash = hash
    setAbrir(destino)
  }

  const opciones: { icono: NombreIcono; titulo: string; texto: string; color: string; accion: () => void }[] = [
    { icono: 'hoy', titulo: 'Anotar comida', texto: 'Lo que comiste hoy', color: '#AED140', accion: () => ir('#/hoy', 'comida') },
    {
      icono: 'gota',
      titulo: `Tomé un vaso de agua`,
      texto: `${perfil.vasoMl} ml`,
      color: '#9BD0EC',
      accion: async () => {
        await agregarAgua(hoyISO(), perfil.vasoMl)
        setMenuRapido(false)
        setAviso(`+${perfil.vasoMl} ml de agua`)
      },
    },
    { icono: 'alacena', titulo: 'Agregar a la alacena', texto: 'Lo que compraste', color: '#F9DE7A', accion: () => ir('#/alacena', 'alacena') },
    { icono: 'carrito', titulo: 'Lista del mercado', texto: 'Lo que vas a comprar', color: '#F7A8BC', accion: () => ir('#/alacena/mercado', null) },
  ]

  let pantalla
  if (ruta === 'hoy') pantalla = <Hoy abrirAgregar={abrir === 'comida'} alCerrarAgregar={cerrarAbrir} alAgregar={alAgregar} />
  else if (ruta === 'alacena' && param === 'mercado') pantalla = <Mercado alAgregar={alAgregar} />
  else if (ruta === 'alacena') pantalla = <Alacena abrirAgregar={abrir === 'alacena'} alCerrarAgregar={cerrarAbrir} />
  else if (ruta === 'recetas') pantalla = param ? <Receta id={param} /> : <Recetas alAgregar={alAgregar} />
  else if (ruta === 'mas') pantalla = <Mas tema={tema} setTema={setTema} alAgregar={alAgregar} />
  else pantalla = <Progreso alAgregar={alAgregar} />

  return (
    <>
      {pantalla}
      <Hoja abierta={menuRapido} titulo="¿Qué quieres agregar?" alCerrar={() => setMenuRapido(false)}>
        <ul className="grid grid-cols-2 gap-3">
          {opciones.map((o) => (
            <li key={o.titulo}>
              <button
                type="button"
                onClick={o.accion}
                className="flex h-full min-h-32 w-full flex-col items-start justify-between gap-3 rounded-[26px] p-4 text-left text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
                style={{ background: o.color }}
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-crema/70">
                  <Icono nombre={o.icono} />
                </span>
                <span>
                  <span className="block font-titulo text-lg leading-tight font-semibold">{o.titulo}</span>
                  <span className="block text-[13px]">{o.texto}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Hoja>
      {aviso && (
        <div role="status" className="aviso-entra fixed inset-x-4 bottom-24 z-30 mx-auto max-w-md rounded-full bg-noche px-5 py-3 text-sm font-semibold text-crema dark:bg-crema dark:text-noche">
          {aviso}
        </div>
      )}
    </>
  )
}
