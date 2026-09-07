import useThemeClass from './internal/useThemeClass.js'

const TOKENS = {
    primary: 'button',
    secondary: 'buttonSecondary',
    danger: 'buttonDanger',
    link: 'buttonLink',
}

/**
 * Gemelo de ButtonComponent.vue.
 *
 * `value` es el texto, como en Vue. Se acepta también `children` para el caso
 * en que haya que meter un icono dentro.
 *
 * `variant` elige el token del tema. Sin él, un formulario generado tendría
 * que escribir la clase del botón secundario a mano, que es justo lo que el
 * tema viene a evitar.
 */
export default function ButtonComponent({
    variant = 'primary',
    customClass = undefined,
    disabled = false,
    value,
    type = 'submit',
    onClick,
    children,
    ...rest
}) {
    const className = useThemeClass(TOKENS[variant] ?? 'button', customClass)

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
