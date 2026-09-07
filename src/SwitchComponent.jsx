import useControlled from './internal/useControlled.js'

/**
 * Gemelo de SwitchComponent.vue.
 *
 * Los estilos `.fe-switch` van en form-elements.css: en Vue estaban en un
 * <style scoped> y React no tiene equivalente.
 */
export default function SwitchComponent({ value, onChange, onToggle, ...rest }) {
    const [current, set] = useControlled(value, onChange, false)

    return (
        <label className="fe-switch">
            <input
                type="checkbox"
                checked={Boolean(current)}
                onChange={(event) => {
                    set(event.target.checked)
                    onToggle?.(event)
                }}
                {...rest} />
            <div className="fe-switch-slider fe-switch-lg"></div>
        </label>
    )
}
