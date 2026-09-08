import { useSyncExternalStore } from 'react'
import { Icon } from '@iconify/react'
import { iconFor, onIconChange } from 'innoboxrr-form-core'

/**
 * Un icono, por nombre semantico.
 *
 *     <IconComponent name="plus" />
 *     <IconComponent name="mdi:home" size={24} />
 *
 * El nombre se resuelve contra el mapa de innoboxrr-form-core —el mismo que
 * usa la rama Vue—, asi que cambiar el juego de iconos de todo el proyecto es
 * un `setIcons()` en el arranque y no tocar un solo componente.
 *
 * Es `aria-hidden` a proposito: un icono decorativo junto a su texto no debe
 * leerse dos veces. Cuando el icono es la unica pista —un boton solo con
 * icono— la etiqueta va en el `aria-label` del boton, que es donde el lector
 * la espera.
 *
 * @param {{ name: string, size?: number|string, className?: string }} props
 */
export default function IconComponent({ name, size = null, className = null }) {
    // useSyncExternalStore es la forma correcta de leer estado que vive fuera
    // de React: un `setIcons()` en caliente repinta lo ya montado.
    const resolved = useSyncExternalStore(
        onIconChange,
        () => iconFor(name),
        () => iconFor(name)
    )

    return (
        <Icon
            icon={resolved}
            width={size}
            height={size}
            className={className}
            aria-hidden="true" />
    )
}
