import { useId, useMemo, useState } from 'react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

const optionLabel = (option, label) => {
    if (option === null || option === undefined) {
        return ''
    }

    return typeof option === 'object' ? String(option[label] ?? '') : String(option)
}

/**
 * Gemelo de SelectSearchInputComponent.vue.
 *
 * La versión Vue envuelve vue-select. Su equivalente en React sería
 * react-select, pero eso sería atar el paquete a una dependencia de 30 KB para
 * lo que aquí se necesita: buscar y elegir. El contrato público —`options`,
 * `label`, `reduce`, el valor y el aviso de búsqueda— es el mismo, así que el
 * código generado no nota la diferencia.
 */
export default function SelectSearchInputComponent({
    inputLabel = '',
    help = null,
    customClass = 'uk-input uk-form-large uk-border-rounded',
    name,
    options = [],
    label = 'label',
    placeholder = '',
    clearable = true,
    disabled = false,
    reduce = (option) => option,
    validators = null,
    value,
    onChange,
    onSearch,
}) {
    const uid = useId()
    const [current, set] = useControlled(value, onChange, null)
    const [query, setQuery] = useState('')
    const [open, setOpen] = useState(false)

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase()

        if (! needle) {
            return options
        }

        return options.filter((option) => optionLabel(option, label).toLowerCase().includes(needle))
    }, [options, query, label])

    const selected = useMemo(
        () => options.find((option) => reduce(option) === current) ?? null,
        [options, current, reduce]
    )

    const display = open ? query : optionLabel(selected, label)

    return (
        <Field label={inputLabel} help={help} htmlFor={uid}>
            <div style={{ position: 'relative' }}>
                <input
                    id={uid}
                    className={customClass}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={`${uid}-listbox`}
                    autoComplete="off"
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    data-validators={validators ?? undefined}
                    value={display}
                    onFocus={() => setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                    onChange={(event) => {
                        setQuery(event.target.value)
                        setOpen(true)
                        onSearch?.(event.target.value)
                    }} />

                {clearable && selected ? (
                    <button
                        type="button"
                        aria-label="Limpiar"
                        onClick={() => {
                            set(null)
                            setQuery('')
                        }}
                        style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                        }}>
                        &times;
                    </button>
                ) : null}

                {open ? (
                    <ul
                        id={`${uid}-listbox`}
                        role="listbox"
                        className="uk-list uk-background-default"
                        style={{
                            position: 'absolute',
                            zIndex: 1015,
                            width: '100%',
                            maxHeight: '15rem',
                            overflowY: 'auto',
                            margin: 0,
                            border: '1px solid #e5e7eb',
                        }}>
                        {filtered.length === 0 ? (
                            <li style={{ padding: '0.5rem' }}>Sin resultados</li>
                        ) : filtered.map((option, index) => {
                            const text = optionLabel(option, label)

                            return (
                                <li key={`${text}-${index}`} role="option" aria-selected={reduce(option) === current}>
                                    <button
                                        type="button"
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => {
                                            set(reduce(option))
                                            setQuery('')
                                            setOpen(false)
                                        }}>
                                        {text}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                ) : null}
            </div>
        </Field>
    )
}
