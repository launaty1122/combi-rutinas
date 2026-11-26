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

## Nota honesta

`npm install` muestra 4 avisos de seguridad "moderados". Vienen de una herramienta que solo se usa en el computador, cuando se arma la app (la que prepara el modo sin internet). No llegan al celular. Se revisan de nuevo antes de publicar.
