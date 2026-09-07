import useControlled from './internal/useControlled.js'

/**
 * Gemelo de CheckboxInputComponent.vue.
 *
 * Como en Vue, el comportamiento depende del valor enlazado: con un array se
 * comporta como casilla de un grupo y añade o quita `val`; con cualquier otra
 * cosa es un booleano.
 */
export default function CheckboxInputComponent({
    customClass = null,
    name,
    validators = null,
    text = '',
    val = null,
    value,
    onChange,
    children,
    ...rest
}) {
    const [current, set] = useControlled(value, onChange, '')

    const isGroup = Array.isArray(current)
    const checked = isGroup ? current.includes(val) : Boolean(current)

    return (
        <div className="uk-margin">
            <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                <input
                    className={['uk-checkbox', customClass].filter(Boolean).join(' ')}
                    type="checkbox"
                    name={name}
                    data-validators={validators ?? undefined}
                    value={val ?? undefined}
                    checked={checked}
                    onChange={(event) => {
                        if (! isGroup) {
                            set(event.target.checked)

                            return
                        }

                        set(event.target.checked
                            ? [...current, val]
                            : current.filter((item) => item !== val))
                    }}
                    {...rest} />
                {text}
                {children}
            </label>
        </div>
    )
}
