import { useCallback, useId, useMemo } from 'react'
import Select from 'react-select'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de SelectSearchInputComponent.vue.
 *
 * La versión Vue envuelve vue-select; aquí va react-select, que es su
 * equivalente en React: la misma búsqueda, el mismo multiselección, el mismo
 * `appendToBody` (aquí `menuPortalTarget`) y accesibilidad de teclado de
 * serie.
 *
 * El contrato público es el del gemelo Vue: `options`, `label` como nombre de
 * la propiedad que se muestra, `reduce` para quedarse con el valor, y
 * `value` + `onChange(valor)`.
 */
export default function SelectSearchInputComponent({
    id: providedId = undefined,
    inputLabel = '',
    help = null,
    customClass = null,
    name,
    options = [],
    label = 'label',
    placeholder = '',
    clearable = true,
    disabled = false,
    multiple = false,
    appendToBody = false,
    loading = false,
    reduce = (option) => option,
    validators = null,
    value,
    onChange,
    onSearch,
    ...rest
}) {
    const generatedId = useId()
    const uid = providedId ?? generatedId
    const [current, set] = useControlled(value, onChange, multiple ? [] : null)

    const getOptionLabel = useCallback(
        (option) => (typeof option === 'object' && option !== null ? String(option[label] ?? '') : String(option)),
        [label]
    )

    // react-select trabaja con la opcion entera; el contrato guarda solo lo
    // que devuelve reduce. Esta es la traduccion entre los dos, y es la razon
    // de que quien consume el componente no note el cambio de libreria.
    const selected = useMemo(() => {
        if (multiple) {
            const wanted = Array.isArray(current) ? current : []

            return options.filter((option) => wanted.includes(reduce(option)))
        }

        return options.find((option) => reduce(option) === current) ?? null
    }, [options, current, multiple, reduce])

    return (
        <Field label={inputLabel} help={help} htmlFor={uid} inline={false}>
            <Select
                inputId={uid}
                className={customClass ?? undefined}
                classNamePrefix="fe-select"
                options={options}
                getOptionLabel={getOptionLabel}
                getOptionValue={(option) => String(reduce(option))}
                placeholder={placeholder}
                isClearable={clearable}
                isDisabled={disabled}
                isMulti={multiple}
                isLoading={loading}
                aria-label={inputLabel || name}
                // Con `appendToBody` el menu se saca del flujo, que es lo que
                // resuelve los recortes por overflow y los z-index.
                menuPortalTarget={appendToBody && typeof document !== 'undefined' ? document.body : undefined}
                styles={appendToBody ? { menuPortal: (base) => ({ ...base, zIndex: 1015 }) } : undefined}
                value={selected}
                onInputChange={(term, meta) => {
                    if (meta.action === 'input-change') {
                        onSearch?.(term)
                    }

                    return term
                }}
                onChange={(option) => {
                    set(multiple
                        ? (option ?? []).map((item) => reduce(item))
                        : (option ? reduce(option) : null))
                }}
                {...rest} />

            {/* El validador del proyecto lee data-validators del DOM, y
                react-select no expone un input donde ponerlo. */}
            <input type="hidden" name={name} data-validators={validators ?? undefined} value={
                multiple ? (Array.isArray(current) ? current.join(',') : '') : (current ?? '')
            } readOnly />
        </Field>
    )
}
