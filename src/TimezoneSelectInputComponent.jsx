import SelectSearchInputComponent from './SelectSearchInputComponent.jsx'
import { timezones } from 'innoboxrr-form-core'

/**
 * Gemelo de TimezoneSelectInputComponent.vue: el buscador con la lista de
 * zonas horarias ya cargada. El valor que sale es la cadena IANA.
 */
export default function TimezoneSelectInputComponent({
    label = '',
    placeholder = 'Select a timezone',
    help = null,
    name,
    validators = '',
    value,
    onChange,
    ...rest
}) {
    return (
        <SelectSearchInputComponent
            name={name}
            inputLabel={label}
            help={help}
            validators={validators}
            placeholder={placeholder}
            options={timezones}
            label="label"
            reduce={(option) => option.value}
            value={value}
            onChange={onChange}
            {...rest} />
    )
}
