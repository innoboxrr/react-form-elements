# Changelog

## 3.8.0 — 2026-09-13

### Cambiado

- **`CodeMirrorComponent` carga el lenguaje bajo demanda.** El piloto de la
  aplicación base generó un chunk de 580 kB (200 kB gzip) para un editor del
  sitio que solo edita JSON: el componente importaba html, css, javascript y
  json de forma estática. Ahora `language` llega con `import()` y cada lenguaje
  es un chunk aparte. Una aplicación que solo monta el editor con
  `language="json"` pasa de descargar 804,6 kB (270,9 kB gzip) a 666,6 kB
  (215,9 kB gzip); html, css y javascript quedan en chunks que nadie pide.
- Mientras llega el lenguaje, el editor funciona como texto plano. `language`
  admite los mismos valores que antes: `javascript` por defecto, `json`, `html`
  y `css`.

### Corregido

- Un `language` fuera de esa lista deja el editor en texto plano sin lanzar.
  Antes `constructor` o `__proto__` encontraban algo en el mapa de lenguajes y
  rompían el editor.

### Sin cambios

- `theme` sigue siendo `dark` (por defecto) o `light`. one-dark sigue en el
  bundle porque lo importa `@uiw/react-codemirror`, no este paquete.
