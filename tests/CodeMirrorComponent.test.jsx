import { describe, expect, it, vi } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'

/**
 * Qué módulos de lenguaje ha evaluado el componente. Los mocks delegan en el
 * módulo real, así que el editor se configura de verdad; lo único que añaden
 * es el registro de que alguien los importó.
 *
 * Los módulos se cachean por archivo de pruebas: una vez cargado un lenguaje,
 * sigue cargado en las pruebas siguientes. Por eso cada prueba mira lo que se
 * añade al registro, y el orden de las pruebas importa.
 */
const imported = vi.hoisted(() => [])

vi.mock('@codemirror/lang-html', async (importOriginal) => {
    imported.push('html')
    return importOriginal()
})

vi.mock('@codemirror/lang-css', async (importOriginal) => {
    imported.push('css')
    return importOriginal()
})

vi.mock('@codemirror/lang-javascript', async (importOriginal) => {
    imported.push('javascript')
    return importOriginal()
})

vi.mock('@codemirror/lang-json', async (importOriginal) => {
    imported.push('json')
    return importOriginal()
})

import CodeMirrorComponent from '../src/CodeMirrorComponent.jsx'

const languageOf = (container) => container.querySelector('.cm-content')?.getAttribute('data-language') ?? null

/**
 * El piloto de la aplicación base generó un chunk de 580 kB (200 kB gzip) solo
 * para su editor del sitio, que únicamente edita JSON: el componente importaba
 * de forma estática html, css, javascript y json.
 */
describe('CodeMirrorComponent: lenguajes bajo demanda', () => {
    it('importar el componente no carga ningún lenguaje', () => {
        expect(imported).toEqual([])
    })

    it('el editor funciona como texto plano mientras llega el lenguaje', async () => {
        const { container } = render(<CodeMirrorComponent name="codigo" language="css" value="a { color: red }" />)

        await waitFor(() => expect(container.querySelector('.cm-editor')).not.toBeNull())

        expect(container.querySelector('.cm-content').textContent).toBe('a { color: red }')
        expect(languageOf(container)).toBeNull()

        await waitFor(() => expect(languageOf(container)).toBe('css'))
    })

    it('carga solo el lenguaje pedido', async () => {
        const before = imported.length

        const { container } = render(<CodeMirrorComponent name="codigo" language="json" value='{"a":1}' />)

        await waitFor(() => expect(languageOf(container)).toBe('json'))

        expect(imported.slice(before)).toEqual(['json'])
    })

    it('el lenguaje por defecto sigue siendo javascript', async () => {
        const { container } = render(<CodeMirrorComponent name="codigo" value="const a = 1" />)

        await waitFor(() => expect(languageOf(container)).toBe('javascript'))
    })

    it('un lenguaje que llega tarde no pisa al que se pidió después', async () => {
        const { container, rerender } = render(<CodeMirrorComponent name="codigo" language="html" />)

        rerender(<CodeMirrorComponent name="codigo" language="json" />)

        await waitFor(() => expect(imported).toContain('html'))
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(languageOf(container)).toBe('json')
    })

    /**
     * La lista es cerrada: `constructor` o `__proto__` existen en cualquier
     * objeto, y antes acababan llamados como si fueran un lenguaje.
     */
    it.each(['cobol', 'constructor', '__proto__'])('"%s" deja el editor en texto plano sin lanzar', async (language) => {
        const before = imported.length

        const { container } = render(<CodeMirrorComponent name="codigo" language={language} value="x" />)

        await waitFor(() => expect(container.querySelector('.cm-editor')).not.toBeNull())
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
        })

        expect(languageOf(container)).toBeNull()
        expect(imported.slice(before)).toEqual([])
    })
})
