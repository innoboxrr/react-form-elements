import { useEffect, useRef, useSyncExternalStore } from 'react'
import { dismiss, getToasts, onToastsChange } from 'innoboxrr-form-core'
import IconComponent from './IconComponent.jsx'
import useTheme, { joinClasses } from './internal/useTheme.js'

const supportsPopover = typeof HTMLElement !== 'undefined'
    && typeof HTMLElement.prototype.showPopover === 'function'

const isShown = (element) => {
    try {
        return element.matches(':popover-open')
    } catch {
        return false
    }
}

/**
 * Gemelo de ToastRegionComponent.vue: donde aparecen los avisos de `notify()`.
 * Se monta una vez, en la raíz de la aplicación.
 *
 * Va en la capa superior con popover="manual", para no quedar debajo de un
 * drawer abierto con showModal().
 */
export default function ToastRegionComponent({ label = 'Avisos', closeLabel = 'Cerrar' }) {
    const toasts = useSyncExternalStore(onToastsChange, getToasts, getToasts)
    const theme = useTheme()
    const region = useRef(null)
    const previous = useRef(0)

    useEffect(() => {
        const element = region.current
        const count = toasts.length
        const before = previous.current

        previous.current = count

        if (! element || ! supportsPopover) {
            return
        }

        if (count === 0) {
            if (isShown(element)) {
                element.hidePopover()
            }

            return
        }

        // Un diálogo abierto después que la región queda por encima; volver a
        // mostrarla la sube. Solo entonces, porque reinicia la animación.
        const modalOpen = document.querySelector('dialog[open]') !== null

        if (isShown(element) && count > before && modalOpen) {
            element.hidePopover()
        }

        if (! isShown(element)) {
            element.showPopover()
        }
    }, [toasts])

    const variants = {
        success: theme.toastSuccess,
        danger: theme.toastDanger,
        warning: theme.toastWarning,
    }

    return (
        <div
            ref={region}
            className={theme.toastRegion}
            popover="manual"
            role="region"
            aria-label={label}
            hidden={! supportsPopover && toasts.length === 0 ? true : undefined}>

            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={joinClasses(theme.toast, variants[toast.variant])}
                    role={toast.variant === 'danger' ? 'alert' : 'status'}
                    data-variant={toast.variant}>

                    <div>
                        {toast.title ? <strong className={theme.toastTitle}>{toast.title}</strong> : null}
                        <span>{toast.message}</span>
                    </div>

                    <button
                        type="button"
                        className={joinClasses(theme.iconButton, theme.toastClose)}
                        aria-label={closeLabel}
                        onClick={() => dismiss(toast.id)}>
                        <IconComponent name="close" size={14} />
                    </button>

                </div>
            ))}

        </div>
    )
}
