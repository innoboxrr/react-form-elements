import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import CodeMirrorComponent from '../src/CodeMirrorComponent.jsx'
import ColorPickerInputComponent from '../src/ColorPickerInputComponent.jsx'
import CountrySelectInputComponent from '../src/CountrySelectInputComponent.jsx'
import DynamicGroupInputComponent from '../src/DynamicGroupInputComponent.jsx'
import SelectSearchInputComponent from '../src/SelectSearchInputComponent.jsx'
import TextInputComponent from '../src/TextInputComponent.jsx'
import TimezoneSelectInputComponent from '../src/TimezoneSelectInputComponent.jsx'

/**
 * Cuatro componentes de la version Vue envuelven librerias que no existen en
 * React. Estos tests fijan que el contrato publico —`options`, `reduce`,
 * `value`/`onChange`, la forma de lo que se emite— sigue siendo el mismo
 * ahora que por debajo hay react-select, react-colorful,
 * react-phone-number-input y dnd-kit.
 */

const OPTIONS = [
    { id: 1, nombre: 'Primero' },
    { id: 2, nombre: 'Segundo' },
    { id: 3, nombre: 'Tercero' },
]

describe('SelectSearchInputComponent (react-select)', () => {
    const renderSelect = (props = {}) => render(
        <SelectSearchInputComponent
            name="modelo"
            inputLabel="Modelo"
            options={OPTIONS}
            label="nombre"
            reduce={(option) => option.id}
            {...props} />
    )

    it('muestra la opcion cuyo reduce coincide con el valor', () => {
        renderSelect({ value: 2, onChange: () => {} })

        expect(screen.getByText('Segundo')).toBeInTheDocument()
    })

    it('emite el valor reducido, no la opcion entera', async () => {
        const onChange = vi.fn()

        renderSelect({ value: null, onChange })

        await userEvent.click(screen.getByRole('combobox'))
        await userEvent.click(await screen.findByText('Tercero'))

        expect(onChange).toHaveBeenCalledWith(3)
    })

    it('filtra al escribir y avisa de la busqueda', async () => {
        const onSearch = vi.fn()

        renderSelect({ value: null, onChange: () => {}, onSearch })

        await userEvent.type(screen.getByRole('combobox'), 'Seg')

        expect(onSearch).toHaveBeenCalledWith('Seg')

        await waitFor(() => expect(screen.getByText('Segundo')).toBeInTheDocument())
        expect(screen.queryByText('Primero')).not.toBeInTheDocument()
    })

    it('en modo multiple entrega un array de valores reducidos', async () => {
        function Multiple() {
            const [value, setValue] = useState([])

            return (
                <SelectSearchInputComponent
                    name="modelos"
                    inputLabel="Modelos"
                    options={OPTIONS}
                    label="nombre"
                    reduce={(option) => option.id}
                    multiple
                    value={value}
                    onChange={setValue} />
            )
        }

        render(<Multiple />)

        await userEvent.click(screen.getByRole('combobox'))
        await userEvent.click(await screen.findByText('Primero'))
        await userEvent.click(screen.getByRole('combobox'))
        await userEvent.click(await screen.findByText('Tercero'))

        // El valor viaja en el input oculto que lee el validador del proyecto.
        expect(document.querySelector('input[type="hidden"][name="modelos"]')).toHaveValue('1,3')
    })

    /**
     * react-select no expone un input donde poner data-validators, y el
     * validador del proyecto lo lee del DOM.
     */
    it('publica el valor y los validadores en un input oculto', () => {
        renderSelect({ value: 2, onChange: () => {}, validators: 'required' })

        const hidden = document.querySelector('input[type="hidden"][name="modelo"]')

        expect(hidden).toHaveValue('2')
        expect(hidden).toHaveAttribute('data-validators', 'required')
    })
})

