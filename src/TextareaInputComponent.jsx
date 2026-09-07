import { useId } from 'react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de TextareaInputComponent.vue.
 */
export default function TextareaInputComponent({
    id: providedId = undefined,
    label = '',
    help = null,
    customClass = null,
    rows = 5,
    name,
    placeholder = null,
    validators = null,
    minLength = null,
    maxLength = null,
    min_length = null,
    max_length = null,
    value,
    onChange,
    ...rest
}) {
    const generatedId = useId()
    const uid = providedId ?? generatedId
    const [current, set] = useControlled(value, onChange, '')

    const minimum = minLength ?? min_length
    const maximum = maxLength ?? max_length

    return (
        <Field label={label} help={help} htmlFor={uid}>
            <textarea
                id={uid}
                className={['uk-textarea uk-form-large uk-border-rounded', customClass].filter(Boolean).join(' ')}
                rows={rows}
                name={name}
                placeholder={placeholder ?? undefined}
                data-validators={validators ?? undefined}
                data-min_length={minimum ?? undefined}
                data-max_length={maximum ?? undefined}
                value={current ?? ''}
                onChange={(event) => set(event.target.value)}
                {...rest}></textarea>
        </Field>
    )
}
