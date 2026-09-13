import { useId } from 'react'
import IconComponent from '../IconComponent.jsx'
import useNativeDialog from './useNativeDialog.js'
import useTheme, { joinClasses } from './useTheme.js'

/**
 * Gemelo de internal/DialogShell.vue: lo común a DialogComponent y
 * DrawerComponent.
 *
 * `header` y `footer` son nodos, o funciones que reciben `{ close }`, igual que
 * los slots con ámbito de Vue.
 */
export default function DialogShell({
    kind = 'dialog',
    open = false,
    title = null,
    label = null,
    size = 'md',
    side = 'end',
    dismissible = true,
    closeLabel = 'Cerrar',
    onOpenChange,
    onClose,
    header = null,
    footer = null,
    children,
}) {
    const theme = useTheme()
    const titleId = useId()

    const part = kind === 'drawer' ? 'drawer' : 'dialog'

    const modifier = kind === 'drawer'
        ? (side === 'start' ? 'drawerStart' : null)
        : ({ sm: 'dialogSmall', lg: 'dialogLarge' }[size] ?? null)

    const requestClose = () => {
        onOpenChange?.(false)
        onClose?.()
    }

    const { ref, onClick } = useNativeDialog({ open, dismissible, onRequestClose: requestClose })

    const render = (slot) => (typeof slot === 'function' ? slot({ close: requestClose }) : slot)

    return (
        <dialog
            ref={ref}
            className={joinClasses(theme[part], modifier && theme[modifier])}
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : (label ?? undefined)}
            onClick={onClick}>

            {/* El contenido existe solo mientras está abierto: un formulario
                vuelve limpio cada vez. */}
            {open ? (
                <>
                    {(title || header || dismissible) ? (
                        <header className={theme[`${part}Header`]}>
                            {header
                                ? render(header)
                                : (title ? <h2 id={titleId} className={theme[`${part}Title`]}>{title}</h2> : null)}

                            {dismissible ? (
                                <button type="button" className={theme.iconButton} aria-label={closeLabel} onClick={requestClose}>
                                    <IconComponent name="close" size={16} />
                                </button>
                            ) : null}
                        </header>
                    ) : null}

                    <div className={theme[`${part}Body`]}>{render(children)}</div>

                    {footer ? <footer className={theme[`${part}Footer`]}>{render(footer)}</footer> : null}
                </>
            ) : null}

        </dialog>
    )
}
