import { useCallback, useRef, useState } from 'react'

/**
 * `value` + `onChange(valor)` es el equivalente React de `v-model`: onChange
 * recibe el valor, no el evento, igual que `update:modelValue` recibe el valor
 * y no el `$event`. El generador emite las dos formas desde el mismo
 * laraimport, así que tienen que significar lo mismo.
 *
 * Si no llega `value` el componente se gobierna solo. Eso permite montarlo en
 * una prueba o en un formulario no controlado sin escribir estado alrededor, y
 * evita el aviso de React por pasar de no controlado a controlado.
 *
 * @template T
 * @param {T|undefined} value
 * @param {((next: T) => void)|undefined} onChange
 * @param {T} fallback
 * @returns {[T, (next: T) => void]}
 */
export default function useControlled(value, onChange, fallback = '') {
    // El modo se fija en el primer render: cambiarlo a mitad de vida es
    // justamente lo que provoca el aviso de React.
    const controlled = useRef(value !== undefined)
    const [internal, setInternal] = useState(value !== undefined ? value : fallback)

    const current = controlled.current ? value : internal

    const set = useCallback((next) => {
        if (! controlled.current) {
            setInternal(next)
        }

        if (onChange) {
            onChange(next)
        }
    }, [onChange])

    return [current, set]
}
