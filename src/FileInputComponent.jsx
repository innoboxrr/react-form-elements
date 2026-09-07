import { useCallback, useMemo, useRef, useState } from 'react'
import { isImage, sizeParser, validateFiles } from './js/files.js'

const DEFAULT_MIMES = [
    'text/plain',
    'image/gif', 'image/jpeg', 'image/png',
    'audio/mp3', 'audio/mpeg', 'audio/midi',
    'video/mp4', 'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
]

/**
 * Gemelo de FileInputComponent.vue: soltar o elegir archivos, validarlos y
 * subirlos a `uploadUrl`.
 *
 * Se conservan los tres avisos del original — `onStartUpload`,
 * `onFileListChange`, `onEndUpload` —, con nombres de prop de React.
 */
export default function FileInputComponent({
    uploadUrl,
    method = 'POST',
    autoUpload = false,
    name = 'file',
    visibility = 'public',
    maxSize = 0,
    totalMaxSize = 0,
    maxFiles = 1,
    validMimes = DEFAULT_MIMES,
    onStartUpload,
    onFileListChange,
    onEndUpload,
}) {
    const input = useRef(null)
    const [files, setFiles] = useState([])
    const [errors, setErrors] = useState([])
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)

    const rules = useMemo(() => ({ maxSize, validMimes }), [maxSize, validMimes])

    const multiple = maxFiles > 1
    const maxFilesReached = files.length >= maxFiles

    const csrfToken = () => globalThis.csrf_token
        ?? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        ?? ''

    const push = useCallback(async (incoming) => {
        if (uploading) {
            return
        }

        const validated = await validateFiles(incoming, rules)

        setFiles((current) => [...current, ...validated.filter((file) => file.validation === true)])
        setErrors((current) => [...current, ...validated.filter((file) => file.validation === false)])
    }, [rules, uploading])

    const upload = async () => {
        setUploading(true)
        onStartUpload?.(true)

        const uploaded = []

        for (const file of files) {
            if (file.uploaded || ! file.validation) {
                uploaded.push(file)

                continue
            }

            const body = new FormData()

            body.append('_token', csrfToken())
            body.append('file', file)
            body.append('visibility', visibility)

            try {
                const response = await fetch(uploadUrl, { method, body })

                if (! response.ok) {
                    throw new Error('An error has occurred')
                }

                const data = await response.json()

                // El original mutaba el File en sitio. Aqui se copian los
                // datos de la respuesta en una entrada nueva: mutar un File
                // que React tiene en estado no dispara ningun re-render.
                uploaded.push(Object.assign(file, {
                    uploaded: true,
                    path: data.path,
                    id: data.id,
                    response: data,
                }))
            } catch (error) {
                uploaded.push(file)

                setErrors((current) => [...current, { name: file.name, errors: [String(error)] }])
            }
        }

        setFiles(uploaded)
        setUploading(false)

        onFileListChange?.(uploaded)
        onEndUpload?.(true)
    }

    const remove = (target) => {
        // El original hacia `files.pop(file)`: pop() ignora sus argumentos y
        // quita el ultimo lote, asi que borrar un archivo eliminaba otro.
        setFiles((current) => current.filter((file) => file !== target))
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    const overTotal = totalMaxSize > 0 && totalSize > totalMaxSize

    return (
        <div>
            <div
                className="fe-file-drop"
                data-dragging={dragging}
                role="button"
                tabIndex={0}
                onClick={() => (maxFilesReached ? null : input.current?.click())}
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
                    push(Array.from(event.dataTransfer.files))
                }}>
                <p>{maxFilesReached ? 'Máximo de archivos alcanzado' : 'Arrastra y suelta o haz clic'}</p>

                <input
                    ref={input}
                    type="file"
                    name={name}
                    multiple={multiple}
                    style={{ display: 'none' }}
                    onChange={(event) => {
                        push(Array.from(event.target.files ?? []))
                        event.target.value = ''
                    }} />
            </div>

            <ul className="uk-list">
                {files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                        {isImage(file) ? <img src={file.preview} alt={file.name} width="48" /> : null}
                        <span>{file.name}</span>
                        <span> ({sizeParser(file.size)})</span>
                        {file.uploaded ? <span> ✓</span> : null}
                        <button type="button" onClick={() => remove(file)}>&times;</button>
                    </li>
                ))}
            </ul>

            {errors.length ? (
                <ul className="uk-list text-red-600">
                    {errors.map((file, index) => (
                        <li key={`${file.name}-error-${index}`}>{file.name}: {file.errors?.join(', ')}</li>
                    ))}
                </ul>
            ) : null}

            {overTotal ? <p className="text-red-600">El tamaño total supera el máximo permitido.</p> : null}

            {! autoUpload && files.length ? (
                <button type="button" className="uk-button" disabled={uploading || overTotal} onClick={upload}>
                    {uploading ? 'Subiendo…' : 'Subir'}
                </button>
            ) : null}
        </div>
    )
}
