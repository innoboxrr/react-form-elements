import useThemeClass from './internal/useThemeClass.js'

/**
 * Gemelo de SingleCheckboxInputComponent.vue.
 *
 * Es el bloque que usa MultiCheckboxInputComponent para cada opción: el estado
 * lo lleva el padre, aquí solo se avisa del cambio.
 */
export default function SingleCheckboxInputComponent({
    id,
    label = '',
    checked = false,
    value = null,
    onCheckedChange,
    ...rest
}) {
    const htmlId = `${id}_${label}`
    const labelClass = useThemeClass('label')

    return (
        <div className="fe-mb">
            <label htmlFor={htmlId} className={labelClass}>
                <input
                    id={htmlId}
                    className="fe-checkbox"
                    type="checkbox"
                    name={`input_${id}`}
                    checked={checked}
                    value={value ?? undefined}
                    onChange={(event) => onCheckedChange?.(event.target.checked)}
                    {...rest} />
                &nbsp;{label}
            </label>
        </div>
    )
}
