# Combi Rutinas

App personal para organizar la alimentación: alacena, recetario y (más adelante) diario de comidas y agua. Funciona en el celular como una app instalada, sin internet y sin cuentas: todo se guarda en el propio celular.

> Estado: **Fase 1 en construcción.** Por ahora solo está la base (colores, letras, modo claro/oscuro y modo sin internet).

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

*Se completa al final de la Fase 1.* El plan es publicarla gratis en **GitHub Pages** (con HTTPS, que es necesario para instalarla). Después, en el celular: abrir el enlace en Chrome → menú ⋮ → **Agregar a la pantalla principal**.

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

## De dónde salen los valores nutricionales

De la **tabla TACO** (Tabela Brasileira de Composição de Alimentos, 4ª ed., NEPA/UNICAMP, 2011), que permite reproducirla citando la fuente. Son 597 alimentos con valores por cada 100 g. Los detalles están en [datos-fuente/taco/FUENTE.md](datos-fuente/taco/FUENTE.md).

- 21 alimentos que TACO no trae (chía, whey, quinoa, yogur griego, mantequilla de maní…) vienen del **USDA FoodData Central** (dominio público). Ver [datos-fuente/usda/FUENTE.md](datos-fuente/usda/FUENTE.md).
- Los nombres originales están en portugués (TACO) o inglés (USDA). Unos 270 alimentos comunes tienen también nombre en español (`src/datos/alias-es.ts`), y se puede buscar en cualquiera de los dos idiomas.
- Las porciones caseras ("1 huevo = 50 g") están en `src/datos/porciones.ts`. Son aproximadas y se pueden editar.
- Si TACO no tiene un dato, la app muestra **"sin dato"**, nunca 0.
- Todos los valores son aproximados: sirven para orientarse, no son una medición exacta.

## Nota honesta

`npm install` muestra 4 avisos de seguridad "moderados". Vienen de una herramienta que solo se usa en el computador, cuando se arma la app (la que prepara el modo sin internet). No llegan al celular. Se revisan de nuevo antes de publicar.
