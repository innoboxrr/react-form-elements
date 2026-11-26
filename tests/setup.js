import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom 27+ trae la regla del navegador que oculta un [popover] cerrado, pero
// no implementa showPopover(): ningún popover se puede abrir y todo lo que
// cuelga de uno queda fuera del árbol accesible. Sin la API, el componente cae
// a `hidden` (como un navegador sin popover), y eso es lo que se prueba aquí.
if (typeof HTMLElement.prototype.showPopover !== 'function') {
    const style = document.createElement('style')

    style.textContent = '[popover]:not([hidden]) { display: block; }'
    document.head.appendChild(style)
}

afterEach(() => {
    cleanup()
})
