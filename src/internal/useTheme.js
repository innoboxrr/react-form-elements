import { useSyncExternalStore } from 'react'
import { getTheme, onThemeChange } from 'innoboxrr-form-core'

/**
 * El tema completo, para los componentes que leen varios tokens a la vez.
 *
 * Va por `useSyncExternalStore` porque el tema es estado de módulo: un
 * `setTheme` en caliente tiene que repintar lo ya montado.
 *
 * @returns {Record<string, string>}
 */
export default function useTheme() {
    return useSyncExternalStore(onThemeChange, () => getTheme(), () => getTheme())
}

/**
 * Une clases descartando las vacías.
 *
 * @param {...(string|null|undefined|false)} classes
 */
export const joinClasses = (...classes) => classes.filter(Boolean).join(' ')
