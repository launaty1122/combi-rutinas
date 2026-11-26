import { useCallback, useState } from 'react'
import { Alacena } from './pantallas/alacena/Alacena'
import { Mas } from './pantallas/Mas'
import { Proximamente } from './pantallas/Proximamente'
import { useRuta } from './rutas'
import { useTema } from './tema'

export default function App() {
  const ruta = useRuta()
  const [tema, setTema] = useTema()
  // El botón "+" del menú: por ahora lleva a "Agregar a la alacena".
  // (En la Fase 2 ofrecerá también agua, alimento y receta.)
  const [abrirAgregar, setAbrirAgregar] = useState(false)
  const alAgregar = useCallback(() => {
    window.location.hash = '#/alacena'
    setAbrirAgregar(true)
  }, [])
  const cerrarAgregar = useCallback(() => setAbrirAgregar(false), [])

  if (ruta === 'alacena') return <Alacena abrirAgregar={abrirAgregar} alCerrarAgregar={cerrarAgregar} />
  if (ruta === 'mas') return <Mas tema={tema} setTema={setTema} alAgregar={alAgregar} />
  return <Proximamente ruta={ruta} alAgregar={alAgregar} />
}
