import { useId } from 'react'
import Field from './internal/Field.jsx'
import useThemeClass from './internal/useThemeClass.js'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de SelectInputComponent.vue. Las opciones van como hijos, igual que
 * el slot por defecto en Vue.
 */
export default function SelectInputComponent({
    id: providedId = undefined,
    label = '',
    help = null,
    customClass = undefined,
    name,
    multiple = false,
    size = null,
    validators = null,
    value,
    onChange,
    children,
    ...rest
}) {
    const generatedId = useId()
    const uid = providedId ?? generatedId
    const [current, set] = useControlled(value, onChange, multiple ? [] : '')
    const selectClass = useThemeClass('select', customClass)

    return (
        <Field label={label} help={help} htmlFor={uid}>
            <select
                id={uid}
                className={selectClass}
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
