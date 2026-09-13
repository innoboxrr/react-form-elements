import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

import ClickToEditComponent from '../src/ClickToEditComponent.jsx'

const start = (container) => {
    fireEvent.click(container.querySelector('button'))

    return container.querySelector('input')
}

describe('ClickToEditComponent', () => {
    it('el valor es un boton, asi que se alcanza con teclado', () => {
        const button = render(<ClickToEditComponent value="Camisa" />).container.querySelector('button')

        expect(button).toHaveTextContent('Camisa')
        expect(button.className).toBe('fe-editable')
        expect(button).toHaveAttribute('aria-label', 'Editar: Camisa')
    })

    it('sin valor muestra el marcador', () => {
        expect(render(<ClickToEditComponent value="" />).container.querySelector('button')).toHaveTextContent('—')
    })

    it('al editar muestra el valor en un campo con el foco', () => {
        const input = start(render(<ClickToEditComponent value="Camisa" />).container)

        expect(input.value).toBe('Camisa')
        expect(document.activeElement).toBe(input)
        expect(input.className).toBe('fe-input')
    })

    it('Enter confirma y avisa del valor', () => {
        const onInput = vi.fn()
        const { container } = render(<ClickToEditComponent value="Camisa" onInput={onInput} />)
        const input = start(container)

        fireEvent.change(input, { target: { value: 'Pantalón' } })
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(onInput.mock.calls).toEqual([['Pantalón']])
        expect(container.querySelector('button')).toHaveTextContent('Pantalón')
    })

    it('salir del campo confirma, igual que en Vue', () => {
        const onInput = vi.fn()
        const { container } = render(<ClickToEditComponent value="Camisa" onInput={onInput} />)
        const input = start(container)

        fireEvent.change(input, { target: { value: 'Pantalón' } })
        fireEvent.blur(input)

        expect(onInput.mock.calls).toEqual([['Pantalón']])
    })

    it('Escape cancela sin avisar', () => {
        const onInput = vi.fn()
        const { container } = render(<ClickToEditComponent value="Camisa" onInput={onInput} />)
        const input = start(container)

        fireEvent.change(input, { target: { value: 'Pantalón' } })
        fireEvent.keyDown(input, { key: 'Escape' })

        expect(onInput).not.toHaveBeenCalled()
        expect(container.querySelector('button')).toHaveTextContent('Camisa')
    })

    it('un valor sin cambios no avisa', () => {
        const onInput = vi.fn()
        const { container } = render(<ClickToEditComponent value="Camisa" onInput={onInput} />)

        fireEvent.keyDown(start(container), { key: 'Enter' })

        expect(onInput).not.toHaveBeenCalled()
    })

    it('con onSave espera a que se guarde antes de cerrar', async () => {
        let release
        const onSave = vi.fn(() => new Promise((resolve) => { release = resolve }))
        const onInput = vi.fn()
        const { container } = render(<ClickToEditComponent value="Camisa" onSave={onSave} onInput={onInput} />)
        const input = start(container)

        fireEvent.change(input, { target: { value: 'Pantalón' } })

        await act(async () => {
            fireEvent.keyDown(input, { key: 'Enter' })
        })

        expect(onSave).toHaveBeenCalledWith('Pantalón')
        expect(container.querySelector('input')).toBeDisabled()
        expect(onInput).not.toHaveBeenCalled()

        await act(async () => {
            release()
        })

        expect(onInput.mock.calls).toEqual([['Pantalón']])
        expect(container.querySelector('button')).toHaveTextContent('Pantalón')
    })

    it('si guardar falla se queda abierto con el error', async () => {
        const onSave = vi.fn(() => Promise.reject(new Error('Sin permiso')))
        const onInput = vi.fn()
        const { container } = render(<ClickToEditComponent value="Camisa" onSave={onSave} onInput={onInput} />)
        const input = start(container)

        fireEvent.change(input, { target: { value: 'Pantalón' } })

        await act(async () => {
            fireEvent.keyDown(input, { key: 'Enter' })
        })

        expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByRole('alert')).toHaveTextContent('Sin permiso')
        expect(onInput).not.toHaveBeenCalled()
    })

    it('sigue al valor que llega de fuera', () => {
        const { container, rerender } = render(<ClickToEditComponent value="Camisa" />)

        rerender(<ClickToEditComponent value="Zapato" />)

        expect(container.querySelector('button')).toHaveTextContent('Zapato')
    })
})
