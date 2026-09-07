import { useCallback, useId, useMemo, useRef } from 'react'
import Tags from '@yaireo/tagify/react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de TagsInputComponent.vue.
 *
 * Es literalmente la misma librería que usa la versión Vue —Tagify—, con su
 * envoltorio oficial de React. Eso mantiene el mismo comportamiento, el mismo
 * marcado y la misma hoja de estilos (`@yaireo/tagify/dist/tagify.css`), que
 * es lo que importa para que un formulario generado se vea igual en los dos
 * frameworks.
 *
 * El valor sigue siendo un array de cadenas, como en Vue. Acepta también una
 * cadena separada por comas.
 */
export default function TagsInputComponent({
    id: providedId = undefined,
    label = '',
    help = null,
    customClass = 'uk-input uk-form-large uk-border-rounded',
    name,
    placeholder = '',
    validators = null,
    whitelist = undefined,
    maxTags = undefined,
    duplicates = false,
    value,
    onChange,
    tagifyRef,
}) {
    const generatedId = useId()
    const uid = providedId ?? generatedId
    const [current, set] = useControlled(value, onChange, [])
    const latest = useRef(null)

    latest.current = set

    const tags = useMemo(() => (
        Array.isArray(current)
            ? current
            : String(current ?? '').split(',').map((tag) => tag.trim()).filter(Boolean)
    ), [current])

    const settings = useMemo(() => {
        const options = {
            placeholder,
            duplicates,
            // Tagify emite objetos {value}; el contrato guarda cadenas.
            originalInputValueFormat: (values) => values.map((tag) => tag.value).join(','),
        }

        // Tagify no distingue "no lo pases" de "pasalo como undefined": con
        // whitelist a undefined revienta al filtrar sugerencias.
        if (whitelist !== undefined) {
            options.whitelist = whitelist
        }

        if (maxTags !== undefined) {
            options.maxTags = maxTags
        }

        return options
    }, [placeholder, whitelist, maxTags, duplicates])

    const onTagifyChange = useCallback((event) => {
        const raw = event.detail?.value ?? ''

        latest.current(raw ? raw.split(',').map((tag) => tag.trim()).filter(Boolean) : [])
    }, [])

    return (
        <Field label={label} help={help} htmlFor={uid}>
            <Tags
                id={uid}
                name={name}
                className={customClass}
                data-validators={validators ?? undefined}
                settings={settings}
                value={tags}
                tagifyRef={tagifyRef}
                onChange={onTagifyChange} />
        </Field>
    )
}
