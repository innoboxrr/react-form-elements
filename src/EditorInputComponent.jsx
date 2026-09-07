import { Editor } from '@tinymce/tinymce-react'
import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

/**
 * Gemelo de EditorInputComponent.vue.
 *
 * `@tinymce/tinymce-react` es el envoltorio oficial, gemelo exacto del
 * `@tinymce/tinymce-vue` que declara la versión Vue. Antes se cargaba con un
 * import diferido y, si no estaba, quedaba un `<textarea>`: como era opcional,
 * lo normal era acabar con el textarea.
 *
 * `apiKey` viene de TinyMCE Cloud. Para una instalación propia se pasa
 * `tinymceScriptSrc` apuntando al `tinymce.min.js` servido por la aplicación.
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
    apiKey = undefined,
    tinymceScriptSrc = undefined,
    plugins = 'lists link image table code help wordcount',
    toolbar = 'undo redo | blocks | bold italic | bullist numlist | link image | code',
    value,
    onChange,
    ...rest
}) {
    const [current, set] = useControlled(value, onChange, initialValue)

    return (
        <Field label={label} help={help} htmlFor={id} inline={false}>
            <Editor
                id={id}
                apiKey={apiKey}
                tinymceScriptSrc={tinymceScriptSrc}
                disabled={disabled}
                value={current ?? ''}
                init={{ height, menubar: false, plugins, toolbar }}
                onEditorChange={set}
                {...rest} />

            {/* El validador del proyecto lee data-validators del DOM, y el
                editor no expone un input donde ponerlo. */}
            <input type="hidden" name={name} data-validators={validators ?? undefined} value={current ?? ''} readOnly />
        </Field>
    )
}
