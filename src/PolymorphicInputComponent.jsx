import { useId, useState } from 'react'
import CheckboxInputComponent from './CheckboxInputComponent.jsx'
import EditorInputComponent from './EditorInputComponent.jsx'
import RadioInputComponent from './RadioInputComponent.jsx'
import SelectInputComponent from './SelectInputComponent.jsx'
import SimpleFileInputComponent from './SimpleFileInputComponent.jsx'
import SwitchComponent from './SwitchComponent.jsx'
import TextInputComponent from './TextInputComponent.jsx'
import TextareaInputComponent from './TextareaInputComponent.jsx'
import useControlled from './internal/useControlled.js'

const TEXT_TYPES = ['text', 'number', 'date', 'time', 'url', 'email']

/**
 * Gemelo de PolymorphicInputComponent.vue: un solo componente que decide qué
 * control pintar a partir de `config.type`.
 *
 * En Vue el prop se llama literalmente `props`; aquí se llama `config`, que es
 * lo que significa, y se acepta `props` como alias para no romper a quien ya
 * lo pasaba así.
 */
export default function PolymorphicInputComponent({
    config,
    props: legacyConfig,
    value,
    onChange,
    onSave,
    onEnter,
    onInput,
    onFocus,
    onBlur,
}) {
    const settings = config ?? legacyConfig ?? {}
    const uid = useId()
    const [current, set] = useControlled(value, onChange, '')
    const [dirty, setDirty] = useState(false)

    const update = (next) => {
        setDirty(true)
        set(next)
    }

    const saveButton = onSave && dirty ? (
        <button
            type="button"
            className="fe-button fe-button-sm"
            onClick={() => {
                setDirty(false)
                onSave(current)
            }}>
            &check;
        </button>
    ) : null

    const control = () => {
        if (TEXT_TYPES.includes(settings.type)) {
            return (
                <TextInputComponent
                    label={settings.label}
                    icon={settings.icon}
                    customClass={settings.customClass}
                    type={settings.type}
                    name={settings.name}
                    placeholder={settings.placeholder}
                    validators={settings.validators}
                    minLength={settings.minLength}
                    maxLength={settings.maxLength}
                    readOnly={settings.readonly}
                    value={current}
                    onChange={update}
                    onEnter={onEnter}
                    onInput={onInput}
                    onFocus={onFocus}
                    onBlur={onBlur} />
            )
        }

        switch (settings.type) {
            case 'textarea':
                return (
                    <TextareaInputComponent
                        label={settings.label}
                        customClass={settings.customClass}
                        name={settings.name}
                        placeholder={settings.placeholder}
                        validators={settings.validators}
                        minLength={settings.minLength}
                        maxLength={settings.maxLength}
                        value={current}
                        onChange={update} />
                )

            case 'radio':
                return (
                    <div>
                        {settings.label ? <div className="fe-mb"><label>{settings.label}</label></div> : null}
                        {(settings.options ?? []).map((option) => (
                            <RadioInputComponent
                                key={option}
                                customClass={settings.customClass}
                                name={settings.name}
                                validators={settings.validators}
                                text={option}
                                val={option}
                                value={current}
                                onChange={update} />
                        ))}
                    </div>
                )

            case 'checkbox':
                return (
                    <div>
                        {settings.label ? <div className="fe-mb"><label>{settings.label}</label></div> : null}
                        {(settings.options ?? []).map((option) => (
                            <CheckboxInputComponent
                                key={option}
                                customClass={settings.customClass}
                                name={settings.name}
                                validators={settings.validators}
                                text={option}
                                val={option}
                                value={Array.isArray(current) ? current : []}
                                onChange={update} />
                        ))}
                    </div>
                )

            case 'select':
                return (
                    <SelectInputComponent
                        label={settings.label}
                        customClass={settings.customClass}
                        name={settings.name}
                        validators={settings.validators}
                        value={current}
                        onChange={update}>
                        <option value="">{settings.placeholder ?? ''}</option>
                        {(settings.options ?? []).map((option) => (
                            <option key={option.value ?? option} value={option.value ?? option}>
                                {option.label ?? option}
                            </option>
                        ))}
                    </SelectInputComponent>
                )

            case 'switch':
                return <SwitchComponent value={Boolean(current)} onChange={update} />

            case 'editor':
                return (
                    <EditorInputComponent
                        id={uid}
                        name={settings.name}
                        label={settings.label}
                        value={current}
                        onChange={update} />
                )

            case 'file':
                return (
                    <SimpleFileInputComponent
                        inputName={settings.name}
                        label={settings.label}
                        onInput={(file) => update(file)} />
                )

            default:
                return <div>{`Tipo de campo desconocido: ${settings.type}`}</div>
        }
    }

    return (
        <div>
            <div className="fe-grid-sm" fe-grid="">
                <div className="fe-w-expand">{control()}</div>
                {saveButton ? <div className="fe-w-auto">{saveButton}</div> : null}
            </div>
        </div>
    )
}
