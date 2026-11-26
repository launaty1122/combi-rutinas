import { useEffect, useState } from 'react'

export type Tema = 'claro' | 'oscuro'

// El tema se recuerda en este celular. Si el navegador no deja guardar, usa "claro".
function leerTema(): Tema {
  try {
    return localStorage.getItem('tema') === 'oscuro' ? 'oscuro' : 'claro'
  } catch {
    return 'claro'
  }
}

export function useTema(): [Tema, (t: Tema) => void] {
  const [tema, setTema] = useState<Tema>(leerTema)
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'oscuro' ? '#0F3D2F' : '#165F47')
    try {
      localStorage.setItem('tema', tema)
    } catch {
      /* sin almacenamiento: no se recuerda, pero funciona */
    }
  }, [tema])
  return [tema, setTema]
}
