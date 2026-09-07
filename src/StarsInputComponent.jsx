import { useState } from 'react'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de StarsInputComponent.vue.
 *
 * La versión Vue montaba un radio nativo por estrella y pintaba encima con
 * CSS. Aquí son botones: el control ya es accesible por teclado sin depender
 * de la hoja de estilos, y el valor sigue siendo el mismo número.
 */
export default function StarsInputComponent({
    max = 5,
    value,
    onChange,
    name = 'rating',
    char = '★',
    inactiveChar = null,
    readOnly = false,
    starsSize = '50px',
    ...rest
}) {
    const [current, set] = useControlled(value, onChange, 0)
    const [hovered, setHovered] = useState(null)

    const shown = hovered ?? current ?? 0

    return (
        <div
            className="fe-stars"
            style={{ fontSize: starsSize }}
            onMouseLeave={() => setHovered(null)}
            {...rest}>
            {Array.from({ length: max }, (_, index) => index + 1).map((position) => (
                <button
                    key={position}
                    type="button"
                    name={`${name}${position}`}
                    disabled={readOnly}
                    aria-label={`${position}`}
                    aria-pressed={position <= (current ?? 0)}
                    data-active={position <= shown}
                    onMouseEnter={() => (readOnly ? null : setHovered(position))}
                    onClick={() => (readOnly ? null : set(position))}>
                    {position <= shown ? char : (inactiveChar ?? char)}
                </button>
            ))}
        </div>
    )
}
