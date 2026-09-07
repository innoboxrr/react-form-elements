import { useSyncExternalStore } from 'react'
import { getTheme, onThemeChange } from 'innoboxrr-form-core'
import FieldLabel from './FieldLabel.jsx'

/**
 * El envoltorio `fe-mb > fe-inline` que llevan casi todos los controles.
 */
export default function Field({ label, help, htmlFor, children, inline = true }) {
    const theme = useSyncExternalStore(onThemeChange, () => getTheme(), () => getTheme())

    const body = inline
        ? <div className={theme.fieldInner}>{children}</div>
        : children

    return (
        <div className={theme.field}>
            {(label || help) ? <FieldLabel label={label} help={help} htmlFor={htmlFor} /> : null}
            {body}
        </div>
    )
}
