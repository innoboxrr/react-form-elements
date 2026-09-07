import { useRef, useState } from 'react'

/**
 * Gemelo de FileDropInputComponent.vue. `onFilesChange` recibe un array de
 * File, venga de arrastrar o del diálogo.
 */
export default function FileDropInputComponent({
    multiple = false,
    accept = undefined,
    mainText = 'Arrastra y suelta el archivo aquí',
    subText = 'o haz clic para seleccionar los archivos.',
    onFilesChange,
}) {
    const input = useRef(null)
    const [dragging, setDragging] = useState(false)

    return (
        <div
            className="fe-file-drop"
            data-dragging={dragging}
            role="button"
            tabIndex={0}
            onClick={() => input.current?.click()}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    input.current?.click()
                }
            }}
            onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                onFilesChange?.(Array.from(event.dataTransfer.files))
            }}>
            <p>{mainText}</p>
            <p>{subText}</p>

            <input
                ref={input}
                type="file"
                multiple={multiple}
                accept={accept}
                style={{ display: 'none' }}
                onChange={(event) => onFilesChange?.(Array.from(event.target.files ?? []))} />
        </div>
    )
}
