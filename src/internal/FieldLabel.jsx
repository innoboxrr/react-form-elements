/**
 * La etiqueta con su icono de ayuda.
 *
 * En el paquete Vue este bloque está copiado en los treinta componentes. El
 * marcado es idéntico a propósito: las dos versiones comparten el mismo CSS
 * (UIkit + Tailwind) del proyecto anfitrión, así que cambiarlo aquí
 * descuadraría los formularios generados para React respecto a los de Vue.
 */
export default function FieldLabel({ label, help, htmlFor = undefined }) {
    if (! label && ! help) {
        return null
    }

    return (
        <label
            htmlFor={htmlFor}
            className=" ml-2 text-sm font-medium text-gray-900 dark:text-white">
            {help ? (
                <span className="cursor-pointer">
                    <i uk-tooltip={`title: ${help}`} className="fa-solid fa-circle-question"></i>
                </span>
            ) : null}
            {label}
        </label>
    )
}
