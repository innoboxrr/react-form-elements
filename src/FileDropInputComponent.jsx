import { useRef, useState } from 'react'
import IconComponent from './IconComponent.jsx'
import useTheme from './internal/useTheme.js'

/**
 * Gemelo de FileDropInputComponent.vue. `onFilesChange` recibe un array de
 * File, venga de arrastrar o del diálogo.
 *
 * `fe-file-drop` no lo definía ninguna hoja, así que la zona salía sin borde ni
 * resalte. Ahora sale del tema, con el mismo icono y el mismo texto secundario
 * que la rama Vue.
 */
export default function FileDropInputComponent({
    multiple = false,
    accept = undefined,
    mainText = 'Arrastra y suelta el archivo aquí',
    subText = 'o haz clic para seleccionar los archivos.',
    onFilesChange,
}) {
    const theme = useTheme()
    const input = useRef(null)
    const [dragging, setDragging] = useState(false)

    return (
        <div
            className={theme.fileDrop}
            data-dragging={dragging}
            role="button"
            tabIndex={0}
            onClick={() => input.current?.click()}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
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
            <IconComponent name="media" size={32} />

            <p>{mainText}</p>
            <p className={theme.fileDropHint}>{subText}</p>

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
