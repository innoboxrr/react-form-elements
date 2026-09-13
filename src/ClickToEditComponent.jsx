import { useEffect, useRef, useState } from 'react'
import useTheme from './internal/useTheme.js'

/**
 * Gemelo de ClickToEditComponent.vue: un valor que se edita donde está.
 *
 *     <ClickToEditComponent value={producto.title} onSave={(title) => updateModel(producto.id, { title })} />
 *
 * Enter o salir del campo confirman; Escape cancela. Un valor sin cambios no
 * llama a nada.
 *
 * Con `onSave`, la confirmación espera a que termine: mientras guarda el campo
 * no se puede tocar, y si falla se queda abierto con el error. `onInput` sigue
 * recibiendo el valor confirmado, y `customClass` sigue reemplazando la clase
 * del campo.
 */
export default function ClickToEditComponent({
    value = '',
    type = 'text',
    placeholder = '—',
    label = 'Editar',
    onSave = null,
    onInput,
    customClass = undefined,
}) {
    const theme = useTheme()
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [draft, setDraft] = useState('')
    const [shown, setShown] = useState(value)
    const input = useRef(null)

    // Enter confirma y quita el campo, y quitarlo puede disparar blur: el
    // estado de React aún no se ha actualizado en ese momento, así que la
    // guarda va en una ref.
    const status = useRef({ editing: false, saving: false })

    useEffect(() => {
        setShown(value)
    }, [value])

    useEffect(() => {
        if (editing && ! saving) {
            input.current?.focus()
        }
    }, [editing, saving, error])

    const setEditingState = (next) => {
        status.current.editing = next
        setEditing(next)
    }

    const start = () => {
        setDraft(shown ?? '')
        setError(null)
        setEditingState(true)
    }

    const cancel = () => {
        setEditingState(false)
        setError(null)
    }

    const confirm = async () => {
        if (! status.current.editing || status.current.saving) {
            return
        }

        const next = draft

        if (String(next) === String(shown ?? '')) {
            setEditingState(false)

            return
        }

        if (onSave) {
            status.current.saving = true
            setSaving(true)
            setError(null)

            try {
                await onSave(next)
            } catch (failure) {
                status.current.saving = false
                setSaving(false)
                setError(failure?.message || 'No se pudo guardar')

                return
            }

            status.current.saving = false
            setSaving(false)
        }

        setShown(next)
        setEditingState(false)
        onInput?.(next)
    }

    const empty = shown === '' || shown === null || shown === undefined
    const text = empty ? placeholder : shown

    return (
        <span className="fe-inline">

            {editing ? (
                <input
                    ref={input}
                    type={type}
                    className={customClass ?? theme.input}
                    aria-label={label}
                    aria-invalid={error ? 'true' : undefined}
                    disabled={saving}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={confirm}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault()
                            confirm()
                        }

                        if (event.key === 'Escape') {
                            event.preventDefault()
                            cancel()
                        }
                    }} />
            ) : (
                <button type="button" className={theme.editable} aria-label={`${label}: ${text}`} onClick={start}>
                    {text}
                </button>
            )}

            {error ? <span className={theme.error} role="alert">{error}</span> : null}

        </span>
    )
}
