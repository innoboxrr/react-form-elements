/**
 * La etiqueta con su icono de ayuda.
 *
 * En el paquete Vue este bloque está copiado en los treinta componentes. El
 * marcado es idéntico a propósito: las dos versiones comparten el mismo CSS
 * (UIkit + Tailwind) del proyecto anfitrión, así que cambiarlo aquí
 * descuadraría los formularios generados para React respecto a los de Vue.
 */
import { useSyncExternalStore } from 'react'
import { getTheme, onThemeChange } from 'innoboxrr-form-core'

export default function FieldLabel({ label, help, htmlFor = undefined }) {
    const theme = useSyncExternalStore(onThemeChange, () => getTheme(), () => getTheme())

    if (! label && ! help) {
        return null
    }

    return (
        <label htmlFor={htmlFor} className={theme.label}>
            {help ? (
                <span className={theme.help}>
                    <i
                        className={theme.helpIcon}
                        data-tooltip={help}
                        aria-label={help}
                        tabIndex={0}></i>
                </span>
            ) : null}
            {label}
        </label>
    )
}
