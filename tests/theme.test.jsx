import { afterEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { defaultTheme, resetTheme, setTheme } from 'innoboxrr-form-core'

import ButtonComponent from '../src/ButtonComponent.jsx'
import CheckboxInputComponent from '../src/CheckboxInputComponent.jsx'
import InputErrorComponent from '../src/InputErrorComponent.jsx'
import SelectInputComponent from '../src/SelectInputComponent.jsx'
import TextInputComponent from '../src/TextInputComponent.jsx'
import TextareaInputComponent from '../src/TextareaInputComponent.jsx'

afterEach(() => resetTheme())

/**
 * Las clases estaban incrustadas en cada componente como valor por defecto de
 * `customClass`, repetidas en los dos paquetes; y el codigo generado esperaba
 * `inputClass` y `buttonClass` de un mixin global que nadie declaraba.
 *
 * Ahora hay un tema, y estos tests fijan las tres cosas que importan: que se
 * lee, que `customClass` sigue mandando y que un cambio en caliente repinta.
 */
describe('tema', () => {
    it('los controles arrancan con las clases del tema', () => {
        render(<TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />)

        expect(screen.getByLabelText('A')).toHaveClass(...defaultTheme.input.split(' '))
    })

    it('setTheme cambia el aspecto de todo el proyecto', () => {
        setTheme({ input: 'form-control', button: 'btn btn-primary' })

        render(
            <>
                <TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />
                <ButtonComponent value="Guardar" />
            </>
        )

        expect(screen.getByLabelText('A')).toHaveClass('form-control')
        expect(screen.getByRole('button', { name: 'Guardar' })).toHaveClass('btn', 'btn-primary')
    })

    it('customClass sigue mandando para el caso puntual', () => {
        setTheme({ input: 'form-control' })

        render(<TextInputComponent type="text" name="a" label="A" customClass="especial" value="" onChange={() => {}} />)

        expect(screen.getByLabelText('A')).toHaveClass('especial')
        expect(screen.getByLabelText('A')).not.toHaveClass('form-control')
    })

    /**
     * El tema es estado de modulo: leerlo directamente no repintaria nada al
     * cambiarlo con la aplicacion ya montada.
     */
    it('un cambio en caliente repinta lo ya montado', () => {
        render(<TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />)

        expect(screen.getByLabelText('A')).toHaveClass('uk-input')

        act(() => setTheme({ input: 'oscuro' }))

        expect(screen.getByLabelText('A')).toHaveClass('oscuro')
        expect(screen.getByLabelText('A')).not.toHaveClass('uk-input')
    })

    it('alcanza a los envoltorios y a la etiqueta', () => {
        setTheme({ field: 'campo', fieldInner: 'dentro', label: 'etiqueta' })

        const { container } = render(
            <TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />
        )

        expect(container.querySelector('.campo')).not.toBeNull()
        expect(container.querySelector('.dentro')).not.toBeNull()
        expect(container.querySelector('label')).toHaveClass('etiqueta')
    })

    it('alcanza a los mensajes de error', () => {
        setTheme({ error: 'mensaje-error' })

        render(<InputErrorComponent errors={{ a: ['Requerido'] }} type="a" />)

        expect(screen.getByText('Requerido')).toHaveClass('mensaje-error')
    })

    it('cada control lee su propio token', () => {
        setTheme({
            input: 'i',
            select: 's',
            textarea: 't',
            checkbox: 'c',
        })

        render(
            <>
                <TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />
                <SelectInputComponent name="b" label="B" value="" onChange={() => {}} />
                <TextareaInputComponent name="c" label="C" value="" onChange={() => {}} />
                <CheckboxInputComponent name="d" text="D" value={false} onChange={() => {}} />
            </>
        )

        expect(screen.getByLabelText('A')).toHaveClass('i')
        expect(screen.getByLabelText('B')).toHaveClass('s')
        expect(screen.getByLabelText('C')).toHaveClass('t')
        expect(screen.getByRole('checkbox')).toHaveClass('c')
    })

    it('resetTheme vuelve a fabrica', () => {
        setTheme({ input: 'x' })
        resetTheme()

        render(<TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />)

        expect(screen.getByLabelText('A')).toHaveClass('uk-input')
    })
})
