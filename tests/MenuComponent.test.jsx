import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

vi.mock('@iconify/react', () => ({
    Icon: ({ icon, width, height, className, ...rest }) => (
        <svg data-icon={icon} width={width ?? undefined} height={height ?? undefined} className={className ?? undefined} {...rest} />
    ),
}))

/**
 * Floating UI mide el DOM, y jsdom no tiene medidas. Se comprueba que el menú
 * le pide la posición y aplica la que recibe.
 */
vi.mock('@floating-ui/dom', () => ({
    autoUpdate: vi.fn((reference, floating, update) => {
        update()

        return () => {}
    }),
    computePosition: vi.fn(() => Promise.resolve({ x: 10, y: 20 })),
    flip: vi.fn(),
    offset: vi.fn(),
    shift: vi.fn(),
}))

const { default: MenuComponent } = await import('../src/MenuComponent.jsx')

const items = () => [
    { id: 'show', label: 'Ver', icon: 'show', action: vi.fn() },
    { id: 'edit', label: 'Editar', icon: 'edit', shortcut: 'E' },
    { separator: true },
    { group: 'Peligro' },
    { id: 'delete', label: 'Eliminar', icon: 'delete', danger: true, disabled: true, disabledReason: 'Sin permiso' },
]

const trigger = () => screen.getByRole('button', { name: 'Acciones' })
const menuOf = (container) => container.querySelector('[popover]')
const itemsOf = (container) => container.querySelectorAll('[role="menuitem"]')

const open = async () => {
    await act(async () => {
        fireEvent.click(trigger())
    })
}

describe('MenuComponent', () => {
    it('empieza cerrado', () => {
        const { container } = render(<MenuComponent items={items()} />)

        expect(trigger()).toHaveAttribute('aria-expanded', 'false')
        expect(menuOf(container)).toHaveAttribute('hidden')
    })

    it('abre junto al boton y lleva el foco al primer elemento usable', async () => {
        const { container } = render(<MenuComponent items={items()} />)

        await open()

        expect(trigger()).toHaveAttribute('aria-expanded', 'true')
        expect(menuOf(container)).not.toHaveAttribute('hidden')
        await waitFor(() => expect(menuOf(container).style.left).toBe('10px'))
        expect(document.activeElement).toHaveTextContent('Ver')
    })

    it('elegir un elemento lo ejecuta, lo avisa y cierra', async () => {
        const onSelect = vi.fn()
        const { container } = render(<MenuComponent items={items()} onSelect={onSelect} />)

        await open()
        fireEvent.click(itemsOf(container)[0])

        const [[chosen]] = onSelect.mock.calls

        expect(chosen.id).toBe('show')
        expect(chosen.action).toHaveBeenCalledWith(chosen)
        expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('un elemento sin permiso se ve, se explica y no hace nada', async () => {
        const onSelect = vi.fn()
        const { container } = render(<MenuComponent items={items()} onSelect={onSelect} />)

        await open()

        const eliminar = itemsOf(container)[2]

        expect(eliminar).toHaveAttribute('aria-disabled', 'true')
        expect(eliminar).toHaveAttribute('data-tooltip', 'Sin permiso')
        expect(eliminar.className).toBe('fe-menu-item fe-menu-item-danger')

        fireEvent.click(eliminar)

        expect(onSelect).not.toHaveBeenCalled()
    })

    it('pinta separadores, etiquetas y atajos con el tema', () => {
        const { container } = render(<MenuComponent items={items()} />)

        expect(container.querySelector('[role="separator"]').className).toBe('fe-menu-separator')
        expect(container.querySelector('[role="presentation"]')).toHaveTextContent('Peligro')
        expect(container.querySelector('kbd').className).toBe('fe-kbd')
        expect(menuOf(container).className).toBe('fe-menu')
    })

    it('las flechas recorren solo lo que se puede usar', async () => {
        const { container } = render(<MenuComponent items={items()} />)

        await open()

        fireEvent.keyDown(menuOf(container), { key: 'ArrowDown' })
        expect(document.activeElement).toHaveTextContent('Editar')

        fireEvent.keyDown(menuOf(container), { key: 'ArrowDown' })
        expect(document.activeElement).toHaveTextContent('Ver')

        fireEvent.keyDown(menuOf(container), { key: 'End' })
        expect(document.activeElement).toHaveTextContent('Editar')
    })

    it('espera a beforeOpen antes de abrir', async () => {
        let release
        const beforeOpen = vi.fn(() => new Promise((resolve) => { release = resolve }))

        render(<MenuComponent items={items()} beforeOpen={beforeOpen} />)

        await act(async () => {
            fireEvent.click(trigger())
        })

        expect(beforeOpen).toHaveBeenCalled()
        expect(trigger()).toHaveAttribute('aria-expanded', 'false')
        expect(trigger()).toBeDisabled()

        await act(async () => {
            release()
        })

        expect(trigger()).toHaveAttribute('aria-expanded', 'true')
    })

    it('Escape cierra', async () => {
        const { container } = render(<MenuComponent items={items()} />)

        await open()
        fireEvent.keyDown(menuOf(container), { key: 'Escape' })

        expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })
})
