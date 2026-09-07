import { useCallback, useMemo, useRef } from 'react'
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
 * La versión Vue usa vuedraggable (SortableJS). En React el equivalente vivo
 * es dnd-kit: es el sucesor de react-beautiful-dnd —archivado—, no toca el DOM
 * por su cuenta y trae ordenación **por teclado**, que ni SortableJS ni la API
 * nativa de arrastre dan. Aquí no es un detalle: un formulario que solo se
 * puede reordenar con el ratón no es accesible.
 */
function SortableGroup({ id, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm relative dark:border-slate-600">
            {children({ attributes, listeners })}
        </div>
    )
}

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
    const nextKey = useRef(0)

    const groups = current ?? []

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // dnd-kit necesita un id estable por elemento. El indice no vale: al
    // reordenar cambia, y el elemento arrastrado saltaria.
    const keyed = useMemo(
        () => groups.map((group) => {
            if (! group.__key) {
                group.__key = `grupo-${nextKey.current++}`
            }

            return group
        }),
        [groups]
    )

    const emptyGroup = () => inputsConfig.reduce(
        (group, field) => ({ ...group, [field.key]: '' }),
        { _collapsed: false, __key: `grupo-${nextKey.current++}` }
    )

    const updateAt = (index, key, next) => set(
        keyed.map((group, position) => (position === index ? { ...group, [key]: next } : group))
    )

    const onDragEnd = useCallback((event) => {
        const { active, over } = event

        if (! over || active.id === over.id) {
            return
        }

        const from = keyed.findIndex((group) => group.__key === active.id)
        const to = keyed.findIndex((group) => group.__key === over.id)

        const next = [...keyed]
        const [moved] = next.splice(from, 1)

        next.splice(to, 0, moved)
        set(next)
    }, [keyed, set])

    return (
        <div>
            {label ? (
                <label className="block mb-4 ml-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {label}
                </label>
            ) : null}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={keyed.map((group) => group.__key)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 rounded-lg">
                        {keyed.map((group, index) => (
                            <SortableGroup key={group.__key} id={group.__key}>
                                {({ attributes, listeners }) => (
                                    <>
                                        <div className="flex justify-between items-center px-4 py-3 border-b bg-slate-50 dark:bg-slate-700 dark:border-slate-600 rounded-t-lg">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    aria-label={`Mover ${itemLabel} ${index + 1}`}
                                                    className="cursor-move drag-handle text-slate-400"
                                                    {...attributes}
                                                    {...listeners}>
                                                    <i className="fa-solid fa-grip-vertical"></i>
                                                </button>
                                                <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100">
                                                    {itemLabel} #{index + 1}
                                                </h4>
                                            </div>

                                            <div className="flex items-center space-x-4 text-slate-400">
                                                <button
                                                    type="button"
                                                    aria-label={`Duplicar ${itemLabel} ${index + 1}`}
                                                    className="hover:text-blue-500 transition mr-2"
                                                    onClick={() => set([
                                                        ...keyed.slice(0, index + 1),
                                                        { ...group, __key: `grupo-${nextKey.current++}` },
                                                        ...keyed.slice(index + 1),
                                                    ])}>
                                                    <i className="fa-solid fa-clone"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label={`${removeButtonLabel} ${index + 1}`}
                                                    className="text-red-800 dark:text-red-400 text-sm"
                                                    onClick={() => set(keyed.filter((_, position) => position !== index))}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label={`Expandir ${itemLabel} ${index + 1}`}
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
                                    </>
                                )}
                            </SortableGroup>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                type="button"
                className="uk-button uk-button-primary uk-margin-top"
                onClick={() => set([...keyed, emptyGroup()])}>
                {addButtonLabel}
            </button>
        </div>
    )
}
