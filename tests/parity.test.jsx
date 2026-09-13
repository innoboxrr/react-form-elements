import { describe, expect, it } from 'vitest'
import * as react from '../index.js'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * El generador emite el mismo `form_component` del laraimport para Vue y para
 * React. Si un nombre existe en un paquete y no en el otro, ese laraimport
 * genera un módulo que no compila — y no lo descubriría nadie hasta el build.
 *
 * La lista canónica vive aquí escrita a mano, y no leyendo el paquete hermano,
 * porque en CI solo se clona este repositorio: la versión anterior resolvía
 * `../form-elements/index.js`, que existe en el monorepo y no en el runner, y
 * por eso el CI fallaba con ENOENT mientras en local pasaba.
 *
 * La misma lista está en el test de paridad de la rama Vue. Cuando el hermano
 * está a mano —trabajando en el monorepo— se comprueba además contra él.
 */
const CANONICAL = [
    'AvatarInputComponent',
    'ButtonComponent',
    'CheckboxInputComponent',
    'ClickToEditComponent',
    'CodeInputComponent',
    'CodeMirrorComponent',
    'ColorPickerInputComponent',
    'CommandPaletteComponent',
    'ConfirmHostComponent',
    'CountrySelectInputComponent',
    'DialogComponent',
    'DrawerComponent',
    'DynamicGroupInputComponent',
    'EditorInputComponent',
    'FileDropInputComponent',
    'FileInputComponent',
    'FqsInputComponent',
    'IconComponent',
    'InputErrorComponent',
    'MenuComponent',
    'ModelSearchInputComponent',
    'MultiCheckboxInputComponent',
    'PolymorphicInputComponent',
    'RadioInputComponent',
    'SelectInputComponent',
    'SelectSearchInputComponent',
    'SimpleFileInputComponent',
    'SingleCheckboxInputComponent',
    'SkeletonComponent',
    'StarsInputComponent',
    'SwitchComponent',
    'TagsInputComponent',
    'TextEditorMonoStyleInputComponent',
    'TextInputComponent',
    'TextareaInputComponent',
    'TimezoneSelectInputComponent',
    'ToastRegionComponent',
]

describe('paridad con innoboxrr-form-elements', () => {
    it('exporta exactamente los componentes de la lista canonica', () => {
        expect(Object.keys(react).sort()).toEqual([...CANONICAL].sort())
    })

    it('todos los exports son componentes', () => {
        for (const [name, component] of Object.entries(react)) {
            expect(typeof component, `${name} no es un componente`).toBe('function')
        }
    })

    it('la rama Vue exporta lo mismo, cuando esta a mano', () => {
        const path = resolve(process.cwd(), '../form-elements/index.js')

        if (! existsSync(path)) {
            // En CI solo está este repositorio; la lista canónica ya se
            // comprobó arriba.
            return
        }

        const source = readFileSync(path, 'utf8')
        const block = source.slice(source.lastIndexOf('export {'))

        const vue = block
            .replace(/export\s*\{|\}/g, '')
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
            .sort()

        expect(vue).toEqual([...CANONICAL].sort())
    })
})
