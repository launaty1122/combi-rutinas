/** Fecha de hoy en formato AAAA-MM-DD, en la hora local del celular. */
export function hoyISO(ahora: Date = new Date()): string {
  const a = ahora.getFullYear()
  const m = String(ahora.getMonth() + 1).padStart(2, '0')
  const d = String(ahora.getDate()).padStart(2, '0')
  return `${a}-${m}-${d}`
}

/** Días que faltan desde hoy hasta una fecha AAAA-MM-DD (negativo si ya pasó). */
export function diasHasta(fechaISO: string, hoy: string = hoyISO()): number {
  const [a1, m1, d1] = hoy.split('-').map(Number)
  const [a2, m2, d2] = fechaISO.split('-').map(Number)
  const t1 = Date.UTC(a1, m1 - 1, d1)
  const t2 = Date.UTC(a2, m2 - 1, d2)
  return Math.round((t2 - t1) / 86_400_000)
}

/** Texto amable: "venció hace 2 días", "vence hoy", "mañana", "en 3 días". */
export function textoVencimiento(dias: number): string {
  if (dias < -1) return `venció hace ${-dias} días`
  if (dias === -1) return 'venció ayer'
  if (dias === 0) return 'vence hoy'
  if (dias === 1) return 'mañana'
  return `en ${dias} días`
}

/** "25 nov" a partir de AAAA-MM-DD. */
export function fechaCorta(fechaISO: string): string {
  const [a, m, d] = fechaISO.split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('es', { day: 'numeric', month: 'short' }).replace('.', '')
}
