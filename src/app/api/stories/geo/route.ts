import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { STORY_CATEGORIES } from '@/types';

// GET /api/stories/geo - получить истории в формате GeoJSON
export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        category: true,
        authorName: true,
        heartsCount: true,
        regionId: true,
        regionName: true,
      },
    });

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: stories.map(story => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [story.longitude, story.latitude],
        },
        properties: {
          id: story.id,
          category: story.category,
          authorName: story.authorName,
          heartsCount: story.heartsCount,
          regionId: story.regionId,
          regionName: story.regionName,
          emoji: STORY_CATEGORIES[story.category as keyof typeof STORY_CATEGORIES]?.emoji || '📍',
        },
      })),
    };

    return NextResponse.json(geojson, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('Error fetching stories geo:', error);
    return NextResponse.json(
      { error: 'Failed to load stories' },
      { status: 500 }
    );
  }
}
