import { useCallback, useEffect, useRef } from 'react'

/**
 * Gemelo de composables/useNativeDialog.js de la rama Vue: abre y cierra un
 * <dialog> desde un booleano.
 *
 * El elemento del navegador pone la capa superior, el fondo inerte, el foco
 * atrapado, Escape y la devolución del foco; pero guarda su propio estado. Aquí
 * manda el booleano: Escape, un clic fuera o un cierre nativo solo piden cerrar.
 *
 * React no escribe el atributo `autofocus` en el DOM —lo resuelve él, antes de
 * que el diálogo se abra—, así que el elemento que tiene que recibir el foco se
 * marca con `data-autofocus` y se enfoca después de abrir.
 *
 * @param {{ open: boolean, dismissible: boolean, onRequestClose: () => void }} options
 */
export default function useNativeDialog({ open, dismissible, onRequestClose }) {
    const ref = useRef(null)
    const latest = useRef({ open, dismissible, onRequestClose })

    latest.current = { open, dismissible, onRequestClose }

    useEffect(() => {
        const element = ref.current

        if (! element) {
            return
        }

        const isOpen = element.hasAttribute('open')

        if (open && ! isOpen) {
            typeof element.showModal === 'function' ? element.showModal() : element.setAttribute('open', '')

            element.querySelector('[data-autofocus]')?.focus()
        }

        if (! open && isOpen) {
            typeof element.close === 'function' ? element.close() : element.removeAttribute('open')
        }
    }, [open])

    useEffect(() => {
        const element = ref.current

        if (! element) {
            return undefined
        }

        const onCancel = (event) => {
            event.preventDefault()

            if (latest.current.dismissible) {
                latest.current.onRequestClose?.()
            }
        }

        const onClose = () => {
            if (latest.current.open) {
                latest.current.onRequestClose?.()
            }
        }

        element.addEventListener('cancel', onCancel)
        element.addEventListener('close', onClose)

        return () => {
            element.removeEventListener('cancel', onCancel)
            element.removeEventListener('close', onClose)
        }
    }, [])

    /**
     * Un clic en el fondo llega con el propio <dialog> como destino y fuera de
     * su caja.
     */
    const onClick = useCallback((event) => {
        const element = ref.current

        if (! element || event.target !== element || ! latest.current.dismissible) {
            return
        }

        const box = element.getBoundingClientRect()

        const inside = event.clientX >= box.left
            && event.clientX <= box.right
            && event.clientY >= box.top
            && event.clientY <= box.bottom

        if (! inside) {
            latest.current.onRequestClose?.()
        }
    }, [])

    return { ref, onClick }
}
