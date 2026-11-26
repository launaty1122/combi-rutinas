import { useEffect, useState } from 'react'

type Tema = 'claro' | 'oscuro'

// Lee el tema guardado. Si el navegador no deja guardar, usa "claro".
function leerTema(): Tema {
  try {
    return localStorage.getItem('tema') === 'oscuro' ? 'oscuro' : 'claro'
  } catch {
    return 'claro'
  }
}

// Pantalla provisional: solo confirma que la base (colores, letras, tema) funciona.
// Se reemplaza en los siguientes pasos de la Fase 1.
export default function App() {
  const [tema, setTema] = useState<Tema>(leerTema)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try {
      localStorage.setItem('tema', tema)
    } catch {
      /* sin almacenamiento: el tema no se recuerda, pero la app sigue */
    }
  }, [tema])

  return (
    <div className="fondo-hoy flex min-h-dvh flex-col bg-fondo">
      <header className="px-6 pt-8 pb-10 text-fondo-tinta">
        <h1 className="font-titulo text-5xl font-semibold leading-none">Combi Rutinas</h1>
        <p className="mt-2 text-base font-medium">La base está lista.</p>
      </header>
      <main className="flex-1 rounded-t-hoja bg-hoja px-5 pt-6 text-tinta">
        <p className="text-base leading-relaxed text-tinta-suave">
          Aquí irán Hoy, Alacena y Recetas. Prueba el botón para cambiar de tema.
        </p>
        <button
          type="button"
          onClick={() => setTema(tema === 'claro' ? 'oscuro' : 'claro')}
          className="mt-6 h-14 rounded-full bg-limon-verde px-7 font-titulo text-lg font-semibold text-noche transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          {tema === 'claro' ? 'Cambiar a oscuro' : 'Cambiar a claro'}
        </button>
      </main>
    </div>
  )
}
