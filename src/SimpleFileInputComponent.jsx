import { useId, useState } from 'react'

/**
 * Gemelo de SimpleFileInputComponent.vue: un botón que abre el diálogo de
 * archivos y muestra el nombre del elegido. `onInput` recibe el File o null.
 */
export default function SimpleFileInputComponent({
    customClass = null,
    inputName = 'file',
    label = 'Seleccionar archivo',
    accept = undefined,
    onInput,
}) {
    const uid = useId()
    const [file, setFile] = useState(null)

    return (
        <div className={['file-select', customClass].filter(Boolean).join(' ')}>
            <label htmlFor={uid} className="select-button" style={{ cursor: 'pointer' }}>
                {file?.name ?? label}
            </label>

            <input
                id={uid}
                type="file"
                name={inputName}
                accept={accept}
                style={{ display: 'none' }}
                onChange={(event) => {
                    // Cancelar el dialogo deja la lista vacia: hay que
                    // devolver null, no undefined, o quien lo consume revienta
                    // al leer file.size.
                    const selected = event.target.files?.[0] ?? null

                    setFile(selected)
                    onInput?.(selected)
                }} />
        </div>
    )
}
