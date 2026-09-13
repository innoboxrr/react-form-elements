import { useEffect, useId, useRef, useState } from 'react'
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom'
import IconComponent from './IconComponent.jsx'
import useTheme, { joinClasses } from './internal/useTheme.js'

const supportsPopover = typeof HTMLElement !== 'undefined'
    && typeof HTMLElement.prototype.showPopover === 'function'

/**
 * Gemelo de MenuComponent.vue: un menú desplegable sobre el atributo popover y
 * Floating UI.
 *
 *     <MenuComponent items={[
 *         { id: 'edit', label: 'Editar', icon: 'edit', action: editar },
 *         { separator: true },
 *         { id: 'delete', label: 'Eliminar', danger: true, disabled: ! puede, disabledReason: 'Sin permiso' },
 *     ]} onSelect={…} />
 *
 * `beforeOpen` se espera antes de abrir, para los permisos de una fila.
 * `renderTrigger({ toggle, open, loading, triggerProps })` sustituye al botón,
 * como el slot `trigger` de Vue.
 */
export default function MenuComponent({
    items = [],
    label = 'Acciones',
    icon = 'more',
    placement = 'bottom-end',
    beforeOpen = null,
    onSelect,
    onOpen,
    onClose,
    renderTrigger = null,
}) {
    const theme = useTheme()
    const menuId = useId()
    const menu = useRef(null)
    const trigger = useRef(null)
    const reference = useRef(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const latest = useRef({ onOpen, onClose, placement })

    latest.current = { onOpen, onClose, placement }

    const enabledItems = () => [...(menu.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])') ?? [])]

    const focusItem = (index) => {
        const list = enabledItems()

        if (list.length > 0) {
            list[(index + list.length) % list.length].focus()
        }
    }

    const opened = () => {
        setOpen(true)
        latest.current.onOpen?.()
    }

    const closed = () => {
        const hadFocus = menu.current?.contains(document.activeElement) || document.activeElement === document.body

        setOpen(false)
        latest.current.onClose?.()

        if (hadFocus) {
            reference.current?.focus?.()
        }
    }

    useEffect(() => {
        const element = menu.current

        if (! element) {
            return undefined
        }

        const onToggle = (event) => (event.newState === 'open' ? opened() : closed())

        element.addEventListener('toggle', onToggle)

        return () => element.removeEventListener('toggle', onToggle)
    }, [])

    // Colocar y enfocar una vez que el menú abierto ya está pintado.
    useEffect(() => {
        const element = menu.current

        if (! open || ! element) {
            return undefined
        }

        let stop = null

        if (reference.current) {
            const update = () => computePosition(reference.current, element, {
                placement: latest.current.placement,
                strategy: 'fixed',
                middleware: [offset(4), flip(), shift({ padding: 8 })],
            }).then(({ x, y }) => {
                Object.assign(element.style, { left: `${x}px`, top: `${y}px` })
            })

            try {
                stop = autoUpdate(reference.current, element, update)
            } catch {
                update()
            }
        }

        focusItem(0)

        return () => stop?.()
    }, [open])

    const show = () => {
        if (supportsPopover) {
            menu.current?.showPopover()
        } else {
            opened()
        }
    }

    const hide = () => {
        if (supportsPopover) {
            try {
                menu.current?.hidePopover()
            } catch {
                // Ya estaba cerrado.
            }
        } else {
            closed()
        }
    }

    const toggle = async (event) => {
        if (open) {
            hide()

            return
        }

        reference.current = event?.currentTarget ?? trigger.current

        if (beforeOpen) {
            setLoading(true)

            try {
                await beforeOpen()
            } finally {
                setLoading(false)
            }
        }

        show()
    }

    const choose = (item) => {
        if (item.disabled) {
            return
        }

        hide()
        onSelect?.(item)
        item.action?.(item)
    }

    const onKeyDown = (event) => {
        const list = enabledItems()
        const current = list.indexOf(document.activeElement)

        const moves = {
            ArrowDown: current + 1,
            ArrowUp: current - 1,
            Home: 0,
            End: list.length - 1,
        }

        if (event.key in moves) {
            event.preventDefault()
            focusItem(moves[event.key])
        }

        if (event.key === 'Escape' && ! supportsPopover) {
            hide()
        }
    }

    const triggerProps = {
        'aria-haspopup': 'menu',
        'aria-expanded': open ? 'true' : 'false',
        'aria-controls': menuId,
        'aria-label': label,
    }

    return (
        <span className="fe-inline">

            {renderTrigger ? renderTrigger({ toggle, open, loading, triggerProps }) : (
                <button
                    ref={trigger}
                    type="button"
                    className={theme.iconButton}
                    disabled={loading}
                    {...triggerProps}
                    onClick={toggle}>
                    <IconComponent name={icon} size={16} />
                </button>
            )}

            <div
                id={menuId}
                ref={menu}
                popover="auto"
                className={theme.menu}
                hidden={! supportsPopover && ! open ? true : undefined}
                onKeyDown={onKeyDown}>

                <ul className={theme.menuList} role="menu" aria-label={label}>
                    {items.map((item, index) => {
                        if (item.separator) {
                            return <li key={item.id ?? `separator-${index}`} role="separator" className={theme.menuSeparator} />
                        }

                        if (item.group) {
                            return <li key={item.id ?? `group-${index}`} role="presentation" className={theme.menuLabel}>{item.group}</li>
                        }

                        return (
                            <li key={item.id ?? index} role="none">
                                <button
                                    type="button"
                                    role="menuitem"
                                    className={joinClasses(theme.menuItem, item.danger && theme.menuItemDanger)}
                                    aria-disabled={item.disabled ? 'true' : undefined}
                                    data-tooltip={item.disabled && item.disabledReason ? item.disabledReason : undefined}
                                    onClick={() => choose(item)}>
                                    {item.icon ? <IconComponent name={item.icon} size={14} /> : null}
                                    <span>{item.label}</span>
                                    {item.shortcut ? <kbd className={theme.kbd}>{item.shortcut}</kbd> : null}
                                </button>
                            </li>
                        )
                    })}
                </ul>

            </div>

        </span>
    )
}
