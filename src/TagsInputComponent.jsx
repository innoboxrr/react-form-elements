import { useId, useState } from 'react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de TagsInputComponent.vue.
 *
 * La versión Vue envuelve Tagify, que manipula el DOM por su cuenta y no tiene
 * binding oficial para React. Como el contrato es sólo "un array de cadenas",
 * aquí las etiquetas se manejan directamente: menos dependencia y el mismo
 * valor de salida. Acepta también una cadena separada por comas, como Vue.
 */
export default function TagsInputComponent({
    label = '',
    help = null,
    customClass = 'uk-input uk-form-large uk-border-rounded',
    name,
    placeholder = '',
    validators = null,
    value,
    onChange,
}) {
    const uid = useId()
    const [current, set] = useControlled(value, onChange, [])
    const [draft, setDraft] = useState('')

    const tags = Array.isArray(current)
        ? current
        : String(current ?? '').split(',').map((tag) => tag.trim()).filter(Boolean)

    const add = (tag) => {
        const clean = tag.trim()

        if (! clean || tags.includes(clean)) {
            return
        }

        set([...tags, clean])
    }

    return (
        <Field label={label} help={help} htmlFor={uid}>
            <div className="uk-flex uk-flex-wrap" style={{ gap: '0.25rem', marginBottom: '0.25rem' }}>
                {tags.map((tag) => (
                    <span key={tag} className="uk-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {tag}
                        <button
                            type="button"
                            aria-label={`Quitar ${tag}`}
                            onClick={() => set(tags.filter((item) => item !== tag))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                            &times;
                        </button>
                    </span>
                ))}
            </div>

            <input
                id={uid}
                className={customClass}
                type="text"
                name={name}
                placeholder={placeholder}
                data-validators={validators ?? undefined}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => {
                    add(draft)
                    setDraft('')
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                        event.preventDefault()
                        add(draft)
                        setDraft('')

                        return
                    }

                    if (event.key === 'Backspace' && draft === '' && tags.length) {
                        set(tags.slice(0, -1))
                    }
                }} />
        </Field>
    )
}
