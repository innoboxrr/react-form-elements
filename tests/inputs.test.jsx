import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import ButtonComponent from '../src/ButtonComponent.jsx'
import CheckboxInputComponent from '../src/CheckboxInputComponent.jsx'
import CodeInputComponent from '../src/CodeInputComponent.jsx'
import FileInputComponent from '../src/FileInputComponent.jsx'
import InputErrorComponent from '../src/InputErrorComponent.jsx'
import MultiCheckboxInputComponent from '../src/MultiCheckboxInputComponent.jsx'
import RadioInputComponent from '../src/RadioInputComponent.jsx'
import SelectInputComponent from '../src/SelectInputComponent.jsx'
import StarsInputComponent from '../src/StarsInputComponent.jsx'
import SwitchComponent from '../src/SwitchComponent.jsx'
import TagsInputComponent from '../src/TagsInputComponent.jsx'
import TextInputComponent from '../src/TextInputComponent.jsx'
import TextareaInputComponent from '../src/TextareaInputComponent.jsx'

/**
 * Un formulario de verdad: el valor vive en el padre, como en el código que
 * genera larapack.
 */
function Controlled({ component: Component, initial = '', ...props }) {
    const [value, setValue] = useState(initial)

    return <Component value={value} onChange={setValue} {...props} />
}

describe('TextInputComponent', () => {
    it('refleja el valor que le llega', () => {
        render(<TextInputComponent type="text" name="title" label="Title" value="hola" onChange={() => {}} />)

        expect(screen.getByLabelText('Title')).toHaveValue('hola')
    })

    it('entrega el valor y no el evento, como update:modelValue', async () => {
        const onChange = vi.fn()

        render(<TextInputComponent type="text" name="title" label="Title" value="" onChange={onChange} />)

        await userEvent.type(screen.getByLabelText('Title'), 'a')

        expect(onChange).toHaveBeenCalledWith('a')
    })

    it('escribe de principio a fin cuando el padre guarda el valor', async () => {
        render(<Controlled component={TextInputComponent} type="text" name="title" label="Title" />)

        await userEvent.type(screen.getByLabelText('Title'), 'Hola mundo')

        expect(screen.getByLabelText('Title')).toHaveValue('Hola mundo')
    })

    it('un campo de contraseña se puede revelar', async () => {
        render(<TextInputComponent type="password" name="secret" label="Secret" value="x" onChange={() => {}} />)

        const input = screen.getByLabelText('Secret')

        expect(input).toHaveAttribute('type', 'password')

        await userEvent.click(screen.getByRole('button', { name: 'Show password' }))

        expect(input).toHaveAttribute('type', 'text')
    })

    it('el boton de la contraseña dice lo que se le pasa', async () => {
        render(<TextInputComponent type="password" name="secret" label="Secret" showPasswordLabel="Mostrar" hidePasswordLabel="Ocultar" />)

        await userEvent.click(screen.getByRole('button', { name: 'Mostrar' }))

        expect(screen.getByRole('button', { name: 'Ocultar' })).toBeInTheDocument()
    })

    /**
     * Los textos de la zona de subida eran fijos en español.
     */
    it('la subida de archivos usa los textos que se le pasan y conserva el resto', () => {
        const { rerender } = render(<FileInputComponent uploadUrl="/upload" labels={{ drop: 'Drop files here' }} />)

        expect(screen.getByText('Drop files here')).toBeInTheDocument()

        rerender(<FileInputComponent uploadUrl="/upload" maxFiles={0} />)

        expect(screen.getByText('Máximo de archivos alcanzado')).toBeInTheDocument()
    })

    /**
     * Sin valor el componente se gobierna solo; si no, React avisa de que un
     * input pasa de no controlado a controlado en cuanto se escribe.
     */
    it('funciona sin value, sin avisos de React', async () => {
        const warn = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(<TextInputComponent type="text" name="title" label="Title" />)

        await userEvent.type(screen.getByLabelText('Title'), 'abc')

        expect(screen.getByLabelText('Title')).toHaveValue('abc')
        expect(warn).not.toHaveBeenCalled()

        warn.mockRestore()
    })

    it('acepta min_length, que es como lo declara el laraimport', () => {
        render(<TextInputComponent type="text" name="title" label="Title" min_length={3} value="" onChange={() => {}} />)

        expect(screen.getByLabelText('Title')).toHaveAttribute('data-min_length', '3')
    })

    it('los ids no chocan entre dos instancias', () => {
        render(
            <>
                <TextInputComponent type="text" name="a" label="A" value="" onChange={() => {}} />
                <TextInputComponent type="text" name="b" label="B" value="" onChange={() => {}} />
            </>
        )

        expect(screen.getByLabelText('A').id).not.toBe(screen.getByLabelText('B').id)
    })
})

