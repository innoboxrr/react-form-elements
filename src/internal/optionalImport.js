/**
 * Importa un paquete que puede no estar instalado.
 *
 * Con un literal, Vite resuelve el `import()` en tiempo de transformación y
 * aborta el build si el paquete no existe — que es justo lo contrario de
 * "opcional". Con el especificador en una variable y `@vite-ignore` la
 * resolución se deja al runtime, donde un fallo es un `catch` y no un build
 * roto.
 *
 * @param {string} specifier
 * @returns {Promise<any>}
 */
export default function optionalImport(specifier) {
    return import(/* @vite-ignore */ specifier)
}
