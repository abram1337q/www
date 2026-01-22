import { NextResponse } from 'next/server';

// GET /api/regions - получить GeoJSON границ регионов России
export async function GET() {
  try {
    // Загружаем GeoJSON из публичного источника
    const response = await fetch(
      'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/russia.geojson',
      { next: { revalidate: 86400 } } // Кэшируем на 24 часа
    );

    if (!response.ok) {
      throw new Error('Failed to fetch regions GeoJSON');
    }

    const geojson = await response.json();

    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to load regions' },
      { status: 500 }
    );
  }
}
