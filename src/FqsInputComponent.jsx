import TextInputComponent from './TextInputComponent.jsx'
import TextareaInputComponent from './TextareaInputComponent.jsx'
import useControlled from './internal/useControlled.js'

const DEFAULT_LABELS = {
    title: 'Add frequency asked questions',
    question: 'Question',
    answer: 'Answer',
    add: 'Add Question',
    remove: 'Remove question',
}

/**
 * Gemelo de FqsInputComponent.vue: la lista de preguntas frecuentes.
 *
 * El valor es un array de `{ question, answer }` y nunca se muta en sitio: se
 * emite uno nuevo, como ya hace la versión Vue corregida.
 */
export default function FqsInputComponent({
    value,
    onChange,
    inputClass = 'uk-input uk-form-large uk-border-rounded',
    labels = DEFAULT_LABELS,
    name = 'fqs',
}) {
    const [current, set] = useControlled(value, onChange, [])

    const items = current ?? []
    const text = { ...DEFAULT_LABELS, ...labels }

    const updateAt = (index, field, next) => set(
        items.map((item, position) => (position === index ? { ...item, [field]: next } : item))
    )

    return (
        <div>
            <h4>{text.title}</h4>

            {items.map((item, index) => (
                <div key={index} className="uk-card uk-card-default uk-card-small uk-card-body uk-margin">
                    <TextInputComponent
                        type="text"
                        name={`${name}[${index}][question]`}
                        label={text.question}
                        customClass={inputClass}
                        value={item.question ?? ''}
                        onChange={(next) => updateAt(index, 'question', next)} />

                    <TextareaInputComponent
                        name={`${name}[${index}][answer]`}
                        label={text.answer}
                        value={item.answer ?? ''}
                        onChange={(next) => updateAt(index, 'answer', next)} />

                    <button
                        type="button"
                        className="uk-button uk-button-danger uk-button-small"
                        onClick={() => set(items.filter((_, position) => position !== index))}>
                        {text.remove}
                    </button>
                </div>
            ))}

            <button
                type="button"
                className="uk-button uk-button-primary"
                onClick={() => set([...items, { question: '', answer: '' }])}>
                {text.add}
            </button>
        </div>
    )
}
