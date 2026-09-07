import { useId, useState } from 'react'
import { applyMask, isMaskSpec } from 'innoboxrr-maskjs'
import Field from './internal/Field.jsx'
import useThemeClass from './internal/useThemeClass.js'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de TextInputComponent.vue.
 *
 * Mismos nombres de prop salvo los que React escribe en camelCase: se aceptan
 * también `min_length` y `max_length` porque son los que declara el laraimport
 * y los que emite el generador de Vue.
 */
export default function TextInputComponent({
    id: providedId = undefined,
    label = '',
    help = null,
    icon = '',
    customClass = undefined,
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
    maskFormat = null,
    value,
    onChange,
    onEnter,
    onInput,
    onFocus,
    onBlur,
    onPaste,
    ...rest
}) {
    const generatedId = useId()
    const uid = providedId ?? generatedId
    const [current, set] = useControlled(value, onChange, '')
    const [showPassword, setShowPassword] = useState(false)
    const inputClass = useThemeClass('input', customClass)

    const isPassword = type === 'password'
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

    const minimum = minLength ?? min_length
    const maximum = maxLength ?? max_length

    const hasIcon = icon !== '' && icon != null

    // El equivalente de la directiva v-format de Vue. Un input controlado no
    // necesita el hook de maskjs: basta con formatear el valor de entrada,
    // porque applyMask es pura e idempotente.
    const masked = isMaskSpec(maskFormat)

    const shown = masked ? applyMask(current, maskFormat).value : (current ?? '')

    return (
        <Field label={label} help={help} htmlFor={uid}>
            {hasIcon ? <span className="fe-field-icon" uk-icon={`icon: ${icon}`}></span> : null}

            <div className="fe-input-wrap">
                <input
                    id={uid}
                    data-uid={uid}
                    className={[inputClass, isPassword ? 'fe-has-toggle' : ''].filter(Boolean).join(' ')}
                    type={effectiveType}
                    name={name}
                    placeholder={placeholder ?? undefined}
                    autoFocus={autoFocus ?? undefined}
                    autoComplete={autoComplete ?? undefined}
                    data-validators={validators ?? undefined}
                    data-mask={masked ? maskFormat.mask : undefined}
                    data-format={masked ? maskFormat.format : undefined}
                    data-min_length={minimum ?? undefined}
                    data-max_length={maximum ?? undefined}
                    min={minimum ?? undefined}
                    max={maximum ?? undefined}
                    step={steps ?? undefined}
                    readOnly={readOnly ?? undefined}
                    value={shown}
                    onKeyUp={(event) => {
                        if (event.key === 'Enter' && onEnter) {
                            onEnter(event)
                        }
                    }}
                    onChange={(event) => {
                        set(masked ? applyMask(event.target.value, maskFormat).value : event.target.value)

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
