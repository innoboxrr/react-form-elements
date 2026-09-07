import useThemeClass from './internal/useThemeClass.js'

/**
 * Gemelo de ButtonComponent.vue.
 *
 * `value` es el texto, como en Vue. Se acepta también `children` para el caso
 * en que haya que meter un icono dentro.
 */
export default function ButtonComponent({
    customClass = undefined,
    disabled = false,
    value,
    type = 'submit',
    onClick,
    children,
    ...rest
}) {
    const className = useThemeClass('button', customClass)

    return (
        <div className="uk-margin">
            <button
                type={type}
                className={className}
                disabled={disabled}
                onClick={onClick}
                {...rest}>
                {children ?? value}
            </button>
        </div>
    )
}
