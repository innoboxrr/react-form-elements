import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'

import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

const LANGUAGES = { javascript, json, html, css }

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

    const extensions = useMemo(() => {
        const support = LANGUAGES[language]

        return support ? [support()] : []
    }, [language])

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
