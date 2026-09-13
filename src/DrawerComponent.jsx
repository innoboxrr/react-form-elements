import DialogShell from './internal/DialogShell.jsx'

/**
 * Gemelo de DrawerComponent.vue: un panel lateral modal sobre <dialog>, para
 * crear o editar sin salir de la tabla.
 *
 *     <DrawerComponent open={abierto} onOpenChange={setAbierto} title="Nuevo producto">
 *         <CreateForm onSubmit={…} />
 *     </DrawerComponent>
 *
 * `side="start"` lo pega a la izquierda.
 */
export default function DrawerComponent({
    open = false,
    title = null,
    label = null,
    side = 'end',
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
            kind="drawer"
            open={open}
            title={title}
            label={label}
            side={side}
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