describe('TimezoneSelectInputComponent', () => {
    it('trae la lista IANA y emite la cadena de la zona', async () => {
        const onChange = vi.fn()

        render(<TimezoneSelectInputComponent name="tz" label="Zona" value={null} onChange={onChange} />)

        await userEvent.type(screen.getByRole('combobox'), 'Mexico_City')
        await userEvent.click(await screen.findByText('America/Mexico_City'))

        expect(onChange).toHaveBeenCalledWith('America/Mexico_City')
    })
})

describe('ColorPickerInputComponent (react-colorful)', () => {
    it('refleja el color que le llega', () => {
        render(<ColorPickerInputComponent name="color" label="Color" value="#FF0000" onChange={() => {}} />)

        expect(document.querySelector('input[type="hidden"][name="color"]')).toHaveValue('#FF0000')
    })

    it('la paleta emite el color elegido', async () => {
        const onChange = vi.fn()

        render(<ColorPickerInputComponent name="color" label="Color" value="" onChange={onChange} />)

        await userEvent.click(screen.getByRole('button', { name: '#4CAF50' }))

        expect(onChange).toHaveBeenCalledWith('#4CAF50')
    })

    it('se puede limpiar', async () => {
        const onChange = vi.fn()

        render(<ColorPickerInputComponent name="color" label="Color" value="#FF0000" onChange={onChange} />)

        await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }))

        expect(onChange).toHaveBeenCalledWith('')
    })
})

describe('CountrySelectInputComponent (react-phone-number-input)', () => {
    /**
     * La lista de prefijos escrita a mano validaba cualquier cosa de 6 a 15
     * digitos. libphonenumber sabe cuantos digitos tiene un numero de cada
     * pais.
     */
    it('valida con libphonenumber y no por longitud', async () => {
        const onCountryChange = vi.fn()

        render(
            <CountrySelectInputComponent
                label="Teléfono"
                defaultCountry="MX"
                onCountryChange={onCountryChange} />
        )

        await userEvent.type(screen.getByRole('textbox'), '5512345678')

        await waitFor(() => expect(onCountryChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ isValid: true, country: 'MX', callingCode: '52' })
        ))
    })

    it('un numero incompleto no se da por valido', async () => {
        const onCountryChange = vi.fn()

        render(
            <CountrySelectInputComponent
                label="Teléfono"
                defaultCountry="MX"
                onCountryChange={onCountryChange} />
        )

        await userEvent.type(screen.getByRole('textbox'), '55')

        expect(onCountryChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ isValid: false, phone: '' })
        )
    })

    it('deja elegir pais', async () => {
        render(<CountrySelectInputComponent label="Teléfono" defaultCountry="MX" onCountryChange={() => {}} />)

        expect(screen.getByRole('combobox')).toHaveValue('MX')
    })
})

