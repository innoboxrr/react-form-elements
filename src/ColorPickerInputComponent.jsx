import Field from './internal/Field.jsx'
import useControlled from './internal/useControlled.js'

export const DEFAULT_COLORS = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFEB3B', '#FFC107', '#FF9800', '#795548',
]

/**
 * Gemelo de ColorPickerInputComponent.vue.
 *
 * La versión Vue cargaba lightvue de forma opcional y caía a un
 * `<input type="color">`. lightvue es de Vue, así que aquí la paleta se pinta
 * con el input nativo más los colores predefinidos, que es exactamente lo que
 * el fallback hacía y lo que el 99% de los formularios generados necesitan.
 */
export default function ColorPickerInputComponent({
    label = '',
    help = null,
    clearable = true,
    colors = DEFAULT_COLORS,
    name = 'color',
    value,
    onChange,
    ...rest
}) {
    const [current, set] = useControlled(value, onChange, '#607C8A')

    return (
        <Field label={label} help={help} inline={false}>
            <div className="uk-flex uk-flex-middle" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                    type="color"
                    name={name}
                    value={current || '#607C8A'}
                    onChange={(event) => set(event.target.value)}
                    {...rest} />

                {colors.map((color) => (
                    <button
                        key={color}
                        type="button"
                        aria-label={color}
                        title={color}
                        onClick={() => set(color)}
                        style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            borderRadius: '0.25rem',
                            border: current === color ? '2px solid #111827' : '1px solid #d1d5db',
                            backgroundColor: color,
                            cursor: 'pointer',
                            padding: 0,
                        }} />
                ))}

                {clearable ? (
                    <button type="button" className="uk-button uk-button-link" onClick={() => set('')}>
                        &times;
                    </button>
                ) : null}
            </div>
        </Field>
    )
}
