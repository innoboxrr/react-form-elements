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

    return (
        <div className="fe-mb">
            <label htmlFor={htmlId} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
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
