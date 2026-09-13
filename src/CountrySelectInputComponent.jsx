import { useId, useState } from 'react'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import useTheme, { joinClasses } from './internal/useTheme.js'

/**
 * Gemelo de CountrySelectInputComponent.vue.
 *
 * La versión Vue envuelve vue-tel-input, que por debajo usa libphonenumber-js.
 * `react-phone-number-input` es exactamente eso mismo en React: el mismo
 * libphonenumber, la misma validación por país y el mismo selector con
 * banderas. Antes esto era una lista de prefijos escrita a mano, que se queda
 * desactualizada sola y valida cualquier cosa de 6 a 15 dígitos.
 *
 * `onCountryChange` recibe `{ phone, country, isValid }`, la misma forma que
 * emitía `change` en Vue, para que el formulario que ya lo consumía siga
 * funcionando igual.
 *
 * La hoja de la librería la importa el componente, igual que el de Vue. Antes
 * la tenía que importar la aplicación y, si no lo hacía, el selector de país y
 * el campo salían como controles nativos sin forma. El aspecto sale del tema
 * (`phone`, `phoneInvalid`).
 */
export default function CountrySelectInputComponent({
    // Sin valor, cada una sale de su token del tema.
    wrapperClass = null,
    containerClass = null,
    labelClass = null,
    label = '',
    help = null,
    defaultPhone = '',
    defaultCountry = null,
    disabled = false,
    name = 'telephone',
    id = null,
    placeholder = 'Ingresa un número telefónico',
    validators = null,
    onCountryChange,
    ...rest
}) {
    const theme = useTheme()

    // Con el nombre como id, dos teléfonos en la misma página compartían id y
    // la etiqueta del segundo enfocaba el primero.
    const generatedId = useId()
    const inputId = id ?? `${name}-${generatedId}`

    const [phone, setPhone] = useState(defaultPhone ? String(defaultPhone) : '')
    const [country, setCountry] = useState(defaultCountry ?? undefined)

    const valid = Boolean(phone) && isValidPhoneNumber(phone)
    const invalid = ! valid && phone.length !== 0

    const announce = (nextPhone, nextCountry) => {
        const isValid = Boolean(nextPhone) && isValidPhoneNumber(nextPhone)
        const parsed = isValid ? parsePhoneNumber(nextPhone) : null

        onCountryChange?.({
            phone: isValid ? nextPhone : '',
            country: parsed?.country ?? nextCountry ?? null,
            callingCode: parsed?.countryCallingCode ?? null,
            national: parsed?.nationalNumber ?? null,
            isValid,
        })
    }

    return (
        <div className={wrapperClass ?? theme.field}>
            {label ? <label className={labelClass ?? theme.label} htmlFor={inputId}>{label}</label> : null}

            <div className={containerClass ?? theme.fieldInner}>
                <PhoneInput
                    id={inputId}
                    name={name}
                    className={joinClasses(theme.phone, invalid && theme.phoneInvalid)}
                    aria-invalid={invalid || undefined}
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry={defaultCountry ?? undefined}
                    disabled={disabled}
                    placeholder={placeholder}
                    data-validators={validators ?? undefined}
                    value={phone}
                    onCountryChange={(next) => {
                        setCountry(next)
                        announce(phone, next)
                    }}
                    onChange={(next) => {
                        const clean = next ?? ''

                        setPhone(clean)
                        announce(clean, country)
                    }}
                    {...rest} />
            </div>

            {help ? <p className="fe-text-muted fe-text-sm">{help}</p> : null}
        </div>
    )
}

export { isValidPhoneNumber, parsePhoneNumber }
