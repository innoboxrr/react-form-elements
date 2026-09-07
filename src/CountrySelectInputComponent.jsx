import { useMemo, useState } from 'react'
import countries, { flagFor } from './js/countries.js'

/**
 * Gemelo de CountrySelectInputComponent.vue.
 *
 * `onCountryChange` recibe `{ phone, country, isValid }`, la misma forma que
 * emitía `change` en Vue, para que el formulario que ya lo consumía siga
 * funcionando igual.
 */
export default function CountrySelectInputComponent({
    wrapperClass = 'uk-margin',
    containerClass = 'uk-inline uk-width-1-1',
    labelClass = 'ml-2 text-sm font-medium text-gray-900 dark:text-white',
    label = '',
    defaultPhone = '',
    defaultCountry = null,
    disabled = false,
    preferredCountries = [],
    inputOptions = {},
    onCountryChange,
}) {
    const [phone, setPhone] = useState(String(defaultPhone ?? ''))
    const [iso, setIso] = useState(defaultCountry ?? countries[0].iso2)

    const ordered = useMemo(() => {
        if (! preferredCountries.length) {
            return countries
        }

        const preferred = preferredCountries
            .map((code) => countries.find((country) => country.iso2 === code))
            .filter(Boolean)

        return [...preferred, ...countries.filter((country) => ! preferredCountries.includes(country.iso2))]
    }, [preferredCountries])

    const country = countries.find((item) => item.iso2 === iso) ?? countries[0]

    // El original delegaba la validacion en vue-tel-input. Aqui basta con
    // exigir de 6 a 15 digitos, que es el rango de E.164.
    const digits = phone.replace(/\D/g, '')
    const isValid = digits.length >= 6 && digits.length <= 15

    const announce = (nextPhone, nextIso) => {
        const nextCountry = countries.find((item) => item.iso2 === nextIso) ?? country
        const nextDigits = nextPhone.replace(/\D/g, '')
        const valid = nextDigits.length >= 6 && nextDigits.length <= 15

        onCountryChange?.({
            phone: valid ? `+${nextCountry.dialCode}${nextDigits}` : '',
            country: nextCountry,
            isValid: valid,
        })
    }

    const options = { name: 'telephone', placeholder: 'Ingresa un número telefónico', maxLength: 12, ...inputOptions }

    return (
        <div className={wrapperClass}>
            <div className={containerClass}>
                {label ? <label className={labelClass}>{label}</label> : null}

                <div className="uk-flex" style={{ gap: '0.5rem' }}>
                    <select
                        className="uk-select"
                        style={{ maxWidth: '10rem' }}
                        aria-label="País"
                        disabled={disabled}
                        value={iso}
                        onChange={(event) => {
                            setIso(event.target.value)
                            announce(phone, event.target.value)
                        }}>
                        {ordered.map((item) => (
                            <option key={item.iso2} value={item.iso2}>
                                {flagFor(item.iso2)} {item.name} +{item.dialCode}
                            </option>
                        ))}
                    </select>

                    <input
                        className={['uk-input', (! isValid && phone.length !== 0) ? 'error' : ''].filter(Boolean).join(' ')}
                        type="tel"
                        name={options.name}
                        placeholder={options.placeholder}
                        maxLength={options.maxLength}
                        disabled={disabled}
                        value={phone}
                        onChange={(event) => {
                            // valid-characters-only en vue-tel-input.
                            const clean = event.target.value.replace(/[^\d\s()+-]/g, '')

                            setPhone(clean)
                            announce(clean, iso)
                        }}
                        onBlur={() => {
                            if (isValid) {
                                return
                            }

                            setPhone('')
                            onCountryChange?.({ phone: '', country, isValid: false })
                        }} />
                </div>
            </div>
        </div>
    )
}
