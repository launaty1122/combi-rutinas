# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Propuesto en el brief de la usuaria (pendiente de aprobación final): Vite + React + TypeScript, Tailwind CSS, Dexie.js (IndexedDB), vite-plugin-pwa, Vitest, Fuse.js para búsqueda tolerante. Recharts en Fase 3. Hosting: GitHub Pages (propuesto).

## Users
Una sola persona: mujer de 25 años que vive en Minas Gerais (Brasil), entrena 3–5 días por semana y cocina en casa. Usa la app en el celular Android, en la cocina o en el mercado, con una mano.

## Product Purpose
Combi Rutinas ayuda a alimentarse bien sin hacer dieta: saber qué hay en casa, encontrar qué cocinar con eso, llegar a las metas de proteína (≈100 g), fibra (25 g) y agua, y tener un recetario grande y bien organizado. El éxito es sentirse bien, beber agua y "aprender a amarme cada vez un poco más". No se trata de un número en la báscula.

## Positioning
Es una herramienta personal y sin publicidad que parte de la alacena real: "¿Qué puedo cocinar ya?" y "Cociné esto", que descuenta de la alacena. Funciona sin internet, no tiene funciones de pago y no usa lenguaje de dieta.

## Operating Context
Se usa todos los días, en ratos cortos: al volver del mercado (registrar compras), antes de cocinar (elegir receta) y después de comer (Fase 2). Recetas de TikTok se convierten a JSON con una IA externa y se importan.

## Capabilities and Constraints
PWA instalable y offline. Los datos solo están en el celular (IndexedDB), con backup JSON obligatorio. No hay backend, servicios pagos ni claves de API en las fases 1–3. Usa la tabla TACO (nombres en portugués + alias en español). Todo se guarda en gramos o mililitros, con porciones con nombre. Fase 1: Alacena + Recetario. Fase 2: Diario + Agua. Fase 3: Progreso + extras.

## Brand Commitments
- Nombre: **Combi Rutinas**.
- Tema claro por defecto, con interruptor a oscuro; los dos se diseñan desde el inicio.
- Referencias visuales dadas por la usuaria (en la raíz del proyecto): línea negra gruesa estilo tatuaje "flash" / hojas de stickers, rellenos planos, apps en neobrutalismo pastel, formas orgánicas, anillo de salud segmentado. De las referencias se toma el estilo, no los motivos.
- Mascota e ilustraciones: las dibuja la usuaria (Affinity → SVG). No se inventan ilustraciones que las reemplacen.
- Voz: neutral, cálida y amable. Sin culpa, sin alertas rojas por "pasarse", sin promesas médicas.

## Evidence on Hand
Brief completo de la usuaria (fases, modelo de datos, reglas de etiquetas). Las imágenes de referencia están en la raíz del proyecto. Las recetas propias de la usuaria todavía no se han entregado. Los valores nutricionales de ejemplo en los mockups son ilustrativos.

## Product Principles
1. La alacena real manda: todo empieza por lo que hay en casa.
2. Registrar debe costar segundos; si no, se abandona.
3. Proteína, fibra y agua al frente; las calorías se pueden esconder.
4. Cariño, no control: cada texto acompaña y ninguno regaña.
5. Lo que la app muestre debe ser cierto: si no hay dato, dice "sin dato", nunca 0.

## Accessibility & Inclusion
Botones grandes para el pulgar (≥44 px), buen contraste en claro y oscuro, y etiquetas en los botones que solo tienen ícono. Interfaz en español.
