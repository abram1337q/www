import { NextRequest, NextResponse } from 'next/server';

// Список Overpass API серверов (с fallback)
const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Функция запроса с retry к разным серверам
async function fetchWithRetry(query: string): Promise<Response | null> {
  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetch(server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000), // 15 секунд таймаут
      });

      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.warn(`Overpass server ${server} failed:`, error);
      continue;
    }
  }
  return null;
}

// GET /api/settlements/{regionId} - получить населённые пункты региона
// Использует Overpass API (OpenStreetMap) для получения данных
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ regionId: string }> }
) {
  try {
    const { regionId } = await params;

    if (!regionId) {
      return NextResponse.json(
        { error: 'Region ID is required' },
        { status: 400 }
      );
    }

    // Используем Overpass API для получения населённых пунктов
    // Формируем запрос по ISO коду региона
    const overpassQuery = `
      [out:json][timeout:25];
      area["ISO3166-2"="${regionId}"]->.searchArea;
      (
        node["place"~"city|town"](area.searchArea);
      );
      out body;
    `;

    const response = await fetchWithRetry(overpassQuery);

    if (!response) {
      // Если все серверы не ответили - возвращаем пустой массив
      return NextResponse.json({
        success: true,
        regionId,
        settlements: [],
        total: 0,
        message: 'Overpass API temporarily unavailable',
      });
    }

    const data = await response.json();
    const elements = data.elements || [];

    // Преобразуем в нужный формат
    const settlements = elements.map((el: {
      id: number;
      lat: number;
      lon: number;
      tags?: {
        name?: string;
        'name:ru'?: string;
        population?: string;
        place?: string;
      };
    }) => ({
      id: String(el.id),
      name: el.tags?.['name:ru'] || el.tags?.name || 'Без названия',
      coordinates: [el.lon, el.lat] as [number, number],
      population: el.tags?.population ? parseInt(el.tags.population) : null,
      type: el.tags?.place || 'place',
    }));

    // Сортируем по населению (крупные города первыми)
    settlements.sort((a: { population: number | null }, b: { population: number | null }) =>
      (b.population || 0) - (a.population || 0)
    );

    return NextResponse.json({
      success: true,
      regionId,
      settlements: settlements.slice(0, 500), // Ограничиваем 500 населёнными пунктами
      total: settlements.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching settlements:', error);

    // Возвращаем пустой массив вместо ошибки
    return NextResponse.json({
      success: true,
      regionId: '',
      settlements: [],
      total: 0,
      message: 'Could not load settlements',
    });
  }
}
