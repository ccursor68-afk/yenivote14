// Country list with codes and flags
// Format: { code: 'ISO 3166-1 alpha-2', name: { tr: 'Turkish Name', en: 'English Name' }, flag: 'emoji' }

export const countries = [
  { code: 'TR', name: { tr: 'Türkiye', en: 'Turkey' }, flag: '🇹🇷' },
  { code: 'US', name: { tr: 'Amerika Birleşik Devletleri', en: 'United States' }, flag: '🇺🇸' },
  { code: 'GB', name: { tr: 'İngiltere', en: 'United Kingdom' }, flag: '🇬🇧' },
  { code: 'DE', name: { tr: 'Almanya', en: 'Germany' }, flag: '🇩🇪' },
  { code: 'FR', name: { tr: 'Fransa', en: 'France' }, flag: '🇫🇷' },
  { code: 'NL', name: { tr: 'Hollanda', en: 'Netherlands' }, flag: '🇳🇱' },
  { code: 'PL', name: { tr: 'Polonya', en: 'Poland' }, flag: '🇵🇱' },
  { code: 'RU', name: { tr: 'Rusya', en: 'Russia' }, flag: '🇷🇺' },
  { code: 'BR', name: { tr: 'Brezilya', en: 'Brazil' }, flag: '🇧🇷' },
  { code: 'CA', name: { tr: 'Kanada', en: 'Canada' }, flag: '🇨🇦' },
  { code: 'AU', name: { tr: 'Avustralya', en: 'Australia' }, flag: '🇦🇺' },
  { code: 'JP', name: { tr: 'Japonya', en: 'Japan' }, flag: '🇯🇵' },
  { code: 'KR', name: { tr: 'Güney Kore', en: 'South Korea' }, flag: '🇰🇷' },
  { code: 'CN', name: { tr: 'Çin', en: 'China' }, flag: '🇨🇳' },
  { code: 'IN', name: { tr: 'Hindistan', en: 'India' }, flag: '🇮🇳' },
  { code: 'MX', name: { tr: 'Meksika', en: 'Mexico' }, flag: '🇲🇽' },
  { code: 'ES', name: { tr: 'İspanya', en: 'Spain' }, flag: '🇪🇸' },
  { code: 'IT', name: { tr: 'İtalya', en: 'Italy' }, flag: '🇮🇹' },
  { code: 'SE', name: { tr: 'İsveç', en: 'Sweden' }, flag: '🇸🇪' },
  { code: 'NO', name: { tr: 'Norveç', en: 'Norway' }, flag: '🇳🇴' },
  { code: 'DK', name: { tr: 'Danimarka', en: 'Denmark' }, flag: '🇩🇰' },
  { code: 'FI', name: { tr: 'Finlandiya', en: 'Finland' }, flag: '🇫🇮' },
  { code: 'BE', name: { tr: 'Belçika', en: 'Belgium' }, flag: '🇧🇪' },
  { code: 'AT', name: { tr: 'Avusturya', en: 'Austria' }, flag: '🇦🇹' },
  { code: 'CH', name: { tr: 'İsviçre', en: 'Switzerland' }, flag: '🇨🇭' },
  { code: 'PT', name: { tr: 'Portekiz', en: 'Portugal' }, flag: '🇵🇹' },
  { code: 'GR', name: { tr: 'Yunanistan', en: 'Greece' }, flag: '🇬🇷' },
  { code: 'CZ', name: { tr: 'Çekya', en: 'Czech Republic' }, flag: '🇨🇿' },
  { code: 'RO', name: { tr: 'Romanya', en: 'Romania' }, flag: '🇷🇴' },
  { code: 'HU', name: { tr: 'Macaristan', en: 'Hungary' }, flag: '🇭🇺' },
  { code: 'BG', name: { tr: 'Bulgaristan', en: 'Bulgaria' }, flag: '🇧🇬' },
  { code: 'UA', name: { tr: 'Ukrayna', en: 'Ukraine' }, flag: '🇺🇦' },
  { code: 'SK', name: { tr: 'Slovakya', en: 'Slovakia' }, flag: '🇸🇰' },
  { code: 'HR', name: { tr: 'Hırvatistan', en: 'Croatia' }, flag: '🇭🇷' },
  { code: 'RS', name: { tr: 'Sırbistan', en: 'Serbia' }, flag: '🇷🇸' },
  { code: 'SI', name: { tr: 'Slovenya', en: 'Slovenia' }, flag: '🇸🇮' },
  { code: 'LT', name: { tr: 'Litvanya', en: 'Lithuania' }, flag: '🇱🇹' },
  { code: 'LV', name: { tr: 'Letonya', en: 'Latvia' }, flag: '🇱🇻' },
  { code: 'EE', name: { tr: 'Estonya', en: 'Estonia' }, flag: '🇪🇪' },
  { code: 'IE', name: { tr: 'İrlanda', en: 'Ireland' }, flag: '🇮🇪' },
  { code: 'NZ', name: { tr: 'Yeni Zelanda', en: 'New Zealand' }, flag: '🇳🇿' },
  { code: 'SG', name: { tr: 'Singapur', en: 'Singapore' }, flag: '🇸🇬' },
  { code: 'MY', name: { tr: 'Malezya', en: 'Malaysia' }, flag: '🇲🇾' },
  { code: 'TH', name: { tr: 'Tayland', en: 'Thailand' }, flag: '🇹🇭' },
  { code: 'ID', name: { tr: 'Endonezya', en: 'Indonesia' }, flag: '🇮🇩' },
  { code: 'PH', name: { tr: 'Filipinler', en: 'Philippines' }, flag: '🇵🇭' },
  { code: 'VN', name: { tr: 'Vietnam', en: 'Vietnam' }, flag: '🇻🇳' },
  { code: 'ZA', name: { tr: 'Güney Afrika', en: 'South Africa' }, flag: '🇿🇦' },
  { code: 'EG', name: { tr: 'Mısır', en: 'Egypt' }, flag: '🇪🇬' },
  { code: 'SA', name: { tr: 'Suudi Arabistan', en: 'Saudi Arabia' }, flag: '🇸🇦' },
  { code: 'AE', name: { tr: 'Birleşik Arap Emirlikleri', en: 'United Arab Emirates' }, flag: '🇦🇪' },
  { code: 'IL', name: { tr: 'İsrail', en: 'Israel' }, flag: '🇮🇱' },
  { code: 'AR', name: { tr: 'Arjantin', en: 'Argentina' }, flag: '🇦🇷' },
  { code: 'CL', name: { tr: 'Şili', en: 'Chile' }, flag: '🇨🇱' },
  { code: 'CO', name: { tr: 'Kolombiya', en: 'Colombia' }, flag: '🇨🇴' },
  { code: 'PE', name: { tr: 'Peru', en: 'Peru' }, flag: '🇵🇪' },
  { code: 'VE', name: { tr: 'Venezuela', en: 'Venezuela' }, flag: '🇻🇪' },
  { code: 'PK', name: { tr: 'Pakistan', en: 'Pakistan' }, flag: '🇵🇰' },
  { code: 'BD', name: { tr: 'Bangladeş', en: 'Bangladesh' }, flag: '🇧🇩' },
  { code: 'NG', name: { tr: 'Nijerya', en: 'Nigeria' }, flag: '🇳🇬' },
  { code: 'KE', name: { tr: 'Kenya', en: 'Kenya' }, flag: '🇰🇪' },
  { code: 'MA', name: { tr: 'Fas', en: 'Morocco' }, flag: '🇲🇦' },
  { code: 'TN', name: { tr: 'Tunus', en: 'Tunisia' }, flag: '🇹🇳' },
  { code: 'DZ', name: { tr: 'Cezayir', en: 'Algeria' }, flag: '🇩🇿' },
  { code: 'AZ', name: { tr: 'Azerbaycan', en: 'Azerbaijan' }, flag: '🇦🇿' },
  { code: 'GE', name: { tr: 'Gürcistan', en: 'Georgia' }, flag: '🇬🇪' },
  { code: 'AM', name: { tr: 'Ermenistan', en: 'Armenia' }, flag: '🇦🇲' },
  { code: 'KZ', name: { tr: 'Kazakistan', en: 'Kazakhstan' }, flag: '🇰🇿' },
  { code: 'UZ', name: { tr: 'Özbekistan', en: 'Uzbekistan' }, flag: '🇺🇿' },
  { code: 'BY', name: { tr: 'Belarus', en: 'Belarus' }, flag: '🇧🇾' },
  { code: 'MD', name: { tr: 'Moldova', en: 'Moldova' }, flag: '🇲🇩' },
  { code: 'MK', name: { tr: 'Kuzey Makedonya', en: 'North Macedonia' }, flag: '🇲🇰' },
  { code: 'AL', name: { tr: 'Arnavutluk', en: 'Albania' }, flag: '🇦🇱' },
  { code: 'BA', name: { tr: 'Bosna Hersek', en: 'Bosnia and Herzegovina' }, flag: '🇧🇦' },
  { code: 'ME', name: { tr: 'Karadağ', en: 'Montenegro' }, flag: '🇲🇪' },
  { code: 'XK', name: { tr: 'Kosova', en: 'Kosovo' }, flag: '🇽🇰' },
  { code: 'CY', name: { tr: 'Kıbrıs', en: 'Cyprus' }, flag: '🇨🇾' },
  { code: 'MT', name: { tr: 'Malta', en: 'Malta' }, flag: '🇲🇹' },
  { code: 'IS', name: { tr: 'İzlanda', en: 'Iceland' }, flag: '🇮🇸' },
  { code: 'LU', name: { tr: 'Lüksemburg', en: 'Luxembourg' }, flag: '🇱🇺' },
  { code: 'TW', name: { tr: 'Tayvan', en: 'Taiwan' }, flag: '🇹🇼' },
  { code: 'HK', name: { tr: 'Hong Kong', en: 'Hong Kong' }, flag: '🇭🇰' },
  { code: 'GLOBAL', name: { tr: 'Global / Uluslararası', en: 'Global / International' }, flag: '🌍' }
];

// Helper function to get country by code
export const getCountryByCode = (code) => {
  return countries.find(c => c.code === code) || null;
};

// Helper function to get flag by code
export const getFlagByCode = (code) => {
  const country = getCountryByCode(code);
  return country ? country.flag : '🌍';
};

// Helper function to get country name by code and language
export const getCountryName = (code, lang = 'tr') => {
  const country = getCountryByCode(code);
  return country ? country.name[lang] || country.name.en : code;
};

export default countries;
