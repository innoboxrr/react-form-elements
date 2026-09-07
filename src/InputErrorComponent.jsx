/**
 * Gemelo de InputErrorComponent.vue.
 *
 * `errors` es el objeto que devuelve Laravel en un 422 (`{ campo: [...] }`) y
 * `type` la clave que mira este control.
 */
export default function InputErrorComponent({ errors, type }) {
    const messages = errors?.[type]

    if (! messages?.length) {
        return null
    }

    return (
        <div>
            {messages.map((error) => (
                <p key={error} className="fe-input-error text-red-600 font-bold">{error}</p>
            ))}
        </div>
    )
}
