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
import '@yaireo/tagify/dist/tagify.css'          // si usas TagsInputComponent
import 'react-phone-number-input/style.css'      // si usas CountrySelectInputComponent
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
| `v-format` | prop `maskFormat` |
| `@change` de `CountrySelectInputComponent` | `onCountryChange({ phone, country, callingCode, national, isValid })` |
| `@submit` / `@selected` de `ModelSearchInputComponent` | `onSubmit` / `onSelected` |
| `install(app)` | no existe: React no tiene plugin de aplicación |

`onChange` recibe el **valor**, no el evento, igual que `update:modelValue`
recibe el valor y no el `$event`. Para el evento del DOM están `onInput`,
`onFocus`, `onBlur`, `onEnter` y `onPaste`.

Todos los controles funcionan también **sin** `value`: se gobiernan solos. Eso
permite montarlos en una prueba o en un formulario no controlado sin escribir
estado alrededor.

## Las librerías de debajo

Cada componente envuelve el equivalente React de la librería que envuelve su
gemelo Vue. Donde la librería es agnóstica, es literalmente la misma:

| Componente | Vue | React |
|---|---|---|
| `TextInputComponent` (máscara) | `innoboxrr-maskjs/vue` | `innoboxrr-maskjs` — **el mismo motor** |
| `TagsInputComponent` | `@yaireo/tagify` | `@yaireo/tagify/react` — **la misma librería** |
| `EditorInputComponent` | `@tinymce/tinymce-vue` | `@tinymce/tinymce-react` — el envoltorio oficial hermano |
| `CodeMirrorComponent` | `vue-codemirror` | `@uiw/react-codemirror` — el mismo CodeMirror 6 |
| `SelectSearchInputComponent` | `vue-select` | `react-select` |
| `CountrySelectInputComponent` | `vue-tel-input` | `react-phone-number-input` — el mismo `libphonenumber-js` |
| `DynamicGroupInputComponent` | `vuedraggable` | `@dnd-kit/sortable` |
| `ColorPickerInputComponent` | `lightvue` (opcional) | `react-colorful` |

Tres notas sobre esas elecciones:

- **`@dnd-kit`** es el sucesor de `react-beautiful-dnd`, que está archivado. A
  diferencia de SortableJS trae **reordenación por teclado**, así que el asa de
  arrastre es un `<button>` alcanzable con tabulador. Un formulario que solo se
  reordena con el ratón no es accesible.
- **`react-phone-number-input`** valida con `libphonenumber-js`, igual que
  `vue-tel-input`. Sabe cuántos dígitos tiene un número de cada país.
- **`react-colorful`** pesa 2,8 kB y no tiene dependencias. La versión Vue cae
  a `<input type="color">` cuando `lightvue` no está, que abre el diálogo del
  sistema operativo y no se puede estilar ni probar.

## Máscaras

```jsx
<TextInputComponent
    type="text"
    name="phone"
    label="Teléfono"
    maskFormat={{ mask: '(___) ___-____', format: '(***) ***-****' }}
    value={phone}
    onChange={setPhone} />
```

En `format`: `*` es un dígito, `a` una letra, `A` letra o dígito. Todo lo demás
es un literal. Ver [`innoboxrr-maskjs`](../maskjs).

## Diferencias deliberadas

- **`MultiCheckboxInputComponent`** deriva la selección del valor. La versión
  Vue la recalculaba con `document.querySelectorAll`, así que dos grupos con el
  mismo `id` se pisaban.
- **`SelectSearchInputComponent`, `ColorPickerInputComponent`,
  `CodeMirrorComponent` y `EditorInputComponent`** publican su valor en un
  `<input type="hidden">` con el `name` y el `data-validators`. Sus librerías
  no exponen un input donde ponerlos, y el validador del proyecto los lee del
  DOM.
- **Todos aceptan `id`.** Sin eso, pasar un `id` cambiaba el del control pero
  no el `for` de la etiqueta, y la etiqueta quedaba apuntando a la nada.

## Pruebas

```
npm test
```
