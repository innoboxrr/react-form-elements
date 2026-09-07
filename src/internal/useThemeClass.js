import { useSyncExternalStore } from 'react'
import { classFor, getTheme, onThemeChange } from 'innoboxrr-form-core'

/**
 * La clase de un control según el tema, dejando que `customClass` mande.
 *
 * Va por `useSyncExternalStore` y no por una lectura directa porque el tema es
 * estado de módulo: si alguien llama a `setTheme` con la aplicación ya montada
 * —cambiar de claro a oscuro, por ejemplo—, lo leído directamente no
 * repintaría nada.
 *
 * @param {string} token
 * @param {string|null|undefined} customClass
 * @returns {string}
 */
export default function useThemeClass(token, customClass) {
    const theme = useSyncExternalStore(onThemeChange, () => getTheme(), () => getTheme())

    return customClass ?? (theme[token] ?? '')
}

export { classFor }
