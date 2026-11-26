/** Quita tildes y pasa a minúsculas: "Plátano" → "platano", "Feijão" → "feijao". */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Muestra un número bonito en español: 1.5 → "1,5", 2 → "2". */
export function formatearNumero(n: number, decimales = 1): string {
  const redondeado = Math.round(n * 10 ** decimales) / 10 ** decimales
  return redondeado.toLocaleString('es', { maximumFractionDigits: decimales })
}
