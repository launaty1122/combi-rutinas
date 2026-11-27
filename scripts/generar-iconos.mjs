// Genera los íconos PNG de la app (192, 512 y "maskable") sin programas externos.
// Ícono provisional: fondo verde finca, círculo limón y centro amarillo.
// Cuando tengas tu mascota, se reemplazan estos archivos en public/.
// Uso: node scripts/generar-iconos.mjs
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const publico = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

const FINCA = [0x16, 0x5f, 0x47]
const LIMON_VERDE = [0xae, 0xd1, 0x40]
const LIMON = [0xf6, 0xc8, 0x17]

// CRC32 para los bloques del PNG.
const tabla = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = tabla[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const bloque = (tipo, datos) => {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

/** Dibuja el ícono. "relleno" es el margen seguro (los íconos maskable se recortan en círculo). */
function icono(tam, { esquinas, escala }) {
  const filas = []
  const c = tam / 2
  const rExterior = tam * 0.34 * escala
  const rInterior = tam * 0.13 * escala
  const radio = esquinas ? tam * 0.22 : 0
  for (let y = 0; y < tam; y++) {
    const fila = [0] // filtro "none"
    for (let x = 0; x < tam; x++) {
      // Esquinas redondeadas (transparentes fuera).
      let alfa = 255
      if (radio) {
        const dx = Math.max(radio - x - 0.5, x + 0.5 - (tam - radio), 0)
        const dy = Math.max(radio - y - 0.5, y + 0.5 - (tam - radio), 0)
        const d = Math.hypot(dx, dy)
        alfa = Math.round(255 * Math.min(1, Math.max(0, radio - d + 0.5)))
      }
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c)
      // Mezcla suave en los bordes de los círculos.
      const mezcla = (r) => Math.min(1, Math.max(0, r - d + 0.5))
      let color = FINCA
      const t1 = mezcla(rExterior)
      color = color.map((v, i) => v + (LIMON_VERDE[i] - v) * t1)
      const t2 = mezcla(rInterior)
      color = color.map((v, i) => v + (LIMON[i] - v) * t2)
      fila.push(...color.map(Math.round), alfa)
    }
    filas.push(Buffer.from(fila))
  }
  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(tam, 0)
  cabecera.writeUInt32BE(tam, 4)
  cabecera[8] = 8 // bits por canal
  cabecera[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', deflateSync(Buffer.concat(filas))),
    bloque('IEND', Buffer.alloc(0)),
  ])
}

writeFileSync(join(publico, 'icono-192.png'), icono(192, { esquinas: true, escala: 1 }))
writeFileSync(join(publico, 'icono-512.png'), icono(512, { esquinas: true, escala: 1 }))
// "maskable": sin esquinas y con el dibujo más pequeño, porque Android lo recorta.
writeFileSync(join(publico, 'icono-maskable-512.png'), icono(512, { esquinas: false, escala: 0.8 }))
writeFileSync(join(publico, 'apple-touch-icon.png'), icono(180, { esquinas: false, escala: 1 }))
console.log('Íconos listos en public/')
