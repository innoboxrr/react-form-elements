import { useState } from 'react'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import Field from './internal/Field.jsx'

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
 * Los estilos van una vez por aplicación:
 *
 *     import 'react-phone-number-input/style.css'
 */
export default function CountrySelectInputComponent({
    wrapperClass = 'fe-mb',
    containerClass = 'fe-inline fe-w-full',
    labelClass = 'ml-2 text-sm font-medium text-gray-900 dark:text-white',
    label = '',
    help = null,
    defaultPhone = '',
    defaultCountry = null,
    disabled = false,
    name = 'telephone',
    placeholder = 'Ingresa un número telefónico',
    validators = null,
    onCountryChange,
    ...rest
}) {
    const [phone, setPhone] = useState(defaultPhone ? String(defaultPhone) : '')
    const [country, setCountry] = useState(defaultCountry ?? undefined)

    const valid = Boolean(phone) && isValidPhoneNumber(phone)

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
        <div className={wrapperClass}>
            <div className={containerClass}>
                {label ? <label className={labelClass} htmlFor={name}>{label}</label> : null}

                <PhoneInput
                    id={name}
                    name={name}
                    className={(! valid && phone.length !== 0) ? 'error' : undefined}
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

                {help ? <p className="fe-text-muted">{help}</p> : null}
            </div>
        </div>
    )
}

export { isValidPhoneNumber, parsePhoneNumber }
