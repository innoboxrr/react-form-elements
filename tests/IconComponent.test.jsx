import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { defaultIcons, resetIcons, setIcons } from 'innoboxrr-form-core'

/**
 * El `Icon` de @iconify/react dibuja un `<svg>` vacio cuando no tiene los
 * datos del icono —y en las pruebas no los tiene, porque los pide por red—.
 * Con un doble se comprueba lo que este componente si decide: que nombre
 * resuelve y con que atributos lo pinta.
 *
 * Es el mismo doble que usa la rama Vue, y los tests afirman lo mismo: si las
 * dos ramas dejaran de resolver igual, aqui se veria.
 */
vi.mock('@iconify/react', () => ({
    // El Icon real reenvia al svg los props que no conoce —aria-hidden entre
    // ellos—, asi que el doble tiene que hacer lo mismo o el test mediria el
    // doble en vez del componente.
    Icon: ({ icon, width, height, className, ...rest }) => (
        <svg
            data-icon={icon}
            width={width ?? undefined}
            height={height ?? undefined}
            className={className ?? undefined}
            {...rest} />
    ),
}))

const { default: IconComponent } = await import('../src/IconComponent.jsx')

afterEach(() => resetIcons())

const iconOf = (container) => container.querySelector('svg').getAttribute('data-icon')

describe('IconComponent', () => {
    it('resuelve el nombre semantico contra el mapa', () => {
        const { container } = render(<IconComponent name="plus" />)

        expect(iconOf(container)).toBe(defaultIcons.plus)
    })

    it('deja pasar un nombre de Iconify tal cual', () => {
        const { container } = render(<IconComponent name="mdi:home" />)

        expect(iconOf(container)).toBe('mdi:home')
    })

    it('un cambio de mapa en caliente repinta lo ya montado', () => {
        const { container } = render(<IconComponent name="plus" />)

        act(() => {
            setIcons({ plus: 'lucide:plus' })
        })

        expect(iconOf(container)).toBe('lucide:plus')
    })

    it('el tamano es opcional y se pasa a lo alto y a lo ancho', () => {
        const { container } = render(<IconComponent name="plus" size={24} />)
        const svg = container.querySelector('svg')

        expect(svg.getAttribute('width')).toBe('24')
        expect(svg.getAttribute('height')).toBe('24')
    })

    it('se oculta a los lectores de pantalla', () => {
        const { container } = render(<IconComponent name="plus" />)

        expect(container.querySelector('svg').getAttribute('aria-hidden')).toBe('true')
    })

    it('admite una clase propia para el caso puntual', () => {
        const { container } = render(<IconComponent name="plus" className="text-red-600" />)

        expect(container.querySelector('svg').getAttribute('class')).toBe('text-red-600')
    })
})
