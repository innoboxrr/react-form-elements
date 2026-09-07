import { useId, useState } from 'react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de TextInputComponent.vue.
 *
 * Mismos nombres de prop salvo los que React escribe en camelCase: se aceptan
 * también `min_length` y `max_length` porque son los que declara el laraimport
 * y los que emite el generador de Vue.
 */
export default function TextInputComponent({
    label = '',
    help = null,
    icon = '',
    customClass = 'uk-input uk-form-large uk-border-rounded',
    type,
    name,
    placeholder = null,
    autoFocus = undefined,
    autoComplete = undefined,
    validators = null,
    minLength = null,
    maxLength = null,
    min_length = null,
    max_length = null,
    steps = null,
    readOnly = undefined,
    value,
    onChange,
    onEnter,
    onInput,
    onFocus,
    onBlur,
    onPaste,
    ...rest
}) {
    const uid = useId()
    const [current, set] = useControlled(value, onChange, '')
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

    const minimum = minLength ?? min_length
    const maximum = maxLength ?? max_length

    const hasIcon = icon !== '' && icon != null

    return (
        <Field label={label} help={help} htmlFor={uid}>
            {hasIcon ? <span className="uk-form-icon" uk-icon={`icon: ${icon}`}></span> : null}

            <div className="fe-input-wrap">
                <input
                    id={uid}
                    data-uid={uid}
                    className={[customClass, isPassword ? 'fe-has-toggle' : ''].filter(Boolean).join(' ')}
                    type={effectiveType}
                    name={name}
                    placeholder={placeholder ?? undefined}
                    autoFocus={autoFocus ?? undefined}
                    autoComplete={autoComplete ?? undefined}
                    data-validators={validators ?? undefined}
                    data-min_length={minimum ?? undefined}
                    data-max_length={maximum ?? undefined}
                    min={minimum ?? undefined}
                    max={maximum ?? undefined}
                    step={steps ?? undefined}
                    readOnly={readOnly ?? undefined}
                    value={current ?? ''}
                    onKeyUp={(event) => {
                        if (event.key === 'Enter' && onEnter) {
                            onEnter(event)
                        }
                    }}
                    onChange={(event) => {
                        set(event.target.value)

                        if (onInput) {
                            onInput(event)
                        }
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onPaste={onPaste}
                    {...rest} />

                {isPassword ? (
                    <button
                        type="button"
                        tabIndex={-1}
                        className="fe-password-toggle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((shown) => ! shown)}>
                        <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                    </button>
                ) : null}
            </div>
        </Field>
    )
}
