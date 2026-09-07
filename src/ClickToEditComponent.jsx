import { useEffect, useRef, useState } from 'react'

/**
 * Gemelo de ClickToEditComponent.vue: texto que se convierte en input al
 * hacer clic. `onInput` recibe el valor confirmado.
 */
export default function ClickToEditComponent({ value = '', onInput, customClass = 'uk-input' }) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    const input = useRef(null)

    useEffect(() => {
        setDraft(value)
    }, [value])

    useEffect(() => {
        if (editing) {
            input.current?.focus()
        }
    }, [editing])

    const confirm = () => {
        setEditing(false)
        onInput?.(draft)
    }

    const cancel = () => {
        setDraft(value)
        setEditing(false)
    }

    if (! editing) {
        return (
            <span
                role="button"
                tabIndex={0}
                onClick={() => setEditing(true)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        setEditing(true)
                    }
                }}>
                {value}
            </span>
        )
    }

    return (
        <input
            ref={input}
            className={customClass}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={confirm}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    confirm()
                }

                if (event.key === 'Escape') {
                    cancel()
                }
            }} />
    )
}
