import { useEffect, useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'

import Field from './internal/Field.jsx'
import { cachedLanguage, loadLanguage } from './internal/codeMirrorLanguages.js'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de CodeMirrorComponent.vue.
 *
 * La versión Vue usa vue-codemirror sobre CodeMirror 6; aquí va
 * `@uiw/react-codemirror`, que es el binding equivalente y el estándar de
 * hecho en React. Los mismos modos de lenguaje y el mismo tema `one-dark` que
 * declara el gemelo, así que un mismo bloque de código se ve igual en los dos.
 *
 * Antes esto montaba CodeMirror a mano con un `useEffect` y caía a un
 * `<textarea>` si las dependencias no estaban. Eran opcionales, y por tanto
 * casi nunca estaban.
 *
 * El lenguaje llega con import(): importarlos los cuatro de forma estática
 * hacía que el piloto de la aplicación base cargara 580 kB para un editor que
 * solo edita JSON. Mientras llega, el editor ya funciona como texto plano.
 *
 * one-dark, en cambio, sigue siendo estático: `@uiw/react-codemirror` lo
 * importa y lo reexporta él mismo (esm/getDefaultExtensions.js), así que
 * cargarlo aquí con import() no quitaría ni un byte del bundle.
 */
export default function CodeMirrorComponent({
    label = '',
    help = null,
    name,
    language = 'javascript',
    height = '300px',
    readOnly = false,
    theme = 'dark',
    validators = null,
    value,
    onChange,
    ...rest
}) {
    const [current, set] = useControlled(value, onChange, '')

    // Un lenguaje ya cargado entra en el primer render; uno desconocido, nunca.
    const [support, setSupport] = useState(() => cachedLanguage(language))

    useEffect(() => {
        // Descarta la respuesta de un lenguaje que ya no es el pedido.
        let active = true

        setSupport(cachedLanguage(language))

        loadLanguage(language).then((next) => {
            if (active) {
                setSupport(next)
            }
        })

        return () => {
            active = false
        }
    }, [language])

    // El binding reconfigura el editor cuando cambia la identidad de este
    // array, así que solo cambia cuando llega otro lenguaje.
    const extensions = useMemo(() => (support ? [support] : []), [support])

    return (
        <Field label={label} help={help} inline={false}>
            <CodeMirror
                value={current ?? ''}
                height={height}
                readOnly={readOnly}
                theme={theme === 'dark' ? oneDark : 'light'}
                extensions={extensions}
                onChange={set}
                {...rest} />

            {/* El validador del proyecto lee data-validators del DOM. */}
            <input type="hidden" name={name} data-validators={validators ?? undefined} value={current ?? ''} readOnly />
        </Field>
    )
}
