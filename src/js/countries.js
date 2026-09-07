/**
 * Prefijos telefónicos por país.
 *
 * La versión Vue los saca de vue-tel-input. React no tiene un equivalente que
 * merezca la dependencia para lo que se usa aquí — elegir prefijo y escribir
 * el número —, así que la lista viaja con el paquete.
 *
 * @type {Array<{iso2: string, name: string, dialCode: string}>}
 */
const countries = [
    { iso2: 'AR', name: 'Argentina', dialCode: '54' },
    { iso2: 'BO', name: 'Bolivia', dialCode: '591' },
    { iso2: 'BR', name: 'Brasil', dialCode: '55' },
    { iso2: 'CA', name: 'Canadá', dialCode: '1' },
    { iso2: 'CL', name: 'Chile', dialCode: '56' },
    { iso2: 'CO', name: 'Colombia', dialCode: '57' },
    { iso2: 'CR', name: 'Costa Rica', dialCode: '506' },
    { iso2: 'CU', name: 'Cuba', dialCode: '53' },
    { iso2: 'DO', name: 'República Dominicana', dialCode: '1' },
    { iso2: 'EC', name: 'Ecuador', dialCode: '593' },
    { iso2: 'SV', name: 'El Salvador', dialCode: '503' },
    { iso2: 'ES', name: 'España', dialCode: '34' },
    { iso2: 'US', name: 'Estados Unidos', dialCode: '1' },
    { iso2: 'GT', name: 'Guatemala', dialCode: '502' },
    { iso2: 'HN', name: 'Honduras', dialCode: '504' },
    { iso2: 'MX', name: 'México', dialCode: '52' },
    { iso2: 'NI', name: 'Nicaragua', dialCode: '505' },
    { iso2: 'PA', name: 'Panamá', dialCode: '507' },
    { iso2: 'PY', name: 'Paraguay', dialCode: '595' },
    { iso2: 'PE', name: 'Perú', dialCode: '51' },
    { iso2: 'PR', name: 'Puerto Rico', dialCode: '1' },
    { iso2: 'UY', name: 'Uruguay', dialCode: '598' },
    { iso2: 'VE', name: 'Venezuela', dialCode: '58' },

    { iso2: 'DE', name: 'Alemania', dialCode: '49' },
    { iso2: 'AT', name: 'Austria', dialCode: '43' },
    { iso2: 'BE', name: 'Bélgica', dialCode: '32' },
    { iso2: 'DK', name: 'Dinamarca', dialCode: '45' },
    { iso2: 'FI', name: 'Finlandia', dialCode: '358' },
    { iso2: 'FR', name: 'Francia', dialCode: '33' },
    { iso2: 'GR', name: 'Grecia', dialCode: '30' },
    { iso2: 'IE', name: 'Irlanda', dialCode: '353' },
    { iso2: 'IT', name: 'Italia', dialCode: '39' },
    { iso2: 'NO', name: 'Noruega', dialCode: '47' },
    { iso2: 'NL', name: 'Países Bajos', dialCode: '31' },
    { iso2: 'PL', name: 'Polonia', dialCode: '48' },
    { iso2: 'PT', name: 'Portugal', dialCode: '351' },
    { iso2: 'GB', name: 'Reino Unido', dialCode: '44' },
    { iso2: 'CZ', name: 'República Checa', dialCode: '420' },
    { iso2: 'RO', name: 'Rumanía', dialCode: '40' },
    { iso2: 'RU', name: 'Rusia', dialCode: '7' },
    { iso2: 'SE', name: 'Suecia', dialCode: '46' },
    { iso2: 'CH', name: 'Suiza', dialCode: '41' },
    { iso2: 'TR', name: 'Turquía', dialCode: '90' },
    { iso2: 'UA', name: 'Ucrania', dialCode: '380' },

    { iso2: 'ZA', name: 'Sudáfrica', dialCode: '27' },
    { iso2: 'EG', name: 'Egipto', dialCode: '20' },
    { iso2: 'MA', name: 'Marruecos', dialCode: '212' },
    { iso2: 'NG', name: 'Nigeria', dialCode: '234' },

    { iso2: 'AU', name: 'Australia', dialCode: '61' },
    { iso2: 'CN', name: 'China', dialCode: '86' },
    { iso2: 'KR', name: 'Corea del Sur', dialCode: '82' },
    { iso2: 'AE', name: 'Emiratos Árabes Unidos', dialCode: '971' },
    { iso2: 'PH', name: 'Filipinas', dialCode: '63' },
    { iso2: 'IN', name: 'India', dialCode: '91' },
    { iso2: 'ID', name: 'Indonesia', dialCode: '62' },
    { iso2: 'IL', name: 'Israel', dialCode: '972' },
    { iso2: 'JP', name: 'Japón', dialCode: '81' },
    { iso2: 'MY', name: 'Malasia', dialCode: '60' },
    { iso2: 'NZ', name: 'Nueva Zelanda', dialCode: '64' },
    { iso2: 'SG', name: 'Singapur', dialCode: '65' },
    { iso2: 'TH', name: 'Tailandia', dialCode: '66' },
    { iso2: 'VN', name: 'Vietnam', dialCode: '84' },
]

/**
 * La bandera como emoji, calculada del ISO: dos letras desplazadas al bloque
 * de indicadores regionales. Evita empaquetar 60 imágenes.
 */
export const flagFor = (iso2) => String.fromCodePoint(
    ...iso2.toUpperCase().split('').map((letter) => 0x1F1E6 + letter.charCodeAt(0) - 65)
)

export default countries
