import { useEffect, useId, useMemo, useRef, useState } from 'react'
import IconComponent from './IconComponent.jsx'
import useNativeDialog from './internal/useNativeDialog.js'
import useTheme, { joinClasses } from './internal/useTheme.js'

const normalize = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/**
 * Gemelo de CommandPaletteComponent.vue: buscar y ejecutar cualquier cosa sin
 * tocar el ratón.
 *
 *     <CommandPaletteComponent open={abierta} onOpenChange={setAbierta} items={[
 *         { id: 'products', label: 'Productos', group: 'Ir a', icon: 'box', action: () => navigate(…) },
 *     ]} onSelect={…} />
 *
 * Ctrl+K o Cmd+K la abren y la cierran; `hotkey` cambia la tecla y `null` quita
 * el atajo. El filtro no distingue mayúsculas ni acentos.
 */
export default function CommandPaletteComponent({
    open = false,
    items = [],
    placeholder = 'Buscar…',
    emptyText = 'Sin resultados',
    label = 'Paleta de comandos',
    hotkey = 'k',
    onOpenChange,
    onSelect,
}) {
    const theme = useTheme()
    const listId = useId()
    const input = useRef(null)
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)

    const latest = useRef({ open, hotkey, onOpenChange })

    latest.current = { open, hotkey, onOpenChange }

    const requestClose = () => onOpenChange?.(false)

    const { ref, onClick } = useNativeDialog({ open, dismissible: true, onRequestClose: requestClose })

    const filtered = useMemo(() => {
        const needle = normalize(query).trim()

        if (needle === '') {
            return items
        }

        return items.filter((item) => normalize([item.label, item.group, ...(item.keywords ?? [])].join(' ')).includes(needle))
    }, [items, query])

    const sections = useMemo(() => {
        const groups = new Map()

        filtered.forEach((item, index) => {
            const key = item.group ?? null

            if (! groups.has(key)) {
                groups.set(key, [])
            }

            groups.get(key).push({ item, index })
        })

        return [...groups].map(([group, entries]) => ({ group, entries }))
    }, [filtered])

    useEffect(() => {
        if (open) {
            setQuery('')
            setActive(0)
            input.current?.focus()
        }
    }, [open])

    useEffect(() => {
        const onHotkey = (event) => {
            const { hotkey: key, open: isOpen, onOpenChange: change } = latest.current

            if (key && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key.toLowerCase()) {
                event.preventDefault()
                change?.(! isOpen)
            }
        }

        window.addEventListener('keydown', onHotkey)

        return () => window.removeEventListener('keydown', onHotkey)
    }, [])

    const optionId = (index) => `${listId}-${index}`

    const choose = (item) => {
        if (! item) {
            return
        }

        requestClose()
        onSelect?.(item)
        item.action?.(item)
    }

    const onKeyDown = (event) => {
        const total = filtered.length

        if (event.key === 'ArrowDown' && total > 0) {
            event.preventDefault()
            setActive((current) => (current + 1) % total)
        }

        if (event.key === 'ArrowUp' && total > 0) {
            event.preventDefault()
            setActive((current) => (current - 1 + total) % total)
        }

        if (event.key === 'Enter') {
            event.preventDefault()
            choose(filtered[active])
        }
    }

    return (
        <dialog
            ref={ref}
            className={joinClasses(theme.dialog, theme.command)}
            aria-label={label}
            onClick={onClick}>

            {open ? (
                <>
                    <input
                        ref={input}
                        type="text"
                        className={theme.commandInput}
                        placeholder={placeholder}
                        value={query}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded="true"
                        aria-controls={listId}
                        aria-activedescendant={filtered.length > 0 ? optionId(active) : undefined}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setActive(0)
                        }}
                        onKeyDown={onKeyDown} />

                    {filtered.length > 0 ? (
                        <ul id={listId} className={theme.commandList} role="listbox" aria-label={label}>
                            {sections.map((section) => [
                                section.group
                                    ? <li key={`group-${section.group}`} role="presentation" className={theme.commandGroup}>{section.group}</li>
                                    : null,
                                ...section.entries.map((entry) => (
                                    <li
                                        key={entry.item.id ?? entry.index}
                                        id={optionId(entry.index)}
                                        role="option"
                                        aria-selected={entry.index === active ? 'true' : 'false'}
                                        className={theme.commandItem}
                                        onClick={() => choose(entry.item)}
                                        onMouseMove={() => setActive(entry.index)}>
                                        {entry.item.icon ? <IconComponent name={entry.item.icon} size={16} /> : null}
                                        <span>{entry.item.label}</span>
                                        {entry.item.shortcut ? <kbd className={theme.kbd}>{entry.item.shortcut}</kbd> : null}
                                    </li>
                                )),
                            ])}
                        </ul>
                    ) : (
                        <p className={theme.commandEmpty}>{emptyText}</p>
                    )}
                </>
            ) : null}

        </dialog>
    )
}
