import { useCallback, useEffect, useState } from 'react'
import { sembrarRecetas } from './db/recetas'
import { Alacena } from './pantallas/alacena/Alacena'
import { Mercado } from './pantallas/alacena/Mercado'
import { Mas } from './pantallas/Mas'
import { Proximamente } from './pantallas/Proximamente'
import { Receta } from './pantallas/recetas/Receta'
import { Recetas } from './pantallas/recetas/Recetas'
import { useUbicacion } from './rutas'
import { useTema } from './tema'

export default function App() {
  const { ruta, param } = useUbicacion()
  const [tema, setTema] = useTema()

  // La primera vez, carga el recetario inicial en el celular.
  useEffect(() => {
    sembrarRecetas().catch((e) => console.error('No se pudo cargar el recetario inicial', e))
  }, [])

  // El botón "+" del menú: por ahora lleva a "Agregar a la alacena".
  // (En la Fase 2 ofrecerá también agua, alimento y receta.)
  const [abrirAgregar, setAbrirAgregar] = useState(false)
  const alAgregar = useCallback(() => {
    window.location.hash = '#/alacena'
    setAbrirAgregar(true)
  }, [])
  const cerrarAgregar = useCallback(() => setAbrirAgregar(false), [])

  if (ruta === 'alacena' && param === 'mercado') return <Mercado alAgregar={alAgregar} />
  if (ruta === 'alacena') return <Alacena abrirAgregar={abrirAgregar} alCerrarAgregar={cerrarAgregar} />
  if (ruta === 'recetas') return param ? <Receta id={param} /> : <Recetas alAgregar={alAgregar} />
  if (ruta === 'mas') return <Mas tema={tema} setTema={setTema} alAgregar={alAgregar} />
  return <Proximamente ruta={ruta} alAgregar={alAgregar} />
}