describe('SelectInputComponent', () => {
    it('pinta las opciones que recibe como hijos y avisa del valor', async () => {
        const onChange = vi.fn()

        render(
            <SelectInputComponent name="status" label="Status" value="" onChange={onChange}>
                <option value="">Select</option>
                <option value="draft">Borrador</option>
            </SelectInputComponent>
        )

        await userEvent.selectOptions(screen.getByLabelText('Status'), 'draft')

        expect(onChange).toHaveBeenCalledWith('draft')
    })

    it('en modo multiple entrega un array, como el v-model de Vue', async () => {
        const seen = []

        function Multiple() {
            const [value, setValue] = useState([])

            seen.push(value)

            return (
                <SelectInputComponent name="tags" label="Tags" multiple value={value} onChange={setValue}>
                    <option value="a">A</option>
                    <option value="b">B</option>
                </SelectInputComponent>
            )
        }

        render(<Multiple />)

        await userEvent.selectOptions(screen.getByLabelText('Tags'), ['a', 'b'])

        expect(seen.at(-1)).toEqual(['a', 'b'])
    })
})

describe('CheckboxInputComponent', () => {
    /**
     * En Vue el getter devolvia la propia computed, asi que la casilla nunca
     * aparecia marcada a partir del valor enlazado. El gemelo no puede repetir
     * ese fallo.
     */
    it('aparece marcada a partir del valor enlazado', () => {
        render(<CheckboxInputComponent name="published" text="Publicado" value={true} onChange={() => {}} />)

        expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('con un array se comporta como casilla de grupo', async () => {
        const onChange = vi.fn()

        render(<CheckboxInputComponent name="roles" text="Admin" val="admin" value={[]} onChange={onChange} />)

        await userEvent.click(screen.getByRole('checkbox'))

        expect(onChange).toHaveBeenCalledWith(['admin'])
    })

    it('desmarcar quita solo su valor del grupo', async () => {
        const onChange = vi.fn()

        render(<CheckboxInputComponent name="roles" text="Admin" val="admin" value={['admin', 'editor']} onChange={onChange} />)

        await userEvent.click(screen.getByRole('checkbox'))

        expect(onChange).toHaveBeenCalledWith(['editor'])
    })
})

describe('RadioInputComponent', () => {
    it('esta seleccionado cuando el valor coincide con val', () => {
        render(<RadioInputComponent name="tipo" text="A" val="a" value="a" onChange={() => {}} />)

        expect(screen.getByRole('radio')).toBeChecked()
    })

    it('emite su val al elegirlo', async () => {
        const onChange = vi.fn()

        render(<RadioInputComponent name="tipo" text="B" val="b" value="a" onChange={onChange} />)

        await userEvent.click(screen.getByRole('radio'))

        expect(onChange).toHaveBeenCalledWith('b')
    })
})

describe('MultiCheckboxInputComponent', () => {
    /**
     * La version Vue recalculaba la seleccion con document.querySelectorAll,
     * asi que dos grupos con el mismo id se pisaban.
     */
    it('dos grupos con el mismo id no se mezclan', async () => {
        const first = vi.fn()
        const second = vi.fn()
        const options = [{ id: 1, name: 'Uno' }, { id: 2, name: 'Dos' }]

        render(
            <>
                <MultiCheckboxInputComponent id="g" value={[]} options={options} onChange={first} />
                <MultiCheckboxInputComponent id="g" value={[2]} options={options} onChange={second} />
            </>
        )

        await userEvent.click(screen.getAllByLabelText('Uno')[0])

        expect(first).toHaveBeenCalledWith([1])
        expect(second).not.toHaveBeenCalled()
    })
})

describe('SwitchComponent', () => {
    it('refleja y emite un booleano', async () => {
        const onChange = vi.fn()

        render(<SwitchComponent value={false} onChange={onChange} />)

        await userEvent.click(screen.getByRole('checkbox'))

        expect(onChange).toHaveBeenCalledWith(true)
    })
})

describe('StarsInputComponent', () => {
    it('emite la posicion pulsada', async () => {
        const onChange = vi.fn()

        render(<StarsInputComponent value={0} onChange={onChange} />)

        await userEvent.click(screen.getByRole('button', { name: '3' }))

        expect(onChange).toHaveBeenCalledWith(3)
    })

    it('en solo lectura no cambia', async () => {
        const onChange = vi.fn()

        render(<StarsInputComponent value={2} onChange={onChange} readOnly />)

        await userEvent.click(screen.getByRole('button', { name: '4' }))

        expect(onChange).not.toHaveBeenCalled()
    })
})

describe('TagsInputComponent', () => {
    /**
     * Se conduce la instancia real de Tagify —la misma libreria que usa el
     * gemelo Vue— en vez de simular pulsaciones sobre su contenteditable, que
     * en jsdom no tiene cursor y produce resultados que no dicen nada.
     */
    it('entrega un array de cadenas cuando Tagify avisa del cambio', async () => {
        const onChange = vi.fn()
        const tagify = { current: null }

        render(<TagsInputComponent name="tags" label="Tags" value={[]} onChange={onChange} tagifyRef={tagify} />)

        await waitFor(() => expect(tagify.current).not.toBeNull())

        act(() => tagify.current.trigger('change', 'laravel,vue'))

        expect(onChange).toHaveBeenLastCalledWith(['laravel', 'vue'])
    })

    it('un valor vacio es un array vacio y no [""]', async () => {
        const onChange = vi.fn()
        const tagify = { current: null }

        render(<TagsInputComponent name="tags" label="Tags" value={['x']} onChange={onChange} tagifyRef={tagify} />)

        await waitFor(() => expect(tagify.current).not.toBeNull())

        act(() => tagify.current.trigger('change', ''))

        expect(onChange).toHaveBeenLastCalledWith([])
    })

    /**
     * El contrato guarda cadenas, no los objetos {value} de Tagify. La
     * traduccion en la otra direccion la hace originalInputValueFormat.
     */
    it('escribe una cadena separada por comas en el input original', async () => {
        const tagify = { current: null }

        render(<TagsInputComponent name="tags" label="Tags" value={[]} tagifyRef={tagify} />)

        await waitFor(() => expect(tagify.current).not.toBeNull())

        act(() => tagify.current.addTags(['laravel', 'vue']))

        expect(tagify.current.DOM.originalInput.value).toBe('laravel,vue')
    })

    it('no admite duplicados', async () => {
        const tagify = { current: null }

        render(<TagsInputComponent name="tags" label="Tags" value={['laravel']} tagifyRef={tagify} />)

        await waitFor(() => expect(tagify.current).not.toBeNull())

        act(() => tagify.current.addTags(['laravel']))

        expect(tagify.current.value.map((tag) => tag.value)).toEqual(['laravel'])
    })

    it('acepta una cadena separada por comas, como la version Vue', () => {
        render(<TagsInputComponent name="tags" label="Tags" value="a, b" onChange={() => {}} />)

        expect(screen.getByText('a')).toBeInTheDocument()
        expect(screen.getByText('b')).toBeInTheDocument()
    })
})

describe('CodeInputComponent', () => {
    it('reparte un codigo pegado entre las casillas', () => {
        const onComplete = vi.fn()

        render(<CodeInputComponent fields={4} onComplete={onComplete} />)

        fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '1234' } })

        expect(onComplete).toHaveBeenCalledWith('1234')
    })
})

describe('InputErrorComponent', () => {
    it('pinta los mensajes de su campo', () => {
        render(<InputErrorComponent errors={{ title: ['Requerido'] }} type="title" />)

        expect(screen.getByText('Requerido')).toBeInTheDocument()
    })

    it('no pinta nada si no hay errores de ese campo', () => {
        const { container } = render(<InputErrorComponent errors={{ other: ['x'] }} type="title" />)

        expect(container).toBeEmptyDOMElement()
    })
})

describe('ButtonComponent', () => {
    it('usa type submit por defecto, que es lo que espera un formulario', () => {
        render(<ButtonComponent value="Guardar" />)

        expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('type', 'submit')
    })
})

describe('TextareaInputComponent', () => {
    it('emite el valor escrito', async () => {
        render(<Controlled component={TextareaInputComponent} name="payload" label="Payload" />)

        await userEvent.type(screen.getByLabelText('Payload'), 'texto')

        expect(screen.getByLabelText('Payload')).toHaveValue('texto')
    })
})
