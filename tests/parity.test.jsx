import { describe, expect, it } from 'vitest'
import * as react from '../index.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * El generador emite el mismo `form_component` del laraimport para Vue y para
 * React. Si un nombre existe en un paquete y no en el otro, ese laraimport
 * genera un módulo que no compila — y no lo descubriría nadie hasta el build.
 */
describe('paridad con innoboxrr-form-elements', () => {
    const vueExports = () => {
        // El gemelo Vue es un paquete hermano en npm/.
        const path = resolve(process.cwd(), '../form-elements/index.js')
        const source = readFileSync(path, 'utf8')
        const block = source.slice(source.lastIndexOf('export {'))

        return block
            .replace(/export\s*\{|\}/g, '')
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
    }

    it('exporta exactamente los mismos componentes que la version Vue', () => {
        const vue = vueExports().sort()
        const twin = Object.keys(react).sort()

        expect(twin).toEqual(vue)
    })

    it('todos los exports son componentes', () => {
        for (const [name, component] of Object.entries(react)) {
            expect(typeof component, `${name} no es un componente`).toBe('function')
        }
    })
})
