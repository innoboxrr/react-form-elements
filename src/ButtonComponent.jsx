/**
 * Gemelo de ButtonComponent.vue.
 *
 * `value` es el texto, como en Vue. Se acepta también `children` para el caso
 * en que haya que meter un icono dentro.
 */
export default function ButtonComponent({
    customClass = 'uk-button uk-width-1-1 button',
    disabled = false,
    value,
    type = 'submit',
    onClick,
    children,
    ...rest
}) {
    return (
        <div className="uk-margin">
            <button
                type={type}
                className={customClass}
                disabled={disabled}
                onClick={onClick}
                {...rest}>
                {children ?? value}
            </button>
        </div>
    )
}
