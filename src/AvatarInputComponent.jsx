import { useRef, useState } from 'react'

/**
 * Gemelo de AvatarInputComponent.vue: la miniatura redonda que al pulsarla
 * abre el diálogo y sube la imagen. `onUpload` recibe la respuesta del
 * servidor.
 */
export default function AvatarInputComponent({
    avatarUrl,
    uploadUrl,
    uploadMethod = 'POST',
    name = 'avatar',
    onUpload,
}) {
    const input = useRef(null)
    const [preview, setPreview] = useState(null)
    const [uploading, setUploading] = useState(false)

    const csrfToken = () => globalThis.csrf_token
        ?? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        ?? ''

    const upload = async (file) => {
        setPreview(URL.createObjectURL(file))
        setUploading(true)

        const body = new FormData()

        body.append('_token', csrfToken())
        body.append(name, file)

        try {
            const response = await fetch(uploadUrl, { method: uploadMethod, body })

            if (! response.ok) {
                throw new Error('An error has occurred')
            }

            onUpload?.(await response.json())
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <img
                className="fe-avatar-preview"
                src={preview ?? avatarUrl}
                alt="avatar"
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}
                onClick={() => input.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        input.current?.click()
                    }
                }} />

            <input
                ref={input}
                type="file"
                name={name}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(event) => {
                    const file = event.target.files?.[0]

                    if (file) {
                        upload(file)
                    }

                    event.target.value = ''
                }} />
        </div>
    )
}
