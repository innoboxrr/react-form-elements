import useControlled from './internal/useControlled.js'

/**
 * Gemelo de SwitchComponent.vue.
 *
 * Los estilos `.uk-switch` van en form-elements.css: en Vue estaban en un
 * <style scoped> y React no tiene equivalente.
 */
export default function SwitchComponent({ value, onChange, onToggle, ...rest }) {
    const [current, set] = useControlled(value, onChange, false)

    return (
        <label className="uk-switch">
            <input
                type="checkbox"
                checked={Boolean(current)}
                onChange={(event) => {
                    set(event.target.checked)
                    onToggle?.(event)
                }}
                {...rest} />
            <div className="uk-switch-slider uk-switch-big"></div>
        </label>
    )
}
