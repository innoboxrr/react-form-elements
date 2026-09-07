import { useId } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
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
 * La versión Vue intenta cargar lightvue y, si no está, cae a un
 * `<input type="color">` — que abre el diálogo del sistema operativo y no se
 * puede estilar ni probar. Aquí va react-colorful: 2,8 kB, sin dependencias,
 * accesible y con el mismo aspecto en todos los navegadores.
 *
 * La paleta de accesos rápidos se mantiene porque es parte del contrato.
 */
export default function ColorPickerInputComponent({
    id: providedId = undefined,
    label = '',
    help = null,
    clearable = true,
    colors = DEFAULT_COLORS,
    name = 'color',
    validators = null,
    value,
    onChange,
}) {
    const generatedId = useId()
    const uid = providedId ?? generatedId
    const [current, set] = useControlled(value, onChange, '#607C8A')

    return (
        <Field label={label} help={help} htmlFor={uid} inline={false}>
            <div className="fe-flex" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <HexColorPicker color={current || '#607C8A'} onChange={set} />

                <div>
                    <HexColorInput
                        id={uid}
                        className="fe-input"
                        color={current || ''}
                        prefixed
                        onChange={set} />

                    <input type="hidden" name={name} data-validators={validators ?? undefined} value={current ?? ''} readOnly />

                    <div className="fe-flex fe-mt-sm" style={{ gap: '0.25rem', flexWrap: 'wrap', maxWidth: '12rem' }}>
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
                    </div>

                    {clearable ? (
                        <button
                            type="button"
                            className="fe-button fe-button-link fe-mt-sm"
                            onClick={() => set('')}>
                            Limpiar
                        </button>
                    ) : null}
                </div>
            </div>
        </Field>
    )
}
