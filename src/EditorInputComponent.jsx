import { useEffect, useState } from 'react'
import Field from './internal/Field.jsx'
import optionalImport from './internal/optionalImport.js'
import TextareaInputComponent from './TextareaInputComponent.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de EditorInputComponent.vue.
 *
 * TinyMCE es un peer opcional, como lightvue lo era en el ColorPicker de Vue:
 * si el anfitrión tiene `@tinymce/tinymce-react` se usa, y si no se cae a un
 * textarea con el mismo contrato. Así el paquete no arrastra 500 KB para los
 * formularios que no llevan editor.
 */
export default function EditorInputComponent({
    id,
    name,
    label = '',
    help = null,
    height = 300,
    disabled = false,
    initialValue = '',
    validators = null,
    value,
    onChange,
}) {
    const [current, set] = useControlled(value, onChange, initialValue)
    const [Editor, setEditor] = useState(null)

    useEffect(() => {
        let alive = true

        optionalImport('@tinymce/tinymce-react')
            .then((module) => {
                if (alive) {
                    setEditor(() => module.Editor)
                }
            })
            .catch(() => {
                if (import.meta.env?.DEV) {
                    console.warn('[innoboxrr-react-form-elements] @tinymce/tinymce-react no encontrado; usando <textarea>.')
                }
            })

        return () => {
            alive = false
        }
    }, [])

    if (! Editor) {
        return (
            <TextareaInputComponent
                label={label}
                help={help}
                name={name}
                rows={Math.max(5, Math.round(height / 24))}
                validators={validators}
                value={current}
                onChange={set} />
        )
    }

    return (
        <Field label={label} help={help} htmlFor={id}>
            <Editor
                id={id}
                disabled={disabled}
                value={current}
                init={{ height, menubar: false }}
                onEditorChange={(next) => set(next)} />
        </Field>
    )
}
