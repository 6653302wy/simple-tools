import type { LocalizedText } from '@/services/i18n/constant';

export type CountryKey = 'cn' | 'us' | 'de' | 'jp' | 'uk' | 'au' | 'br' | 'in' | 'ca' | 'fr' | 'kr' | 'mx' | 'za';

export type CountryLocation = {
    city: string;
    country: string;
    label: string;
    limit?: number;
};

export type NetworkCountryDefinition = {
    key: CountryKey;
    countryCode: string;
    mapName: string;
    label: LocalizedText;
    mapCenter: [number, number];
    mapZoom: number;
    overviewLocations: CountryLocation[];
    drillLocations: CountryLocation[];
};

export const networkCountries: NetworkCountryDefinition[] = [
    {
        key: 'cn',
        countryCode: 'CN',
        mapName: 'China',
        label: { zh: '中国', en: 'China' },
        mapCenter: [104, 35],
        mapZoom: 3.2,
        overviewLocations: [
            { city: 'Beijing', country: 'CN', label: 'Beijing' },
            { city: 'Shanghai', country: 'CN', label: 'Shanghai' },
        ],
        drillLocations: [
            { city: 'Beijing', country: 'CN', label: 'Beijing' },
            { city: 'Shanghai', country: 'CN', label: 'Shanghai' },
            { city: 'Guangzhou', country: 'CN', label: 'Guangzhou' },
            { city: 'Shenzhen', country: 'CN', label: 'Shenzhen' },
            { city: 'Hangzhou', country: 'CN', label: 'Hangzhou' },
            { city: 'Chengdu', country: 'CN', label: 'Chengdu' },
            { city: 'Wuhan', country: 'CN', label: 'Wuhan' },
            { city: 'Xi’an', country: 'CN', label: 'Xi’an' },
            { city: 'Nanjing', country: 'CN', label: 'Nanjing' },
            { city: 'Tianjin', country: 'CN', label: 'Tianjin' },
        ],
    },
    {
        key: 'us',
        countryCode: 'US',
        mapName: 'United States of America',
        label: { zh: '美国', en: 'United States' },
        mapCenter: [-98, 39],
        mapZoom: 2.3,
        overviewLocations: [
            { city: 'New York', country: 'US', label: 'New York' },
            { city: 'Los Angeles', country: 'US', label: 'Los Angeles' },
        ],
        drillLocations: [
            { city: 'New York', country: 'US', label: 'New York' },
            { city: 'Los Angeles', country: 'US', label: 'Los Angeles' },
            { city: 'Chicago', country: 'US', label: 'Chicago' },
            { city: 'Seattle', country: 'US', label: 'Seattle' },
            { city: 'Dallas', country: 'US', label: 'Dallas' },
            { city: 'Miami', country: 'US', label: 'Miami' },
            { city: 'Atlanta', country: 'US', label: 'Atlanta' },
            { city: 'Denver', country: 'US', label: 'Denver' },
            { city: 'San Jose', country: 'US', label: 'San Jose' },
            { city: 'Ashburn', country: 'US', label: 'Ashburn' },
        ],
    },
    {
        key: 'de',
        countryCode: 'DE',
        mapName: 'Germany',
        label: { zh: '德国', en: 'Germany' },
        mapCenter: [10.4, 51.1],
        mapZoom: 5.2,
        overviewLocations: [
            { city: 'Frankfurt', country: 'DE', label: 'Frankfurt' },
            { city: 'Berlin', country: 'DE', label: 'Berlin' },
        ],
        drillLocations: [
            { city: 'Frankfurt', country: 'DE', label: 'Frankfurt' },
            { city: 'Berlin', country: 'DE', label: 'Berlin' },
            { city: 'Munich', country: 'DE', label: 'Munich' },
            { city: 'Hamburg', country: 'DE', label: 'Hamburg' },
            { city: 'Dusseldorf', country: 'DE', label: 'Dusseldorf' },
            { city: 'Cologne', country: 'DE', label: 'Cologne' },
            { city: 'Stuttgart', country: 'DE', label: 'Stuttgart' },
            { city: 'Leipzig', country: 'DE', label: 'Leipzig' },
            { city: 'Nuremberg', country: 'DE', label: 'Nuremberg' },
            { city: 'Dortmund', country: 'DE', label: 'Dortmund' },
        ],
    },
    {
        key: 'jp',
        countryCode: 'JP',
        mapName: 'Japan',
        label: { zh: '日本', en: 'Japan' },
        mapCenter: [138, 37],
        mapZoom: 5,
        overviewLocations: [
            { city: 'Tokyo', country: 'JP', label: 'Tokyo' },
            { city: 'Osaka', country: 'JP', label: 'Osaka' },
        ],
        drillLocations: [
            { city: 'Tokyo', country: 'JP', label: 'Tokyo' },
            { city: 'Osaka', country: 'JP', label: 'Osaka' },
            { city: 'Fukuoka', country: 'JP', label: 'Fukuoka' },
            { city: 'Sapporo', country: 'JP', label: 'Sapporo' },
            { city: 'Nagoya', country: 'JP', label: 'Nagoya' },
            { city: 'Yokohama', country: 'JP', label: 'Yokohama' },
            { city: 'Kyoto', country: 'JP', label: 'Kyoto' },
            { city: 'Sendai', country: 'JP', label: 'Sendai' },
            { city: 'Hiroshima', country: 'JP', label: 'Hiroshima' },
            { city: 'Naha', country: 'JP', label: 'Naha' },
        ],
    },
    {
        key: 'uk',
        countryCode: 'GB',
        mapName: 'United Kingdom',
        label: { zh: '英国', en: 'United Kingdom' },
        mapCenter: [-2, 54],
        mapZoom: 5.5,
        overviewLocations: [
            { city: 'London', country: 'GB', label: 'London' },
            { city: 'Manchester', country: 'GB', label: 'Manchester' },
        ],
        drillLocations: [
            { city: 'London', country: 'GB', label: 'London' },
            { city: 'Manchester', country: 'GB', label: 'Manchester' },
            { city: 'Birmingham', country: 'GB', label: 'Birmingham' },
            { city: 'Glasgow', country: 'GB', label: 'Glasgow' },
            { city: 'Leeds', country: 'GB', label: 'Leeds' },
            { city: 'Edinburgh', country: 'GB', label: 'Edinburgh' },
            { city: 'Bristol', country: 'GB', label: 'Bristol' },
            { city: 'Newcastle', country: 'GB', label: 'Newcastle' },
            { city: 'Belfast', country: 'GB', label: 'Belfast' },
            { city: 'Cardiff', country: 'GB', label: 'Cardiff' },
        ],
    },
    {
        key: 'au',
        countryCode: 'AU',
        mapName: 'Australia',
        label: { zh: '澳大利亚', en: 'Australia' },
        mapCenter: [134, -25],
        mapZoom: 3.4,
        overviewLocations: [
            { city: 'Sydney', country: 'AU', label: 'Sydney' },
            { city: 'Melbourne', country: 'AU', label: 'Melbourne' },
        ],
        drillLocations: [
            { city: 'Sydney', country: 'AU', label: 'Sydney' },
            { city: 'Melbourne', country: 'AU', label: 'Melbourne' },
            { city: 'Brisbane', country: 'AU', label: 'Brisbane' },
            { city: 'Perth', country: 'AU', label: 'Perth' },
            { city: 'Adelaide', country: 'AU', label: 'Adelaide' },
            { city: 'Canberra', country: 'AU', label: 'Canberra' },
            { city: 'Hobart', country: 'AU', label: 'Hobart' },
            { city: 'Darwin', country: 'AU', label: 'Darwin' },
            { city: 'Gold Coast', country: 'AU', label: 'Gold Coast' },
            { city: 'Newcastle', country: 'AU', label: 'Newcastle' },
        ],
    },
    {
        key: 'br',
        countryCode: 'BR',
        mapName: 'Brazil',
        label: { zh: '巴西', en: 'Brazil' },
        mapCenter: [-52, -14],
        mapZoom: 3.2,
        overviewLocations: [
            { city: 'Sao Paulo', country: 'BR', label: 'Sao Paulo' },
            { city: 'Rio de Janeiro', country: 'BR', label: 'Rio de Janeiro' },
        ],
        drillLocations: [
            { city: 'Sao Paulo', country: 'BR', label: 'Sao Paulo' },
            { city: 'Rio de Janeiro', country: 'BR', label: 'Rio de Janeiro' },
            { city: 'Fortaleza', country: 'BR', label: 'Fortaleza' },
            { city: 'Porto Alegre', country: 'BR', label: 'Porto Alegre' },
            { city: 'Brasilia', country: 'BR', label: 'Brasilia' },
            { city: 'Salvador', country: 'BR', label: 'Salvador' },
            { city: 'Recife', country: 'BR', label: 'Recife' },
            { city: 'Curitiba', country: 'BR', label: 'Curitiba' },
            { city: 'Belo Horizonte', country: 'BR', label: 'Belo Horizonte' },
            { city: 'Manaus', country: 'BR', label: 'Manaus' },
        ],
    },
    {
        key: 'in',
        countryCode: 'IN',
        mapName: 'India',
        label: { zh: '印度', en: 'India' },
        mapCenter: [78, 22],
        mapZoom: 3.6,
        overviewLocations: [
            { city: 'Mumbai', country: 'IN', label: 'Mumbai' },
            { city: 'Delhi', country: 'IN', label: 'Delhi' },
        ],
        drillLocations: [
            { city: 'Mumbai', country: 'IN', label: 'Mumbai' },
            { city: 'Delhi', country: 'IN', label: 'Delhi' },
            { city: 'Bengaluru', country: 'IN', label: 'Bengaluru' },
            { city: 'Chennai', country: 'IN', label: 'Chennai' },
            { city: 'Hyderabad', country: 'IN', label: 'Hyderabad' },
            { city: 'Pune', country: 'IN', label: 'Pune' },
            { city: 'Kolkata', country: 'IN', label: 'Kolkata' },
            { city: 'Ahmedabad', country: 'IN', label: 'Ahmedabad' },
            { city: 'Jaipur', country: 'IN', label: 'Jaipur' },
            { city: 'Kochi', country: 'IN', label: 'Kochi' },
        ],
    },
    {
        key: 'ca',
        countryCode: 'CA',
        mapName: 'Canada',
        label: { zh: '加拿大', en: 'Canada' },
        mapCenter: [-106, 57],
        mapZoom: 2.3,
        overviewLocations: [
            { city: 'Toronto', country: 'CA', label: 'Toronto' },
            { city: 'Vancouver', country: 'CA', label: 'Vancouver' },
        ],
        drillLocations: [
            { city: 'Toronto', country: 'CA', label: 'Toronto' },
            { city: 'Vancouver', country: 'CA', label: 'Vancouver' },
            { city: 'Montreal', country: 'CA', label: 'Montreal' },
            { city: 'Calgary', country: 'CA', label: 'Calgary' },
            { city: 'Ottawa', country: 'CA', label: 'Ottawa' },
            { city: 'Edmonton', country: 'CA', label: 'Edmonton' },
            { city: 'Quebec City', country: 'CA', label: 'Quebec City' },
            { city: 'Winnipeg', country: 'CA', label: 'Winnipeg' },
            { city: 'Halifax', country: 'CA', label: 'Halifax' },
            { city: 'Victoria', country: 'CA', label: 'Victoria' },
        ],
    },
    {
        key: 'fr',
        countryCode: 'FR',
        mapName: 'France',
        label: { zh: '法国', en: 'France' },
        mapCenter: [2.4, 46.5],
        mapZoom: 5.2,
        overviewLocations: [
            { city: 'Paris', country: 'FR', label: 'Paris' },
            { city: 'Marseille', country: 'FR', label: 'Marseille' },
        ],
        drillLocations: [
            { city: 'Paris', country: 'FR', label: 'Paris' },
            { city: 'Marseille', country: 'FR', label: 'Marseille' },
            { city: 'Lyon', country: 'FR', label: 'Lyon' },
            { city: 'Lille', country: 'FR', label: 'Lille' },
            { city: 'Toulouse', country: 'FR', label: 'Toulouse' },
            { city: 'Nice', country: 'FR', label: 'Nice' },
            { city: 'Bordeaux', country: 'FR', label: 'Bordeaux' },
            { city: 'Nantes', country: 'FR', label: 'Nantes' },
            { city: 'Strasbourg', country: 'FR', label: 'Strasbourg' },
            { city: 'Rennes', country: 'FR', label: 'Rennes' },
        ],
    },
    {
        key: 'kr',
        countryCode: 'KR',
        mapName: 'South Korea',
        label: { zh: '韩国', en: 'South Korea' },
        mapCenter: [127.8, 36.2],
        mapZoom: 6,
        overviewLocations: [
            { city: 'Seoul', country: 'KR', label: 'Seoul' },
            { city: 'Busan', country: 'KR', label: 'Busan' },
        ],
        drillLocations: [
            { city: 'Seoul', country: 'KR', label: 'Seoul' },
            { city: 'Busan', country: 'KR', label: 'Busan' },
            { city: 'Incheon', country: 'KR', label: 'Incheon' },
            { city: 'Daejeon', country: 'KR', label: 'Daejeon' },
            { city: 'Daegu', country: 'KR', label: 'Daegu' },
            { city: 'Gwangju', country: 'KR', label: 'Gwangju' },
            { city: 'Ulsan', country: 'KR', label: 'Ulsan' },
            { city: 'Suwon', country: 'KR', label: 'Suwon' },
            { city: 'Jeju City', country: 'KR', label: 'Jeju City' },
            { city: 'Seongnam', country: 'KR', label: 'Seongnam' },
        ],
    },
    {
        key: 'mx',
        countryCode: 'MX',
        mapName: 'Mexico',
        label: { zh: '墨西哥', en: 'Mexico' },
        mapCenter: [-102, 23],
        mapZoom: 3.8,
        overviewLocations: [
            { city: 'Mexico City', country: 'MX', label: 'Mexico City' },
            { city: 'Guadalajara', country: 'MX', label: 'Guadalajara' },
        ],
        drillLocations: [
            { city: 'Mexico City', country: 'MX', label: 'Mexico City' },
            { city: 'Guadalajara', country: 'MX', label: 'Guadalajara' },
            { city: 'Monterrey', country: 'MX', label: 'Monterrey' },
            { city: 'Tijuana', country: 'MX', label: 'Tijuana' },
            { city: 'Puebla', country: 'MX', label: 'Puebla' },
            { city: 'Queretaro', country: 'MX', label: 'Queretaro' },
            { city: 'Merida', country: 'MX', label: 'Merida' },
            { city: 'Leon', country: 'MX', label: 'Leon' },
            { city: 'Cancun', country: 'MX', label: 'Cancun' },
            { city: 'Chihuahua', country: 'MX', label: 'Chihuahua' },
        ],
    },
    {
        key: 'za',
        countryCode: 'ZA',
        mapName: 'South Africa',
        label: { zh: '南非', en: 'South Africa' },
        mapCenter: [24, -29],
        mapZoom: 3.8,
        overviewLocations: [
            { city: 'Johannesburg', country: 'ZA', label: 'Johannesburg' },
            { city: 'Cape Town', country: 'ZA', label: 'Cape Town' },
        ],
        drillLocations: [
            { city: 'Johannesburg', country: 'ZA', label: 'Johannesburg' },
            { city: 'Cape Town', country: 'ZA', label: 'Cape Town' },
            { city: 'Durban', country: 'ZA', label: 'Durban' },
            { city: 'Pretoria', country: 'ZA', label: 'Pretoria' },
            { city: 'Port Elizabeth', country: 'ZA', label: 'Port Elizabeth' },
            { city: 'Bloemfontein', country: 'ZA', label: 'Bloemfontein' },
            { city: 'East London', country: 'ZA', label: 'East London' },
            { city: 'Polokwane', country: 'ZA', label: 'Polokwane' },
            { city: 'Nelspruit', country: 'ZA', label: 'Nelspruit' },
            { city: 'Kimberley', country: 'ZA', label: 'Kimberley' },
        ],
    },
];

export const networkCountryOrder = networkCountries.map((country) => country.key);

export const networkCountryMap = Object.fromEntries(
    networkCountries.map((country) => [country.key, country]),
) as Record<CountryKey, NetworkCountryDefinition>;

export const networkCountryCodeMap = Object.fromEntries(
    networkCountries.map((country) => [country.countryCode, country.key]),
) as Record<string, CountryKey>;

export function isCountryKey(value: string | null | undefined): value is CountryKey {
    return networkCountryOrder.includes(value as CountryKey);
}
