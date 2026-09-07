import FieldLabel from './FieldLabel.jsx'

/**
 * El envoltorio `uk-margin > uk-inline` que llevan casi todos los controles.
 */
export default function Field({ label, help, htmlFor, children, inline = true }) {
    const body = inline
        ? <div className="uk-inline uk-width-1-1">{children}</div>
        : children

    return (
        <div className="uk-margin">
            {(label || help) ? <FieldLabel label={label} help={help} htmlFor={htmlFor} /> : null}
            {body}
        </div>
    )
}
