// Утилиты для работы с геокодированием
// Определение региона и населённого пункта по координатам

import { RUSSIAN_REGIONS } from '@/data/regions';

interface GeocodingResult {
  regionId: string | null;
  regionName: string | null;
  settlementName: string | null;
  address: string | null;
}

// Определение региона по координатам (простой метод - по расстоянию до центра)
export function findNearestRegion(lat: number, lng: number): { id: string; name: string } | null {
  let nearestRegion: typeof RUSSIAN_REGIONS[0] | null = null;
  let minDistance = Infinity;

  for (const region of RUSSIAN_REGIONS) {
    const [regionLng, regionLat] = region.center;
    const distance = Math.sqrt(
      Math.pow(lat - regionLat, 2) + Math.pow(lng - regionLng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestRegion = region;
    }
  }

  return nearestRegion ? { id: nearestRegion.id, name: nearestRegion.name } : null;
}

// Reverse geocoding через MapTiler API
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || 'get_your_own_OpIi9ZULNHzrESv6T2vL';

  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${mapTilerKey}&language=ru`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    const features = data.features || [];

    let settlementName: string | null = null;
    let regionName: string | null = null;
    let address: string | null = null;

    for (const feature of features) {
      const placeType = feature.place_type?.[0];

      if (placeType === 'address' || placeType === 'street') {
        address = feature.text || feature.place_name;
      }
      if (placeType === 'place' || placeType === 'locality') {
        settlementName = feature.text;
      }
      if (placeType === 'region' || placeType === 'state') {
        regionName = feature.text;
      }
    }

    // Если не нашли регион через API, используем наш метод
    const nearestRegion = findNearestRegion(lat, lng);

    return {
      regionId: nearestRegion?.id || null,
      regionName: regionName || nearestRegion?.name || null,
      settlementName,
      address,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    // Fallback к простому определению региона
    const nearestRegion = findNearestRegion(lat, lng);
    return {
      regionId: nearestRegion?.id || null,
      regionName: nearestRegion?.name || null,
      settlementName: null,
      address: null,
    };
  }
}

// Проверка, находятся ли координаты в пределах России
export function isInRussia(lat: number, lng: number): boolean {
  // Примерные границы России
  const bounds = {
    minLat: 41.0,
    maxLat: 82.0,
    minLng: 19.0,
    maxLng: 180.0,
  };

  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}
