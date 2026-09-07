# innoboxrr-react-form-elements

Gemelo React de [`innoboxrr-form-elements`](../form-elements). Los mismos 29
componentes, con los mismos nombres.

Los nombres coinciden a propósito: `larapack-generator` emite el mismo
`form_component` del `laraimport.json` para Vue y para React, así que un nombre
distinto rompería esa simetría. Hay un test (`tests/parity.test.jsx`) que falla
si un paquete exporta algo que el otro no.

## Instalación

```
npm i innoboxrr-react-form-elements
```

Los estilos van una vez por aplicación:

```js
import 'innoboxrr-react-form-elements/src/css/form-elements.css'
```

## Uso

```jsx
import { TextInputComponent, SelectInputComponent } from 'innoboxrr-react-form-elements'

<TextInputComponent
    type="text"
    name="title"
    label="Título"
    validators="required"
    value={form.title}
    onChange={(value) => setField('title', value)} />

<SelectInputComponent name="status" label="Estado" value={form.status} onChange={...}>
    <option value="">Selecciona</option>
    <option value="draft">Borrador</option>
</SelectInputComponent>
```

## Equivalencias con la versión Vue

| Vue | React |
|---|---|
| `v-model` | `value` + `onChange(valor)` |
| `:custom-class` | `customClass` |
| `min_length` / `max_length` | `minLength` / `maxLength` (se aceptan también los de guion bajo) |
| slot por defecto de `SelectInputComponent` | `children` |
| `@change` de `CountrySelectInputComponent` | `onCountryChange({ phone, country, isValid })` |
| `@submit` / `@selected` de `ModelSearchInputComponent` | `onSubmit` / `onSelected` |
| `install(app)` | no existe: React no tiene plugin de aplicación |

`onChange` recibe el **valor**, no el evento, igual que `update:modelValue`
recibe el valor y no el `$event`. Para el evento del DOM están `onInput`,
`onFocus`, `onBlur`, `onEnter` y `onPaste`.

Todos los controles funcionan también **sin** `value`: se gobiernan solos. Eso
permite montarlos en una prueba o en un formulario no controlado sin escribir
estado alrededor.

## Dependencias opcionales

Tres componentes envuelven librerías pesadas y funcionan sin ellas:

| Componente | Con la librería | Sin ella |
|---|---|---|
| `EditorInputComponent` | `@tinymce/tinymce-react` | `<textarea>` |
| `CodeMirrorComponent` | `@codemirror/*` | `<textarea>` monoespaciado |
| `TextEditorMonoStyleInputComponent` | `@codemirror/*` | igual |

Se cargan con `import()` diferido al runtime: con un literal, Vite las resuelve
en tiempo de build y aborta si no están, que es justo lo contrario de
"opcional".

## Diferencias deliberadas

- **`SelectSearchInputComponent`** no usa `react-select`. El contrato público
  (`options`, `label`, `reduce`, el valor, `onSearch`) es el mismo, y así el
  paquete no arrastra una dependencia de 30 KB para buscar y elegir.
- **`TagsInputComponent`** no usa Tagify, que manipula el DOM por su cuenta. El
  valor de salida —un array de cadenas— es idéntico.
- **`CountrySelectInputComponent`** no usa `vue-tel-input` (es de Vue): la
  lista de prefijos viaja en `src/js/countries.js` y las banderas se calculan
  del ISO como emoji, sin empaquetar imágenes.
- **`DynamicGroupInputComponent`** reordena con la API nativa de arrastre en
  vez de `vuedraggable`.
- **`MultiCheckboxInputComponent`** deriva la selección del valor. La versión
  Vue la recalculaba con `document.querySelectorAll`, así que dos grupos con el
  mismo `id` se pisaban.

## Pruebas

```
npm test
```
