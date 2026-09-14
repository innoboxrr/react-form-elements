/**
 * Los lenguajes que CodeMirrorComponent carga bajo demanda.
 *
 * Antes se importaban de forma estática los cuatro, así que cualquier
 * aplicación que montara el editor los llevaba todos. El piloto de la
 * aplicación base generó un chunk de 580 kB (200 kB gzip) para un editor que
 * solo edita JSON. Con `import()` cada lenguaje es un chunk aparte, y solo se
 * descarga el que se pide.
 *
 * Los especificadores son literales a propósito: es lo que permite al
 * empaquetador partirlos. Y la lista es cerrada: solo carga un lenguaje que
 * esté aquí, nunca una cadena que llegue por props.
 */
const LOADERS = {
    javascript: () => import('@codemirror/lang-javascript').then((module) => module.javascript()),
    json: () => import('@codemirror/lang-json').then((module) => module.json()),
    html: () => import('@codemirror/lang-html').then((module) => module.html()),
    css: () => import('@codemirror/lang-css').then((module) => module.css()),
}

/**
 * Lo ya cargado, para que un editor que se vuelve a montar —el contenido de
 * un diálogo solo existe mientras está abierto— arranque con su lenguaje y
 * no pase por el texto plano otra vez.
 *
 * @type {Map<string, import('@codemirror/state').Extension>}
 */
const loaded = new Map()

/**
 * @param {unknown} name
 * @returns {boolean}
 */
export const isSupportedLanguage = (name) =>
    typeof name === 'string' && Object.hasOwn(LOADERS, name)

/**
 * El lenguaje si ya está cargado; si no, `null`.
 *
 * @param {string} name
 */
export const cachedLanguage = (name) => (isSupportedLanguage(name) ? (loaded.get(name) ?? null) : null)

/**
 * Carga un lenguaje soportado. Resuelve `null` para uno desconocido, o si el
 * chunk no llega: el editor sigue funcionando como texto plano en vez de
 * dejar una promesa rechazada sin atender.
 *
 * @param {string} name
 * @returns {Promise<import('@codemirror/state').Extension|null>}
 */
export function loadLanguage(name) {
    if (! isSupportedLanguage(name)) {
        return Promise.resolve(null)
    }

    if (loaded.has(name)) {
        return Promise.resolve(loaded.get(name))
    }

    return LOADERS[name]()
        .then((support) => {
            loaded.set(name, support)

            return support
        })
        .catch(() => null)
}
