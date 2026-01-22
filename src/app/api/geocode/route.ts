import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocode, isInRussia } from '@/lib/geo/geocoding';

// GET /api/geocode?lat=...&lng=... - reverse geocoding
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Проверяем, что координаты в России
    if (!isInRussia(lat, lng)) {
      return NextResponse.json(
        { error: 'Coordinates are outside Russia' },
        { status: 400 }
      );
    }

    const result = await reverseGeocode(lat, lng);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    );
  }
}
