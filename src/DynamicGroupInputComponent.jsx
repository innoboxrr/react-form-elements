import { useState } from 'react'
import EditorInputComponent from './EditorInputComponent.jsx'
import SelectInputComponent from './SelectInputComponent.jsx'
import TextInputComponent from './TextInputComponent.jsx'
import TextareaInputComponent from './TextareaInputComponent.jsx'
import useControlled from './internal/useControlled.js'

const COMPONENTS = {
    text: TextInputComponent,
    editor: EditorInputComponent,
    select: SelectInputComponent,
    textarea: TextareaInputComponent,
}

/**
 * Gemelo de DynamicGroupInputComponent.vue: N grupos de campos, con orden,
 * duplicado y borrado.
 *
 * La versión Vue usa vuedraggable. Aquí el reordenamiento va con la API nativa
 * de arrastre del navegador, que no necesita dependencia y funciona igual para
 * una lista vertical.
 */
export default function DynamicGroupInputComponent({
    value,
    onChange,
    inputsConfig,
    label = '',
    addButtonLabel = 'Añadir',
    removeButtonLabel = 'Eliminar',
    itemLabel = 'Item',
}) {
    const [current, set] = useControlled(value, onChange, [])
    const [dragged, setDragged] = useState(null)

    const groups = current ?? []

    const emptyGroup = () => inputsConfig.reduce(
        (group, field) => ({ ...group, [field.key]: '' }),
        { _collapsed: false }
    )

    const updateAt = (index, key, next) => set(
        groups.map((group, position) => (position === index ? { ...group, [key]: next } : group))
    )

    const move = (from, to) => {
        if (from === to || to < 0 || to >= groups.length) {
            return
        }

        const next = [...groups]
        const [moved] = next.splice(from, 1)

        next.splice(to, 0, moved)
        set(next)
    }

    return (
        <div>
            {label ? (
                <label className="block mb-4 ml-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {label}
                </label>
            ) : null}

            <div className="space-y-2 rounded-lg">
                {groups.map((group, index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={() => setDragged(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                            if (dragged !== null) {
                                move(dragged, index)
                            }

                            setDragged(null)
                        }}
                        className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm relative dark:border-slate-600">
                        <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-50 dark:bg-slate-700 dark:border-slate-600 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <span className="cursor-move drag-handle text-slate-400">
                                    <i className="fa-solid fa-grip-vertical"></i>
                                </span>
                                <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100">
                                    {itemLabel} #{index + 1}
                                </h4>
                            </div>

                            <div className="flex items-center space-x-4 text-slate-400">
                                <button
                                    type="button"
                                    title="Duplicar grupo"
                                    className="hover:text-blue-500 transition mr-2"
                                    onClick={() => set([
                                        ...groups.slice(0, index + 1),
                                        { ...group },
                                        ...groups.slice(index + 1),
                                    ])}>
                                    <i className="fa-solid fa-clone"></i>
                                </button>

                                <button
                                    type="button"
                                    title={removeButtonLabel}
                                    className="text-red-800 dark:text-red-400 text-sm"
                                    onClick={() => set(groups.filter((_, position) => position !== index))}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>

                                <button
                                    type="button"
                                    title="Expandir/Colapsar"
                                    aria-expanded={! group._collapsed}
                                    className="hover:text-slate-600 dark:hover:text-slate-300 transition"
                                    onClick={() => updateAt(index, '_collapsed', ! group._collapsed)}>
                                    <i className={`fa-solid ${group._collapsed ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                </button>
                            </div>
                        </div>

                        {! group._collapsed ? (
                            <div className="p-4">
                                {inputsConfig.map((field) => {
                                    const Component = COMPONENTS[field.type] ?? TextInputComponent

                                    return (
                                        <Component
                                            key={field.key}
                                            type={field.type === 'text' ? 'text' : undefined}
                                            id={`${field.key}-${index}`}
                                            name={`${field.key}[${index}]`}
                                            label={field.label ?? field.key}
                                            value={group[field.key] ?? ''}
                                            onChange={(next) => updateAt(index, field.key, next)}>
                                            {field.type === 'select' && field.options
                                                ? field.options.map((option) => (
                                                    <option key={option.value ?? option} value={option.value ?? option}>
                                                        {option.label ?? option}
                                                    </option>
                                                ))
                                                : null}
                                        </Component>
                                    )
                                })}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>

            <button
                type="button"
                className="uk-button uk-button-primary uk-margin-top"
                onClick={() => set([...groups, emptyGroup()])}>
                {addButtonLabel}
            </button>
        </div>
    )
}