describe('DynamicGroupInputComponent (dnd-kit)', () => {
    const CONFIG = [{ key: 'titulo', type: 'text', label: 'Título' }]

    it('anade y quita grupos', async () => {
        function Groups() {
            const [value, setValue] = useState([])

            return <DynamicGroupInputComponent inputsConfig={CONFIG} value={value} onChange={setValue} />
        }

        render(<Groups />)

        await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))
        await userEvent.click(screen.getByRole('button', { name: 'Añadir' }))

        expect(screen.getAllByText(/Item #/)).toHaveLength(2)

        await userEvent.click(screen.getByRole('button', { name: 'Eliminar 1' }))

        expect(screen.getAllByText(/Item #/)).toHaveLength(1)
    })

    it('escribe en el campo del grupo correcto', async () => {
        function Groups() {
            const [value, setValue] = useState([{ titulo: '' }, { titulo: '' }])

            return <DynamicGroupInputComponent inputsConfig={CONFIG} value={value} onChange={setValue} />
        }

        render(<Groups />)

        const campos = screen.getAllByLabelText('Título')

        await userEvent.type(campos[1], 'Segundo')

        expect(campos[0]).toHaveValue('')
        expect(campos[1]).toHaveValue('Segundo')
    })

    it('duplicar copia el contenido', async () => {
        function Groups() {
            const [value, setValue] = useState([{ titulo: 'Original' }])

            return <DynamicGroupInputComponent inputsConfig={CONFIG} value={value} onChange={setValue} />
        }

        render(<Groups />)

        await userEvent.click(screen.getByRole('button', { name: 'Duplicar Item 1' }))

        const campos = screen.getAllByLabelText('Título')

        expect(campos).toHaveLength(2)
        expect(campos[1]).toHaveValue('Original')
    })

    /**
     * dnd-kit trae reordenacion por teclado; la API nativa de arrastre no.
     * Un formulario que solo se reordena con el raton no es accesible.
     */
    it('el asa de arrastre es un boton, alcanzable con el teclado', async () => {
        function Groups() {
            const [value, setValue] = useState([{ titulo: 'A' }])

            return <DynamicGroupInputComponent inputsConfig={CONFIG} value={value} onChange={setValue} />
        }

        render(<Groups />)

        const asa = screen.getByRole('button', { name: 'Mover Item 1' })

        expect(asa).toHaveAttribute('tabindex', '0')
        expect(asa).toHaveAttribute('role', 'button')
    })
})

describe('TextInputComponent con mascara', () => {
    const PHONE = { mask: '(___) ___-____', format: '(***) ***-****' }

    it('formatea mientras se escribe', async () => {
        function Masked() {
            const [value, setValue] = useState('')

            return (
                <TextInputComponent
                    type="text"
                    name="phone"
                    label="Teléfono"
                    maskFormat={PHONE}
                    value={value}
                    onChange={setValue} />
            )
        }

        render(<Masked />)

        await userEvent.type(screen.getByLabelText('Teléfono'), '5512345678')

        expect(screen.getByLabelText('Teléfono')).toHaveValue('(551) 234-5678')
    })

    /**
     * Pegar el numero entero es el caso que la version 1.x de maskjs se comia:
     * devolvia '(524) 6__-____'.
     */
    it('pegar el numero entero lo coloca completo', async () => {
        const onChange = vi.fn()

        render(
            <TextInputComponent
                type="text"
                name="phone"
                label="Teléfono"
                maskFormat={PHONE}
                value=""
                onChange={onChange} />
        )

        await userEvent.click(screen.getByLabelText('Teléfono'))
        await userEvent.paste('5512345678')

        expect(onChange).toHaveBeenLastCalledWith('(551) 234-5678')
    })

    it('sin mascara el valor pasa tal cual', async () => {
        const onChange = vi.fn()

        render(<TextInputComponent type="text" name="libre" label="Libre" value="" onChange={onChange} />)

        await userEvent.type(screen.getByLabelText('Libre'), '(')

        expect(onChange).toHaveBeenCalledWith('(')
    })

    it('anota la mascara en el DOM', () => {
        render(
            <TextInputComponent
                type="text"
                name="phone"
                label="Teléfono"
                maskFormat={PHONE}
                value=""
                onChange={() => {}} />
        )

        const input = screen.getByLabelText('Teléfono')

        expect(input).toHaveAttribute('data-mask', PHONE.mask)
        expect(input).toHaveAttribute('data-format', PHONE.format)
    })
})

describe('CodeMirrorComponent (@uiw/react-codemirror)', () => {
    it('monta el editor con el valor', async () => {
        const { container } = render(
            <CodeMirrorComponent name="codigo" label="Código" language="json" value='{"a":1}' onChange={() => {}} />
        )

        await waitFor(() => expect(container.querySelector('.cm-editor')).not.toBeNull())

        expect(within(container.querySelector('.cm-content')).getByText(/"a"/)).toBeInTheDocument()
    })

    it('publica el valor y los validadores en un input oculto', () => {
        render(<CodeMirrorComponent name="codigo" label="Código" validators="required" value="x" onChange={() => {}} />)

        const hidden = document.querySelector('input[type="hidden"][name="codigo"]')

        expect(hidden).toHaveValue('x')
        expect(hidden).toHaveAttribute('data-validators', 'required')
    })
})
