import SingleCheckboxInputComponent from './SingleCheckboxInputComponent.jsx'

/**
 * Gemelo de MultiCheckboxInputComponent.vue.
 *
 * La versión Vue recalculaba la selección leyendo el DOM con
 * `document.querySelectorAll`, lo que ataba el componente a que sus inputs
 * estuvieran montados en el documento y rompía con dos grupos del mismo `id`.
 * Aquí la selección sale del propio valor, que es de donde tenía que salir.
 *
 * @param {{id?: string, value: Array, options: Array<{id: any, name: string}>, onChange?: (value: Array) => void}} props
 */
export default function MultiCheckboxInputComponent({ id = '', value, options, onChange }) {
    const selected = value ?? []

    const toggle = (optionId, checked) => {
        onChange?.(checked
            ? [...selected, optionId]
            : selected.filter((item) => item !== optionId))
    }

    return (
        <div>
            {options.map((option) => (
                <SingleCheckboxInputComponent
                    key={option.id}
                    id={id}
                    label={option.name}
                    value={option.id}
                    checked={selected.includes(option.id)}
                    onCheckedChange={(checked) => toggle(option.id, checked)} />
            ))}
        </div>
    )
}
