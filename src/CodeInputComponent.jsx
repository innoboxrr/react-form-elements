import { useRef, useState } from 'react'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de CodeInputComponent.vue: las casillas de un código de un solo uso.
 *
 * `onChange` recibe el código completo, y `onComplete` se dispara cuando están
 * todas las casillas llenas — que es cuando el formulario quiere enviarlo.
 */
export default function CodeInputComponent({
    fields = 6,
    fieldWidth = 40,
    fieldHeight = 40,
    title = null,
    className = '',
    required = false,
    disabled = false,
    autoFocus = false,
    value,
    onChange,
    onComplete,
}) {
    const [code, setCode] = useControlled(value, onChange, '')
    const inputs = useRef([])
    const [chars, setChars] = useState(() => Array.from({ length: fields }, (_, i) => (code ?? '')[i] ?? ''))

    const commit = (next) => {
        setChars(next)

        const joined = next.join('')

        setCode(joined)

        if (joined.length === fields && ! next.includes('')) {
            onComplete?.(joined)
        }
    }

    const focus = (index) => {
        inputs.current[index]?.focus()
        inputs.current[index]?.select?.()
    }

    return (
        <div className={['code-input-container', className].filter(Boolean).join(' ')}>
            {title ? <p className="title">{title}</p> : null}

            <div className="code-input fe-code-input">
                {chars.map((char, index) => (
                    <input
                        key={index}
                        ref={(element) => { inputs.current[index] = element }}
                        className="w-14 h-14 rounded-lg border border-gray outline-none focus:outline-none focus:border-primary focus:ring-0 text-center transition-all"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        style={{ width: `${fieldWidth}px`, height: `${fieldHeight}px` }}
                        autoFocus={autoFocus && index === 0}
                        data-id={index}
                        required={required}
                        disabled={disabled}
                        value={char}
                        onFocus={(event) => event.target.select()}
                        onChange={(event) => {
                            // Pegar el codigo entero en la primera casilla es
                            // lo que hace todo el mundo; se reparte.
                            const typed = event.target.value.replace(/\D/g, '')

                            if (typed.length > 1) {
                                const next = [...chars]

                                typed.split('').slice(0, fields - index).forEach((digit, offset) => {
                                    next[index + offset] = digit
                                })

                                commit(next)
                                focus(Math.min(index + typed.length, fields - 1))

                                return
                            }

                            const next = [...chars]
                            next[index] = typed
                            commit(next)

                            if (typed && index < fields - 1) {
                                focus(index + 1)
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Backspace' && ! chars[index] && index > 0) {
                                focus(index - 1)
                            }

                            if (event.key === 'ArrowLeft' && index > 0) {
                                focus(index - 1)
                            }

                            if (event.key === 'ArrowRight' && index < fields - 1) {
                                focus(index + 1)
                            }
                        }} />
                ))}
            </div>
        </div>
    )
}
