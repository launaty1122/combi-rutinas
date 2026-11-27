// Texto que copia el botón "Copiar instrucciones para IA".
// Mantenerlo igual a docs/formato-receta.md (hay una prueba que revisa que el ejemplo coincida).

export const EJEMPLO_RECETA = {
  nombre: 'Crepioca de pollo y queso',
  porciones: 1,
  minutos: 15,
  ficha:
    'Mitad crepe, mitad tapioca: queda suave por dentro y doradita por fuera. Con pollo y requeijão es un desayuno con mucha proteína.',
  etiquetas: ['cocina:brasileña', 'momento:desayuno', 'dificultad:facil'],
  fuente: 'TikTok de @ejemplo',
  ingredientes: [
    { alimento: 'huevo', gramos: 100, texto: '2 huevos' },
    { alimento: 'goma de tapioca', gramos: 30, texto: '2 cucharadas' },
    { alimento: 'pechuga de pollo cocida', gramos: 60, texto: '½ taza desmechada' },
    { alimento: 'requeijão', gramos: 20, texto: '1 cucharada' },
  ],
  pasos: [
    'Bate los huevos con la goma de tapioca y una pizca de sal.',
    'Vierte en una sartén antiadherente caliente y tapa 2 minutos.',
    'Voltéala, pon el pollo y el requeijão en una mitad y dóblala.',
  ],
}

export function instruccionesParaIA(etiquetasValidas: string[]): string {
  return `Convierte la receta que te paso al final en JSON para mi app "Combi Rutinas". Responde SOLO con el JSON, sin explicaciones.

Reglas:
- "nombre": nombre corto de la receta, en español.
- "porciones": cuántas porciones rinde (número).
- "minutos": tiempo total aproximado (número).
- "ingredientes": lista. Cada uno con:
  - "alimento": nombre simple del alimento en español (ej. "huevo", "arroz blanco cocido", "pechuga de pollo cruda", "leche entera"). Di si está crudo o cocido cuando importe.
  - "gramos": cantidad para TODA la receta, en gramos (o ml si es líquido). Convierte tazas, cucharadas, unidades y "un puñado" a gramos aproximados.
  - "texto": cómo se dice en la receta (ej. "2 huevos", "1 cucharada").
- No incluyas el agua como ingrediente.
- "pasos": lista de pasos cortos y claros, en español.
- "ficha": 1 o 2 frases cálidas sobre qué es el plato y qué aporta (proteína, fibra, energía…). Sin promesas médicas: nada de "quema grasa", "desinflama" ni "cura".
- "etiquetas": elige solo de esta lista las que apliquen: ${etiquetasValidas.join(', ')}.
- "fuente": de dónde salió (por ejemplo "TikTok de @usuario"), si se sabe.

Ejemplo del formato:
${JSON.stringify(EJEMPLO_RECETA, null, 2)}

Esta es la receta:
`
}
