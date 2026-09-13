import DialogShell from './internal/DialogShell.jsx'

/**
 * Gemelo de DialogComponent.vue: un diálogo modal sobre <dialog>.
 *
 *     <DialogComponent open={abierto} onOpenChange={setAbierto} title="Borrar producto"
 *         footer={({ close }) => <button onClick={close}>Cancelar</button>}>
 *         ¿Seguro?
 *     </DialogComponent>
 *
 * `dismissible={false}` impide cerrarlo con Escape, con un clic fuera y quita
 * la X.
 */
export default function DialogComponent({
    open = false,
    title = null,
    label = null,
    size = 'md',
    dismissible = true,
    closeLabel = 'Cerrar',
    onOpenChange,
    onClose,
    header = null,
    footer = null,
    children,
}) {
    return (
        <DialogShell
            kind="dialog"
            open={open}
            title={title}
            label={label}
            size={size}
            dismissible={dismissible}
            closeLabel={closeLabel}
            onOpenChange={onOpenChange}
            onClose={onClose}
            header={header}
            footer={footer}>
            {children}
        </DialogShell>
    )
}
