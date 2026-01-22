// Данные о субъектах Российской Федерации
// Источник: Росстат, OpenStreetMap

export interface RussianRegion {
  id: string;
  name: string;
  code: string;           // Код региона (ISO 3166-2:RU)
  federalDistrict: string;
  center: [number, number]; // [longitude, latitude]
  population?: number;
}

// 85 субъектов РФ
export const RUSSIAN_REGIONS: RussianRegion[] = [
  // Центральный федеральный округ
  { id: 'RU-MOW', name: 'Москва', code: '77', federalDistrict: 'Центральный', center: [37.6173, 55.7558], population: 13104177 },
  { id: 'RU-MOS', name: 'Московская область', code: '50', federalDistrict: 'Центральный', center: [37.2900, 55.8000], population: 8524665 },
  { id: 'RU-BEL', name: 'Белгородская область', code: '31', federalDistrict: 'Центральный', center: [36.5800, 50.5977], population: 1541259 },
  { id: 'RU-BRY', name: 'Брянская область', code: '32', federalDistrict: 'Центральный', center: [34.3636, 53.2521], population: 1180172 },
  { id: 'RU-VLA', name: 'Владимирская область', code: '33', federalDistrict: 'Центральный', center: [40.4058, 56.1366], population: 1342099 },
  { id: 'RU-VOR', name: 'Воронежская область', code: '36', federalDistrict: 'Центральный', center: [39.2006, 51.6720], population: 2305608 },
  { id: 'RU-IVA', name: 'Ивановская область', code: '37', federalDistrict: 'Центральный', center: [40.9972, 56.9976], population: 979591 },
  { id: 'RU-KLU', name: 'Калужская область', code: '40', federalDistrict: 'Центральный', center: [36.2754, 54.5138], population: 1001419 },
  { id: 'RU-KOS', name: 'Костромская область', code: '44', federalDistrict: 'Центральный', center: [40.9269, 57.7679], population: 628423 },
  { id: 'RU-KRS', name: 'Курская область', code: '46', federalDistrict: 'Центральный', center: [36.1946, 51.7373], population: 1096567 },
  { id: 'RU-LIP', name: 'Липецкая область', code: '48', federalDistrict: 'Центральный', center: [39.5699, 52.6031], population: 1128213 },
  { id: 'RU-ORL', name: 'Орловская область', code: '57', federalDistrict: 'Центральный', center: [36.0858, 52.9651], population: 724686 },
  { id: 'RU-RYA', name: 'Рязанская область', code: '62', federalDistrict: 'Центральный', center: [39.7126, 54.6269], population: 1091438 },
  { id: 'RU-SMO', name: 'Смоленская область', code: '67', federalDistrict: 'Центральный', center: [32.0401, 54.7826], population: 921127 },
  { id: 'RU-TAM', name: 'Тамбовская область', code: '68', federalDistrict: 'Центральный', center: [41.4348, 52.7212], population: 994420 },
  { id: 'RU-TVE', name: 'Тверская область', code: '69', federalDistrict: 'Центральный', center: [35.9176, 56.8587], population: 1245619 },
  { id: 'RU-TUL', name: 'Тульская область', code: '71', federalDistrict: 'Центральный', center: [37.6183, 54.1961], population: 1449115 },
  { id: 'RU-YAR', name: 'Ярославская область', code: '76', federalDistrict: 'Центральный', center: [39.8737, 57.6261], population: 1241227 },

  // Северо-Западный федеральный округ
  { id: 'RU-SPE', name: 'Санкт-Петербург', code: '78', federalDistrict: 'Северо-Западный', center: [30.3351, 59.9343], population: 5601911 },
  { id: 'RU-LEN', name: 'Ленинградская область', code: '47', federalDistrict: 'Северо-Западный', center: [30.1901, 59.9750], population: 2017568 },
  { id: 'RU-ARK', name: 'Архангельская область', code: '29', federalDistrict: 'Северо-Западный', center: [40.5433, 64.5401], population: 1082851 },
  { id: 'RU-VLG', name: 'Вологодская область', code: '35', federalDistrict: 'Северо-Западный', center: [39.8845, 59.2239], population: 1151042 },
  { id: 'RU-KGD', name: 'Калининградская область', code: '39', federalDistrict: 'Северо-Западный', center: [20.5100, 54.7104], population: 1027678 },
  { id: 'RU-KR', name: 'Республика Карелия', code: '10', federalDistrict: 'Северо-Западный', center: [33.9846, 63.5507], population: 609071 },
  { id: 'RU-KO', name: 'Республика Коми', code: '11', federalDistrict: 'Северо-Западный', center: [54.0823, 64.0170], population: 813590 },
  { id: 'RU-MUR', name: 'Мурманская область', code: '51', federalDistrict: 'Северо-Западный', center: [33.0926, 68.9585], population: 732864 },
  { id: 'RU-NEN', name: 'Ненецкий автономный округ', code: '83', federalDistrict: 'Северо-Западный', center: [53.0000, 68.0000], population: 44111 },
  { id: 'RU-NGR', name: 'Новгородская область', code: '53', federalDistrict: 'Северо-Западный', center: [31.2748, 58.5217], population: 593760 },
  { id: 'RU-PSK', name: 'Псковская область', code: '60', federalDistrict: 'Северо-Западный', center: [28.3342, 57.8136], population: 609049 },

  // Южный федеральный округ
  { id: 'RU-AD', name: 'Республика Адыгея', code: '01', federalDistrict: 'Южный', center: [40.1053, 44.6033], population: 496934 },
  { id: 'RU-KL', name: 'Республика Калмыкия', code: '08', federalDistrict: 'Южный', center: [44.2558, 46.3078], population: 267298 },
  { id: 'RU-KDA', name: 'Краснодарский край', code: '23', federalDistrict: 'Южный', center: [38.9769, 45.0355], population: 5838305 },
  { id: 'RU-AST', name: 'Астраханская область', code: '30', federalDistrict: 'Южный', center: [48.0336, 46.3497], population: 997778 },
  { id: 'RU-VGG', name: 'Волгоградская область', code: '34', federalDistrict: 'Южный', center: [44.5018, 48.7080], population: 2474556 },
  { id: 'RU-ROS', name: 'Ростовская область', code: '61', federalDistrict: 'Южный', center: [39.7015, 47.2357], population: 4181486 },
  { id: 'RU-SEV', name: 'Севастополь', code: '92', federalDistrict: 'Южный', center: [33.5224, 44.6054], population: 547820 },
  { id: 'RU-CR', name: 'Республика Крым', code: '91', federalDistrict: 'Южный', center: [34.0998, 44.9521], population: 1901578 },

  // Северо-Кавказский федеральный округ
  { id: 'RU-DA', name: 'Республика Дагестан', code: '05', federalDistrict: 'Северо-Кавказский', center: [47.0951, 42.2638], population: 3182054 },
  { id: 'RU-IN', name: 'Республика Ингушетия', code: '06', federalDistrict: 'Северо-Кавказский', center: [44.8300, 43.1667], population: 515964 },
  { id: 'RU-KB', name: 'Кабардино-Балкарская Республика', code: '07', federalDistrict: 'Северо-Кавказский', center: [43.4849, 43.4844], population: 904200 },
  { id: 'RU-KC', name: 'Карачаево-Черкесская Республика', code: '09', federalDistrict: 'Северо-Кавказский', center: [41.7847, 43.7361], population: 465661 },
  { id: 'RU-SE', name: 'Республика Северная Осетия — Алания', code: '15', federalDistrict: 'Северо-Кавказский', center: [44.6680, 43.0250], population: 687573 },
  { id: 'RU-CE', name: 'Чеченская Республика', code: '20', federalDistrict: 'Северо-Кавказский', center: [45.6846, 43.3120], population: 1510824 },
  { id: 'RU-STA', name: 'Ставропольский край', code: '26', federalDistrict: 'Северо-Кавказский', center: [42.9850, 45.0433], population: 2792796 },

  // Приволжский федеральный округ
  { id: 'RU-BA', name: 'Республика Башкортостан', code: '02', federalDistrict: 'Приволжский', center: [56.0375, 54.7261], population: 4013786 },
  { id: 'RU-ME', name: 'Республика Марий Эл', code: '12', federalDistrict: 'Приволжский', center: [47.8864, 56.6349], population: 673415 },
  { id: 'RU-MO', name: 'Республика Мордовия', code: '13', federalDistrict: 'Приволжский', center: [45.1749, 54.1838], population: 779000 },
  { id: 'RU-TA', name: 'Республика Татарстан', code: '16', federalDistrict: 'Приволжский', center: [49.1233, 55.7887], population: 3902888 },
  { id: 'RU-UD', name: 'Удмуртская Республика', code: '18', federalDistrict: 'Приволжский', center: [53.2114, 56.8527], population: 1477890 },
  { id: 'RU-CU', name: 'Чувашская Республика', code: '21', federalDistrict: 'Приволжский', center: [47.2513, 55.7964], population: 1207875 },
  { id: 'RU-PER', name: 'Пермский край', code: '59', federalDistrict: 'Приволжский', center: [56.2502, 58.0105], population: 2549988 },
  { id: 'RU-KIR', name: 'Кировская область', code: '43', federalDistrict: 'Приволжский', center: [49.6683, 58.6035], population: 1239996 },
  { id: 'RU-NIZ', name: 'Нижегородская область', code: '52', federalDistrict: 'Приволжский', center: [43.9361, 56.3269], population: 3147121 },
  { id: 'RU-ORE', name: 'Оренбургская область', code: '56', federalDistrict: 'Приволжский', center: [55.1018, 51.7727], population: 1930975 },
  { id: 'RU-PNZ', name: 'Пензенская область', code: '58', federalDistrict: 'Приволжский', center: [45.0195, 53.2007], population: 1270210 },
  { id: 'RU-SAM', name: 'Самарская область', code: '63', federalDistrict: 'Приволжский', center: [50.1500, 53.2000], population: 3154164 },
  { id: 'RU-SAR', name: 'Саратовская область', code: '64', federalDistrict: 'Приволжский', center: [46.0086, 51.5406], population: 2373145 },
  { id: 'RU-ULY', name: 'Ульяновская область', code: '73', federalDistrict: 'Приволжский', center: [48.4064, 54.3142], population: 1198343 },

  // Уральский федеральный округ
  { id: 'RU-KGN', name: 'Курганская область', code: '45', federalDistrict: 'Уральский', center: [64.4176, 55.4500], population: 818570 },
  { id: 'RU-SVE', name: 'Свердловская область', code: '66', federalDistrict: 'Уральский', center: [60.6122, 56.8389], population: 4267592 },
  { id: 'RU-TYU', name: 'Тюменская область', code: '72', federalDistrict: 'Уральский', center: [68.2500, 57.1500], population: 3848662 },
  { id: 'RU-KHM', name: 'Ханты-Мансийский автономный округ — Югра', code: '86', federalDistrict: 'Уральский', center: [68.9700, 61.0042], population: 1708233 },
  { id: 'RU-YAN', name: 'Ямало-Ненецкий автономный округ', code: '89', federalDistrict: 'Уральский', center: [73.3900, 66.5300], population: 549550 },
  { id: 'RU-CHE', name: 'Челябинская область', code: '74', federalDistrict: 'Уральский', center: [61.4025, 55.1644], population: 3426929 },

  // Сибирский федеральный округ
  { id: 'RU-AL', name: 'Республика Алтай', code: '04', federalDistrict: 'Сибирский', center: [86.2158, 50.4119], population: 227399 },
  { id: 'RU-TY', name: 'Республика Тыва', code: '17', federalDistrict: 'Сибирский', center: [94.4378, 51.7191], population: 337264 },
  { id: 'RU-KK', name: 'Республика Хакасия', code: '19', federalDistrict: 'Сибирский', center: [91.4423, 53.7211], population: 532319 },
  { id: 'RU-ALT', name: 'Алтайский край', code: '22', federalDistrict: 'Сибирский', center: [83.7836, 53.3606], population: 2275799 },
  { id: 'RU-KYA', name: 'Красноярский край', code: '24', federalDistrict: 'Сибирский', center: [92.8932, 56.0097], population: 2857567 },
  { id: 'RU-IRK', name: 'Иркутская область', code: '38', federalDistrict: 'Сибирский', center: [104.2890, 52.2855], population: 2369145 },
  { id: 'RU-KEM', name: 'Кемеровская область — Кузбасс', code: '42', federalDistrict: 'Сибирский', center: [86.0876, 55.3549], population: 2607348 },
  { id: 'RU-NVS', name: 'Новосибирская область', code: '54', federalDistrict: 'Сибирский', center: [82.9346, 55.0415], population: 2798170 },
  { id: 'RU-OMS', name: 'Омская область', code: '55', federalDistrict: 'Сибирский', center: [73.3685, 54.9885], population: 1879548 },
  { id: 'RU-TOM', name: 'Томская область', code: '70', federalDistrict: 'Сибирский', center: [84.9749, 56.4977], population: 1073896 },

  // Дальневосточный федеральный округ
  { id: 'RU-BU', name: 'Республика Бурятия', code: '03', federalDistrict: 'Дальневосточный', center: [107.5842, 51.8340], population: 978588 },
  { id: 'RU-SA', name: 'Республика Саха (Якутия)', code: '14', federalDistrict: 'Дальневосточный', center: [129.7400, 62.0355], population: 1012084 },
  { id: 'RU-ZAB', name: 'Забайкальский край', code: '75', federalDistrict: 'Дальневосточный', center: [113.5006, 52.0515], population: 1053485 },
  { id: 'RU-KAM', name: 'Камчатский край', code: '41', federalDistrict: 'Дальневосточный', center: [158.6500, 53.0167], population: 312006 },
  { id: 'RU-PRI', name: 'Приморский край', code: '25', federalDistrict: 'Дальневосточный', center: [131.8869, 43.1056], population: 1858429 },
  { id: 'RU-KHA', name: 'Хабаровский край', code: '27', federalDistrict: 'Дальневосточный', center: [135.0750, 48.4647], population: 1295487 },
  { id: 'RU-AMU', name: 'Амурская область', code: '28', federalDistrict: 'Дальневосточный', center: [127.5400, 50.2559], population: 774820 },
  { id: 'RU-MAG', name: 'Магаданская область', code: '49', federalDistrict: 'Дальневосточный', center: [150.8001, 59.5611], population: 136085 },
  { id: 'RU-SAK', name: 'Сахалинская область', code: '65', federalDistrict: 'Дальневосточный', center: [142.7382, 46.9641], population: 465520 },
  { id: 'RU-YEV', name: 'Еврейская автономная область', code: '79', federalDistrict: 'Дальневосточный', center: [132.9370, 48.7630], population: 153404 },
  { id: 'RU-CHU', name: 'Чукотский автономный округ', code: '87', federalDistrict: 'Дальневосточный', center: [177.0000, 66.0000], population: 47490 },
];

// Получение региона по ID
export function getRegionById(id: string): RussianRegion | undefined {
  return RUSSIAN_REGIONS.find(r => r.id === id);
}

// Получение региона по коду
export function getRegionByCode(code: string): RussianRegion | undefined {
  return RUSSIAN_REGIONS.find(r => r.code === code);
}

// Группировка регионов по федеральным округам
export function getRegionsByDistrict(): Record<string, RussianRegion[]> {
  return RUSSIAN_REGIONS.reduce((acc, region) => {
    if (!acc[region.federalDistrict]) {
      acc[region.federalDistrict] = [];
    }
    acc[region.federalDistrict].push(region);
    return acc;
  }, {} as Record<string, RussianRegion[]>);
}

// Центр России для начального вида карты
export const RUSSIA_CENTER: [number, number] = [100.0, 60.0];
export const RUSSIA_BOUNDS: [[number, number], [number, number]] = [
  [19.0, 41.0],  // Юго-запад (Калининград)
  [180.0, 82.0]  // Северо-восток (Чукотка)
];
