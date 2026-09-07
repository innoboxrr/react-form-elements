import useControlled from './internal/useControlled.js'

/**
 * Gemelo de RadioInputComponent.vue. Seleccionado es `value === val`.
 */
export default function RadioInputComponent({
    customClass = null,
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

    return (
        <div className="uk-margin">
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                <input
                    className={['uk-radio', customClass].filter(Boolean).join(' ')}
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
