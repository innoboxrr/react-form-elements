import { useEffect, useRef, useState } from 'react'
import Field from './internal/Field.jsx'
import optionalImport from './internal/optionalImport.js'
import useControlled from './internal/useControlled.js'

const LANGUAGES = {
    javascript: () => optionalImport('@codemirror/lang-javascript').then((m) => m.javascript()),
    json: () => optionalImport('@codemirror/lang-json').then((m) => m.json()),
    html: () => optionalImport('@codemirror/lang-html').then((m) => m.html()),
    css: () => optionalImport('@codemirror/lang-css').then((m) => m.css()),
}

/**
 * Gemelo de CodeMirrorComponent.vue.
 *
 * CodeMirror 6 no depende de ningún framework: se monta sobre un nodo del DOM,
 * así que aquí no hace falta un binding de React, sólo una ref. Sigue siendo
 * una dependencia opcional; sin ella queda un textarea monoespaciado con el
 * mismo valor.
 */
export default function CodeMirrorComponent({
    label = '',
    help = null,
    name,
    language = 'javascript',
    height = '300px',
    readOnly = false,
    value,
    onChange,
}) {
    const host = useRef(null)
    const view = useRef(null)
    const latest = useRef(null)
    const [current, set] = useControlled(value, onChange, '')
    const [ready, setReady] = useState(false)

    // set cambia de identidad en cada render; la ref evita reconstruir el
    // editor por eso, que perderia el cursor en cada pulsacion.
    latest.current = set

    useEffect(() => {
        let alive = true

        const mount = async () => {
            try {
                const [{ EditorView, keymap }, { EditorState }, { defaultKeymap }] = await Promise.all([
                    optionalImport('@codemirror/view'),
                    optionalImport('@codemirror/state'),
                    optionalImport('@codemirror/commands'),
                ])

                if (! alive || ! host.current) {
                    return
                }

                const extensions = [
                    keymap.of(defaultKeymap),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            latest.current(update.state.doc.toString())
                        }
                    }),
                ]

                if (readOnly) {
                    extensions.push(EditorState.readOnly.of(true))
                }

                const support = LANGUAGES[language]

                if (support) {
                    try {
                        extensions.push(await support())
                    } catch {
                        // El modo del lenguaje es opcional; sin el sigue
                        // siendo un editor, solo que sin resaltado.
                    }
                }

                view.current = new EditorView({
                    state: EditorState.create({ doc: current ?? '', extensions }),
                    parent: host.current,
                })

                setReady(true)
            } catch {
                if (import.meta.env?.DEV) {
                    console.warn('[innoboxrr-react-form-elements] codemirror no encontrado; usando <textarea>.')
                }
            }
        }

        mount()

        return () => {
            alive = false
            view.current?.destroy()
            view.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, readOnly])

    // El valor puede cambiar desde fuera (cargar un registro): hay que
    // reflejarlo sin recrear el editor.
    useEffect(() => {
        const editor = view.current

        if (! editor) {
            return
        }

        const shown = editor.state.doc.toString()

        if (shown !== (current ?? '')) {
            editor.dispatch({ changes: { from: 0, to: shown.length, insert: current ?? '' } })
        }
    }, [current])

    return (
        <Field label={label} help={help} inline={false}>
            <div ref={host} style={{ minHeight: height }} data-ready={ready}></div>

            {! ready ? (
                <textarea
                    className="uk-textarea"
                    style={{ fontFamily: 'monospace', minHeight: height, width: '100%' }}
                    name={name}
                    readOnly={readOnly}
                    value={current ?? ''}
                    onChange={(event) => set(event.target.value)}></textarea>
            ) : null}
        </Field>
    )
}
