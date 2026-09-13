import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'

vi.mock('@iconify/react', () => ({
    Icon: ({ icon, width, height, className, ...rest }) => (
        <svg data-icon={icon} width={width ?? undefined} height={height ?? undefined} className={className ?? undefined} {...rest} />
    ),
}))

const { default: CommandPaletteComponent } = await import('../src/CommandPaletteComponent.jsx')

const items = () => [
    { id: 'products', label: 'Productos', group: 'Ir a', icon: 'box', action: vi.fn() },
    { id: 'settings', label: 'Configuración', group: 'Ir a' },
    { id: 'new', label: 'Nuevo producto', group: 'Crear', shortcut: 'N', keywords: ['alta'] },
]

const palette = (props = {}) => render(<CommandPaletteComponent open items={items()} {...props} />)

const optionsOf = (container) => [...container.querySelectorAll('[role="option"]')]
const labelsOf = (container) => optionsOf(container).map((option) => option.querySelector('span').textContent)

describe('CommandPaletteComponent', () => {
    it('muestra todo, agrupado en el orden en que llega', () => {
        const { container } = palette()

        expect([...container.querySelectorAll('[role="presentation"]')].map((group) => group.textContent)).toEqual(['Ir a', 'Crear'])
        expect(labelsOf(container)).toEqual(['Productos', 'Configuración', 'Nuevo producto'])
        expect(optionsOf(container)[2].querySelector('kbd')).toHaveTextContent('N')
        expect(container.querySelector('dialog').className).toBe('fe-dialog fe-command')
    })

    it('filtra sin distinguir mayusculas ni acentos, y por palabras clave', () => {
        const { container } = palette()
        const input = container.querySelector('input')

        fireEvent.change(input, { target: { value: 'CONFIGURACION' } })
        expect(labelsOf(container)).toEqual(['Configuración'])

        fireEvent.change(input, { target: { value: 'alta' } })
        expect(labelsOf(container)).toEqual(['Nuevo producto'])
    })

    it('sin coincidencias lo dice', () => {
        const { container } = palette()

        fireEvent.change(container.querySelector('input'), { target: { value: 'zzz' } })

        expect(optionsOf(container)).toHaveLength(0)
        expect(container.querySelector('.fe-command-empty')).toHaveTextContent('Sin resultados')
    })

    it('las flechas mueven la seleccion y el buscador la anuncia', () => {
        const { container } = palette()
        const input = container.querySelector('input')

        expect(optionsOf(container)[0]).toHaveAttribute('aria-selected', 'true')

        fireEvent.keyDown(input, { key: 'ArrowDown' })

        expect(optionsOf(container)[1]).toHaveAttribute('aria-selected', 'true')
        expect(input).toHaveAttribute('aria-activedescendant', optionsOf(container)[1].id)

        fireEvent.keyDown(input, { key: 'ArrowUp' })
        fireEvent.keyDown(input, { key: 'ArrowUp' })

        expect(optionsOf(container)[2]).toHaveAttribute('aria-selected', 'true')
    })

    it('Enter ejecuta lo seleccionado y cierra', () => {
        const onSelect = vi.fn()
        const onOpenChange = vi.fn()
        const { container } = palette({ onSelect, onOpenChange })

        fireEvent.keyDown(container.querySelector('input'), { key: 'Enter' })

        const [[chosen]] = onSelect.mock.calls

        expect(chosen.id).toBe('products')
        expect(chosen.action).toHaveBeenCalledWith(chosen)
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('un clic tambien elige', () => {
        const onSelect = vi.fn()
        const { container } = palette({ onSelect })

        fireEvent.click(optionsOf(container)[1])

        expect(onSelect.mock.calls[0][0].id).toBe('settings')
    })

    it('Ctrl+K pide abrirla desde cualquier sitio', () => {
        const onOpenChange = vi.fn()

        palette({ open: false, onOpenChange })

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })

        expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('sin hotkey no hay atajo', () => {
        const onOpenChange = vi.fn()

        palette({ open: false, hotkey: null, onOpenChange })

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true })

        expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('al volver a abrirla el buscador esta vacio', () => {
        const { container, rerender } = palette()

        fireEvent.change(container.querySelector('input'), { target: { value: 'zzz' } })

        rerender(<CommandPaletteComponent open={false} items={items()} />)
        rerender(<CommandPaletteComponent open items={items()} />)

        expect(container.querySelector('input').value).toBe('')
        expect(optionsOf(container)).toHaveLength(3)
    })
})
