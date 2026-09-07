/**
 * Gemelo de InputErrorComponent.vue.
 *
 * `errors` es el objeto que devuelve Laravel en un 422 (`{ campo: [...] }`) y
 * `type` la clave que mira este control.
 */
import { useSyncExternalStore } from 'react'
import { getTheme, onThemeChange } from 'innoboxrr-form-core'

export default function InputErrorComponent({ errors, type }) {
    const theme = useSyncExternalStore(onThemeChange, () => getTheme(), () => getTheme())

    const messages = errors?.[type]

    if (! messages?.length) {
        return null
    }

    return (
        <div>
            {messages.map((error) => (
                <p key={error} className={theme.error}>{error}</p>
            ))}
        </div>
    )
}
