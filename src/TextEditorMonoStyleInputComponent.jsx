import CodeMirrorComponent from './CodeMirrorComponent.jsx'

/**
 * Gemelo de TextEditorMonoStyleInputComponent.vue: el editor monoespaciado
 * para plantillas HTML.
 */
export default function TextEditorMonoStyleInputComponent({
    label = '',
    help = null,
    name,
    height = '400px',
    readOnly = false,
    value,
    onChange,
}) {
    return (
        <CodeMirrorComponent
            label={label}
            help={help}
            name={name}
            language="html"
            height={height}
            readOnly={readOnly}
            value={value}
            onChange={onChange} />
    )
}
