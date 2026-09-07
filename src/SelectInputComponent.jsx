import { useId } from 'react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de SelectInputComponent.vue. Las opciones van como hijos, igual que
 * el slot por defecto en Vue.
 */
export default function SelectInputComponent({
    label = '',
    help = null,
    customClass = 'uk-select uk-form-large uk-border-rounded',
    name,
    multiple = false,
    size = null,
    validators = null,
    value,
    onChange,
    children,
    ...rest
}) {
    const uid = useId()
    const [current, set] = useControlled(value, onChange, multiple ? [] : '')

    return (
        <Field label={label} help={help} htmlFor={uid}>
            <select
                id={uid}
                className={customClass}
                name={name}
                multiple={multiple}
                data-validators={validators ?? undefined}
                size={size ?? undefined}
                value={current ?? (multiple ? [] : '')}
                onChange={(event) => {
                    // Un select múltiple entrega un array, como el v-model de
                    // Vue: quien lo consume no debería notar la diferencia.
                    set(multiple
                        ? Array.from(event.target.selectedOptions, (option) => option.value)
                        : event.target.value)
                }}
                {...rest}>
                {children}
            </select>
        </Field>
    )
}
