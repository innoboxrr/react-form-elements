import { useSyncExternalStore } from 'react'
import { getConfirmation, onConfirmationChange, resolveConfirmation } from 'innoboxrr-form-core'
import DialogShell from './internal/DialogShell.jsx'
import useTheme from './internal/useTheme.js'

/**
 * Gemelo de ConfirmHostComponent.vue: donde se pregunta lo que pide
 * `confirmAction()`. Se monta una vez, en la raíz de la aplicación.
 *
 * Cerrar con Escape o con un clic fuera cuenta como cancelar, y el foco empieza
 * en cancelar: un Enter por inercia no debe borrar nada.
 */
export default function ConfirmHostComponent({ closeLabel = 'Cerrar' }) {
    const confirmation = useSyncExternalStore(onConfirmationChange, getConfirmation, getConfirmation)
    const theme = useTheme()

    return (
        <DialogShell
            kind="dialog"
            size="sm"
            open={confirmation !== null}
            title={confirmation?.title ?? null}
            closeLabel={closeLabel}
            onOpenChange={(value) => {
                if (! value) {
                    resolveConfirmation(false)
                }
            }}
            footer={(
                <>
                    <button
                        type="button"
                        className={theme.buttonSecondary}
                        data-autofocus=""
                        onClick={() => resolveConfirmation(false)}>
                        {confirmation?.cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={confirmation?.variant === 'danger' ? theme.buttonDanger : theme.button}
                        onClick={() => resolveConfirmation(true)}>
                        {confirmation?.confirmLabel}
                    </button>
                </>
            )}>
            <p>{confirmation?.message}</p>
        </DialogShell>
    )
}
