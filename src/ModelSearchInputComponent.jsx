import { useCallback, useEffect, useRef, useState } from 'react'
import SelectSearchInputComponent from './SelectSearchInputComponent.jsx'

/**
 * Gemelo de ModelSearchInputComponent.vue: busca contra un endpoint y deja
 * elegir un registro.
 *
 * `onSubmit` recibe el id elegido y `onSelected` el registro completo, igual
 * que los eventos `submit` y `selected` de la versión Vue.
 */
export default function ModelSearchInputComponent({
    customClass = null,
    hideOnEmit = false,
    labelStr,
    placeholderStr,
    route,
    method = 'get',
    q = 'id',
    externalFilters = {},
    reduce = (option) => option.id,
    optionLabel = 'name',
    multiple = false,
    minLength = 1,
    debounce = 300,
    value,
    onSubmit,
    onSelected,
}) {
    const [options, setOptions] = useState([])
    const [selected, setSelected] = useState(value ?? null)
    const [visible, setVisible] = useState(true)
    const timer = useRef(null)

    const search = useCallback(async (term) => {
        if (term.length < minLength) {
            setOptions([])

            return
        }

        const params = { ...externalFilters, [q]: term }

        try {
            if (method.toLowerCase() === 'get') {
                const url = new URL(route, globalThis.location?.origin ?? 'http://localhost')

                Object.entries(params).forEach(([key, item]) => url.searchParams.set(key, item))

                const response = await fetch(url, { headers: { Accept: 'application/json' } })

                setOptions((await response.json())?.data ?? [])

                return
            }

            const response = await fetch(route, {
                method: method.toUpperCase(),
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(params),
            })

            setOptions((await response.json())?.data ?? [])
        } catch {
            setOptions([])
        }
    }, [route, method, q, externalFilters, minLength])

    // Un fetch por tecla satura el endpoint; la version Vue lo dejaba al
    // criterio de quien montara el componente.
    useEffect(() => () => window.clearTimeout(timer.current), [])

    if (! visible) {
        return null
    }

    return (
        <SelectSearchInputComponent
            customClass={customClass ?? undefined}
            name={q}
            inputLabel={labelStr}
            placeholder={placeholderStr}
            options={options}
            label={optionLabel}
            reduce={reduce}
            value={selected}
            onSearch={(term) => {
                window.clearTimeout(timer.current)
                timer.current = window.setTimeout(() => search(term), debounce)
            }}
            onChange={(next) => {
                setSelected(next)
                onSubmit?.(next)

                if (! multiple && next != null) {
                    const record = options.find((option) => reduce(option) === next)

                    if (record) {
                        onSelected?.(record)
                    }

                    if (hideOnEmit) {
                        setVisible(false)
                    }
                }
            }} />
    )
}
