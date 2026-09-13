import useControlled from './internal/useControlled.js'
import useThemeClass from './internal/useThemeClass.js'

/**
 * Gemelo de RadioInputComponent.vue. Seleccionado es `value === val`.
 */
export default function RadioInputComponent({
    customClass = undefined,
    name,
    validators = null,
    text = '',
    val,
    value,
    onChange,
    children,
    ...rest
}) {
    const [current, set] = useControlled(value, onChange, '')
    const radioClass = useThemeClass('radio', customClass)
    const labelClass = useThemeClass('label')

    return (
        <div className="fe-mb">
            <label className={labelClass}>
                <input
                    className={radioClass}
                    type="radio"
                    name={name}
                    data-validators={validators ?? undefined}
                    value={val}
                    checked={current === val}
                    onChange={() => set(val)}
                    {...rest} />
                {text}
                {children}
            </label>
        </div>
    )
}
