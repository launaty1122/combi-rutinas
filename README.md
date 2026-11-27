# Combi Rutinas

App personal para organizar la alimentación: alacena, recetario y (más adelante) diario de comidas y agua. Funciona en el celular como una app instalada, sin internet y sin cuentas: todo se guarda en el propio celular.

**La app:** https://launaty1122.github.io/combi-rutinas/

> Estado: **Fase 3 publicada** (progreso con medidas, peso y gráficas; buscador por nutriente; dictado por voz; escáner de código de barras con Open Food Facts). También lee la tabla nutricional con una foto (OCR con Tesseract.js, en el celular; se descarga la primera vez que se usa).

## Qué necesitas en el computador

- **Node.js** (ya está instalado: versión 24). Es el programa que ejecuta las herramientas de la app.
- **Git** (ya está instalado). Guarda el historial de cambios del proyecto.

## Cómo correr la app en tu computador

Abre una terminal en la carpeta del proyecto (`COMIDA APP`) y escribe:

1. Instalar las piezas que usa la app (solo la primera vez, o cuando cambien):

   ```bash
   npm install
   ```

2. Encender la app en modo desarrollo:

   ```bash
   npm run dev
   ```

   Abre en el navegador la dirección que aparece (normalmente `http://localhost:5173`). Mientras la terminal esté abierta, la app se actualiza sola al guardar cambios. Para apagarla: `Ctrl + C`.

## Otros comandos útiles

| Comando | Para qué sirve |
| --- | --- |
| `npm test` | Corre las pruebas automáticas de los cálculos (porciones, nutrición, disponibilidad). |
| `npm run build` | Arma la versión final de la app en la carpeta `dist`, lista para publicar. |
| `npm run preview` | Muestra esa versión final en el navegador, para revisarla antes de publicar. |

## Publicar e instalar en el celular

La app está publicada gratis en **GitHub Pages**: https://launaty1122.github.io/combi-rutinas/

**Cómo se publica un cambio:** al subir el código a GitHub (`git push`), GitHub corre solo las pruebas y, si todas pasan, publica la nueva versión en 1–2 minutos (ver `.github/workflows/publicar.yml`). Si una prueba falla, no se publica nada. El avance se ve en la pestaña **Actions** del repositorio.

**Instalarla en el celular (Android):**

1. Abre el enlace en **Chrome**.
2. Toca el menú **⋮** → **Agregar a la pantalla principal** (o **Instalar app**).
3. Ya aparece con su ícono, como cualquier app, y funciona sin internet.

Cuando hay una versión nueva, la app se actualiza sola la próxima vez que la abres con internet. Tus datos **no** se borran al actualizar: viven en el celular, aparte del código.

**Repositorio público:** cualquiera puede ver el código, pero **no tus datos** (alacena, recetas, comidas), que nunca salen del celular.

## Cómo está organizado el proyecto

```
COMIDA APP/
├─ referencias/     imágenes de inspiración visual
├─ docs/            documentación (por ejemplo, el formato para importar recetas)
├─ public/          ícono de la app
├─ src/
│  ├─ datos/        tabla de alimentos, porciones y recetas iniciales
│  ├─ db/           base de datos del celular (Dexie / IndexedDB)
│  ├─ logica/       cálculos (sin pantallas) y sus pruebas
│  ├─ pantallas/    Hoy, Alacena, Recetas, Más
│  └─ componentes/  botones, tarjetas, barrita, etc.
├─ PRODUCT.md       qué es la app y sus principios
└─ README.md        este archivo
```

## Herramientas que usa

- **Vite + React + TypeScript**: la base de la app.
- **Tailwind CSS**: los estilos (colores, tamaños, redondeos).
- **Dexie.js**: guarda los datos en el celular (IndexedDB).
- **vite-plugin-pwa**: la hace instalable y le permite funcionar sin internet.
- **Vitest**: pruebas automáticas de los cálculos.
- **Fuse.js**: búsqueda tolerante a errores ("platano" encuentra "plátano").
- Letras **Fredoka** y **Figtree**, incluidas en la app para que funcionen sin internet.

## Importar recetas (de TikTok, por ejemplo)

En **Recetas → Importar** está el botón **"Copiar instrucciones para IA"**. Pégalas en tu chat de IA junto con la receta, copia el JSON que te devuelva y pégalo en la app. Los detalles y un ejemplo están en [docs/formato-receta.md](docs/formato-receta.md).

## Backup (¡importante!)

Tus datos viven **solo en el celular**. En **Más → Backup → Exportar** se descarga un archivo `.json` con todo: alacena, recetas, alimentos propios y ajustes. Guárdalo en Drive o mándatelo por correo. Para recuperarlo: **Más → Backup → Importar** (reemplaza lo que haya en la app).

## Recordatorios de agua: qué se puede y qué no

Combi Rutinas es una web app sin servidor (todo vive en el celular). Siendo honestos, así quedan las opciones en Android:

| Opción | ¿Funciona con la app cerrada? | Estado |
| --- | --- | --- |
| **Aviso dentro de la app**: si es de día, vas por debajo de lo esperado a esa hora y llevas más de 2 horas sin anotar agua, Hoy te lo recuerda con un mensaje suave. | No: solo cuando abres la app. | ✅ Hecho |
| Notificaciones programadas desde el celular (Notification Triggers). | Sí, en teoría | ❌ Chrome nunca la lanzó: no existe. |
| Periodic Background Sync. | A veces | ❌ Chrome decide cuándo correrlo (como mucho cada ~12 h y según cuánto uses la app). No sirve para "cada 2 horas". |
| Notificaciones push (como WhatsApp). | Sí | ⏸️ Necesitan un servidor que las envíe. Hay opciones gratuitas (por ejemplo Cloudflare Workers con un horario, o la app **ntfy**), pero agregan un servicio externo. Lo dejamos para después. |

**Mientras tanto, lo más confiable y gratis:** una alarma o recordatorio repetido en el reloj del celular o en Google Calendar ("Toma agua 💧", cada 2 horas de 9 a 21). Al tocarla, abres Combi Rutinas y anotas el vaso con el botón **+**.

## De dónde salen los valores nutricionales

De la **tabla TACO** (Tabela Brasileira de Composição de Alimentos, 4ª ed., NEPA/UNICAMP, 2011), que permite reproducirla citando la fuente. Son 597 alimentos con valores por cada 100 g. Los detalles están en [datos-fuente/taco/FUENTE.md](datos-fuente/taco/FUENTE.md).

- 21 alimentos que TACO no trae (chía, whey, quinoa, yogur griego, mantequilla de maní…) vienen del **USDA FoodData Central** (dominio público). Ver [datos-fuente/usda/FUENTE.md](datos-fuente/usda/FUENTE.md).
- Los nombres originales están en portugués (TACO) o inglés (USDA). Unos 270 alimentos comunes tienen también nombre en español (`src/datos/alias-es.ts`), y se puede buscar en cualquiera de los dos idiomas.
- Las porciones caseras ("1 huevo = 50 g") están en `src/datos/porciones.ts`. Son aproximadas y se pueden editar.
- Si TACO no tiene un dato, la app muestra **"sin dato"**, nunca 0.
- Todos los valores son aproximados: sirven para orientarse, no son una medición exacta.

## Nota honesta

`npm install` muestra 4 avisos de seguridad "moderados". Vienen de una herramienta que solo se usa en el computador, cuando se arma la app (la que prepara el modo sin internet). No llegan al celular. Se revisan de nuevo antes de publicar.
