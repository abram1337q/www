'use client';

// Интерактивная 3D карта России на MapLibre GL JS с OpenFreeMap
// 3D здания, улицы, номера домов

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RUSSIAN_REGIONS, type RussianRegion } from '@/data/regions';
import { STORY_CATEGORIES, type StoryMapMarker } from '@/types';
import AddressSearch from './AddressSearch';

const ZOOM_LEVELS = {
  COUNTRY: 3,
  REGION: 6,
  CITY: 10,
  SETTLEMENT: 14,
  STREET: 16,
  BUILDING: 18,
};

const RUSSIA_BOUNDS: [[number, number], [number, number]] = [
  [19.0, 41.0],
  [180.0, 82.0]
];

interface InteractiveMapProps {
  stories?: StoryMapMarker[];
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onStoryClick?: (storyId: string) => void;
  onRegionClick?: (regionId: string) => void;
  selectedStoryId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function InteractiveMap({
  stories = [],
  onMapClick,
  onStoryClick,
  onRegionClick,
  selectedStoryId,
  initialCenter,
  initialZoom,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const regionMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [currentZoom, setCurrentZoom] = useState(initialZoom || ZOOM_LEVELS.COUNTRY);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RussianRegion | null>(null);
  const [settlements, setSettlements] = useState<Array<{ id: string; name: string; coordinates: [number, number]; population: number | null }>>([]);

  const storiesByRegion = useCallback(() => {
    const counts: Record<string, number> = {};
    for (const story of stories) {
      if (story.regionId) {
        counts[story.regionId] = (counts[story.regionId] || 0) + 1;
      }
    }
    return counts;
  }, [stories]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // OpenFreeMap с Liberty стилем
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: initialCenter || [100.0, 65.0],
      zoom: initialZoom || ZOOM_LEVELS.COUNTRY,
      pitch: 45,
      bearing: -15,
      maxBounds: RUSSIA_BOUNDS,
      minZoom: 2.5,
      maxZoom: 20,
    });

    const currentMap = map.current;

    currentMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    currentMap.addControl(new maplibregl.ScaleControl({ maxWidth: 200, unit: 'metric' }), 'bottom-left');
    currentMap.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    currentMap.on('load', async () => {
      setIsMapLoaded(true);

      // 3D здания
      const layers = currentMap.getStyle().layers || [];
      let labelLayerId: string | undefined;
      for (const layer of layers) {
        if (layer.type === 'symbol' && (layer as maplibregl.SymbolLayerSpecification).layout?.['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }

      currentMap.addLayer({
        id: 'buildings-3d',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': [
            'interpolate', ['linear'], ['get', 'render_height'],
            0, '#e8e4e0', 20, '#d4cfc9', 50, '#c0b8b0', 100, '#a89f95', 200, '#8f857a'
          ],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, ['get', 'render_height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, ['get', 'render_min_height']],
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.7, 17, 0.85, 19, 0.95],
          'fill-extrusion-vertical-gradient': true,
        },
      }, labelLayerId);

      // Номера домов (показываем с zoom 15 ~ 100-200 метров)
      currentMap.addLayer({
        id: 'housenumbers',
        source: 'openmaptiles',
        'source-layer': 'housenumber',
        type: 'symbol',
        minzoom: 15,
        layout: {
          'text-field': ['get', 'housenumber'],
          'text-font': ['Open Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 8, 17, 10, 19, 13, 20, 15],
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-padding': 2,
        },
        paint: {
          'text-color': '#374151',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 15, 0.7, 17, 1],
        },
      });

      // Регионы России
      try {
        const response = await fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/russia.geojson');
        const russiaGeoJSON = await response.json();

        currentMap.addSource('russia-regions', { type: 'geojson', data: russiaGeoJSON });

        currentMap.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'russia-regions',
          paint: {
            'fill-color': ['case',
              ['boolean', ['feature-state', 'hover'], false], 'rgba(251, 191, 36, 0.4)',
              'rgba(226, 232, 240, 0.15)'
            ],
            'fill-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 8, 0.2, 12, 0],
          },
        });

        currentMap.addLayer({
          id: 'regions-border',
          type: 'line',
          source: 'russia-regions',
          paint: {
            'line-color': '#475569',
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 6, 1, 10, 1.5],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.8, 10, 0.4, 14, 0.1],
          },
        });

        let hoveredId: string | number | null = null;

        currentMap.on('mousemove', 'regions-fill', (e) => {
          if (e.features?.[0]) {
            if (hoveredId !== null) {
              currentMap.setFeatureState({ source: 'russia-regions', id: hoveredId }, { hover: false });
            }
            hoveredId = e.features[0].id ?? null;
            if (hoveredId !== null) {
              currentMap.setFeatureState({ source: 'russia-regions', id: hoveredId }, { hover: true });
            }
            setHoveredRegion(e.features[0].properties?.name);
            currentMap.getCanvas().style.cursor = 'pointer';
          }
        });

        currentMap.on('mouseleave', 'regions-fill', () => {
          if (hoveredId !== null) {
            currentMap.setFeatureState({ source: 'russia-regions', id: hoveredId }, { hover: false });
          }
          hoveredId = null;
          setHoveredRegion(null);
          currentMap.getCanvas().style.cursor = '';
        });

        currentMap.on('click', 'regions-fill', (e) => {
          if (currentMap.getZoom() >= ZOOM_LEVELS.CITY) return;
          if (e.features?.[0]) {
            const regionName = e.features[0].properties?.name;
            const region = RUSSIAN_REGIONS.find(r =>
              r.name.toLowerCase().includes(regionName?.toLowerCase() || '') ||
              regionName?.toLowerCase().includes(r.name.toLowerCase())
            );
            if (region) {
              setSelectedRegion(region);
              onRegionClick?.(region.id);
              currentMap.flyTo({ center: region.center, zoom: ZOOM_LEVELS.REGION, pitch: 50, duration: 1500 });
              loadSettlements(region.id);
            }
          }
        });
      } catch (error) {
        console.error('Ошибка загрузки GeoJSON:', error);
      }
    });

    const loadSettlements = async (regionId: string) => {
      try {
        const response = await fetch(`/api/settlements/${regionId}`);
        const data = await response.json();
        if (data.success && data.settlements) {
          setSettlements(data.settlements.slice(0, 100));
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    };

    currentMap.on('zoom', () => setCurrentZoom(currentMap.getZoom()));

    currentMap.on('click', (e) => {
      if (currentMap.getZoom() >= ZOOM_LEVELS.SETTLEMENT && onMapClick) {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      }
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      currentMap.remove();
      map.current = null;
    };
  }, [initialCenter, initialZoom, onMapClick, onRegionClick]);

  const createMarkerElement = useCallback((story: StoryMapMarker, isSelected: boolean) => {
    const category = STORY_CATEGORIES[story.category];
    const el = document.createElement('div');
    el.className = 'story-marker';
    el.innerHTML = `
      <div class="marker-container ${isSelected ? 'selected' : ''}">
        <div class="marker-pin"><span class="marker-emoji">${category.emoji}</span></div>
        ${story.heartsCount > 0 ? `<span class="marker-hearts">${story.heartsCount}</span>` : ''}
      </div>
    `;
    el.addEventListener('click', (e) => { e.stopPropagation(); onStoryClick?.(story.id); });
    return el;
  }, [onStoryClick]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    const currentMap = map.current;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (currentMap.getLayer('clusters')) currentMap.removeLayer('clusters');
    if (currentMap.getLayer('cluster-count')) currentMap.removeLayer('cluster-count');
    if (currentMap.getLayer('stories-heatmap')) currentMap.removeLayer('stories-heatmap');
    if (currentMap.getSource('stories-source')) currentMap.removeSource('stories-source');

    if (stories.length === 0) return;

    const storiesGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: stories.map(story => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [story.longitude, story.latitude] },
        properties: { id: story.id, category: story.category, heartsCount: story.heartsCount, emoji: STORY_CATEGORIES[story.category]?.emoji || '📍' }
      }))
    };

    currentMap.addSource('stories-source', { type: 'geojson', data: storiesGeoJSON, cluster: true, clusterMaxZoom: 12, clusterRadius: 50 });

    // HEATMAP - Тепловая карта историй (от холодного синего к горячему красному)
    currentMap.addLayer({
      id: 'stories-heatmap',
      type: 'heatmap',
      source: 'stories-source',
      maxzoom: 12,
      paint: {
        // Вес точки зависит от количества сердечек
        'heatmap-weight': [
          'interpolate', ['linear'], ['get', 'heartsCount'],
          0, 0.5,
          10, 1,
          50, 2,
          100, 3
        ],
        // Интенсивность увеличивается при приближении
        'heatmap-intensity': [
          'interpolate', ['linear'], ['zoom'],
          0, 0.3,
          5, 1,
          10, 2
        ],
        // Цветовая палитра: холодный синий -> тёплый оранжевый -> горячий красный
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(33, 102, 172, 0)',
          0.1, 'rgba(103, 169, 207, 0.4)',
          0.25, 'rgba(209, 229, 240, 0.5)',
          0.4, 'rgba(253, 219, 199, 0.6)',
          0.55, 'rgba(251, 191, 36, 0.7)',
          0.7, 'rgba(249, 115, 22, 0.8)',
          0.85, 'rgba(239, 68, 68, 0.9)',
          1, 'rgba(185, 28, 28, 1)'
        ],
        // Радиус тепловых точек
        'heatmap-radius': [
          'interpolate', ['linear'], ['zoom'],
          0, 10,
          3, 20,
          6, 40,
          10, 60
        ],
        // Прозрачность уменьшается при приближении (чтобы видеть маркеры)
        'heatmap-opacity': [
          'interpolate', ['linear'], ['zoom'],
          5, 0.9,
          10, 0.6,
          12, 0
        ]
      }
    });

    currentMap.addLayer({
      id: 'clusters', type: 'circle', source: 'stories-source', filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#fbbf24', 10, '#f59e0b', 30, '#ea580c', 100, '#dc2626'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 25, 30, 30, 100, 40],
        'circle-stroke-width': 3, 'circle-stroke-color': '#ffffff'
      }
    });

    currentMap.addLayer({
      id: 'cluster-count', type: 'symbol', source: 'stories-source', filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Bold'], 'text-size': 14 },
      paint: { 'text-color': '#ffffff' }
    });

    if (currentZoom >= ZOOM_LEVELS.CITY) {
      for (const story of stories) {
        const el = createMarkerElement(story, story.id === selectedStoryId);
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([story.longitude, story.latitude])
          .addTo(currentMap);
        markersRef.current.push(marker);
      }
    }
  }, [stories, selectedStoryId, isMapLoaded, createMarkerElement, currentZoom]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    regionMarkersRef.current.forEach(marker => marker.remove());
    regionMarkersRef.current = [];

    if (currentZoom < ZOOM_LEVELS.CITY) {
      const counts = storiesByRegion();
      for (const region of RUSSIAN_REGIONS) {
        const count = counts[region.id] || 0;
        if (count === 0) continue;
        const el = document.createElement('div');
        el.className = 'region-story-count';
        el.innerHTML = `<div class="region-badge ${count > 10 ? 'hot' : count > 5 ? 'warm' : ''}"><span class="count">${count}</span><span class="icon">📖</span></div>`;
        el.addEventListener('click', () => {
          setSelectedRegion(region);
          onRegionClick?.(region.id);
          map.current?.flyTo({ center: region.center, zoom: ZOOM_LEVELS.REGION, pitch: 50, duration: 1500 });
        });
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(region.center).addTo(map.current!);
        regionMarkersRef.current.push(marker);
      }
    }
  }, [currentZoom, isMapLoaded, stories, storiesByRegion, onRegionClick]);

  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    const currentMap = map.current;

    if (currentMap.getLayer('settlements-labels')) currentMap.removeLayer('settlements-labels');
    if (currentMap.getLayer('settlements-circles')) currentMap.removeLayer('settlements-circles');
    if (currentMap.getSource('settlements-source')) currentMap.removeSource('settlements-source');

    if (currentZoom >= ZOOM_LEVELS.REGION && currentZoom < ZOOM_LEVELS.CITY && settlements.length > 0) {
      const settlementsGeoJSON: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: settlements.map(s => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: s.coordinates },
          properties: { id: s.id, name: s.name, population: s.population || 0 },
        })),
      };

      currentMap.addSource('settlements-source', { type: 'geojson', data: settlementsGeoJSON });
      currentMap.addLayer({
        id: 'settlements-circles', type: 'circle', source: 'settlements-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'population'], 0, 4, 10000, 6, 100000, 10, 1000000, 14],
          'circle-color': '#f59e0b', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2,
        },
      });
      currentMap.addLayer({
        id: 'settlements-labels', type: 'symbol', source: 'settlements-source',
        layout: { 'text-field': ['get', 'name'], 'text-font': ['Open Sans Bold'], 'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 0.8] },
        paint: { 'text-color': '#1e293b', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
      });
    }
  }, [currentZoom, isMapLoaded, settlements]);

  const resetView = useCallback(() => {
    setSelectedRegion(null);
    map.current?.flyTo({ center: [100.0, 65.0], zoom: ZOOM_LEVELS.COUNTRY, pitch: 45, duration: 1500 });
  }, []);

  // Случайная история - перелёт к случайной точке на карте
  const [isFlying, setIsFlying] = useState(false);
  const flyToRandomStory = useCallback(() => {
    if (!map.current || stories.length === 0 || isFlying) return;

    const randomIndex = Math.floor(Math.random() * stories.length);
    const randomStory = stories[randomIndex];

    setIsFlying(true);

    map.current.flyTo({
      center: [randomStory.longitude, randomStory.latitude],
      zoom: ZOOM_LEVELS.STREET,
      pitch: 60,
      bearing: Math.random() * 60 - 30,
      duration: 2500,
      essential: true
    });

    map.current.once('moveend', () => {
      setIsFlying(false);
      onStoryClick?.(randomStory.id);
    });
  }, [stories, isFlying, onStoryClick]);

  // Перелёт к адресу из поиска
  const flyToAddress = useCallback((coords: { lat: number; lng: number }, address: string) => {
    if (!map.current || isFlying) return;

    setIsFlying(true);

    // Плавный перелёт с красивой анимацией
    map.current.flyTo({
      center: [coords.lng, coords.lat],
      zoom: ZOOM_LEVELS.STREET,
      pitch: 55,
      bearing: Math.random() * 40 - 20,
      duration: 2500,
      essential: true,
      curve: 1.42,
    });

    map.current.once('moveend', () => {
      setIsFlying(false);
    });
  }, [isFlying]);

  const getZoomLevel = () => {
    if (currentZoom >= ZOOM_LEVELS.BUILDING) return 'building';
    if (currentZoom >= ZOOM_LEVELS.STREET) return 'street';
    if (currentZoom >= ZOOM_LEVELS.SETTLEMENT) return 'settlement';
    if (currentZoom >= ZOOM_LEVELS.CITY) return 'city';
    if (currentZoom >= ZOOM_LEVELS.REGION) return 'region';
    return 'country';
  };

  const regionStoryCounts = storiesByRegion();

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Поиск адреса - справа вверху */}
      <AddressSearch onAddressSelect={flyToAddress} />

      {/* Индикатор уровня зума - слева вверху */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-zinc-700 whitespace-nowrap">
              {getZoomLevel() === 'country' && 'Вся Россия'}
              {getZoomLevel() === 'region' && (selectedRegion?.name || 'Регион')}
              {getZoomLevel() === 'city' && 'Город'}
              {getZoomLevel() === 'settlement' && 'Район'}
              {getZoomLevel() === 'street' && 'Улицы'}
              {getZoomLevel() === 'building' && '3D Здания'}
            </span>
          </div>
        </div>
      </div>

      {/* Панель управления - слева под индикатором */}
      <div className="absolute top-16 left-4 z-10 flex flex-col gap-2">
        {/* Кнопка "Вся Россия" */}
        {currentZoom > ZOOM_LEVELS.COUNTRY + 1 && (
          <button
            onClick={resetView}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-2.5 sm:px-4 sm:py-2.5 shadow-lg border border-zinc-100 hover:bg-white transition-all flex items-center gap-2"
            title="Вернуться к виду всей России"
          >
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium text-zinc-700 hidden sm:inline">Вся Россия</span>
          </button>
        )}

        {/* Кнопка "Случайная история" */}
        {stories.length > 0 && (
          <button
            onClick={flyToRandomStory}
            disabled={isFlying}
            className={`bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 rounded-xl p-2.5 sm:px-4 sm:py-2.5 shadow-lg border border-amber-300 transition-all flex items-center gap-2 group ${isFlying ? 'opacity-70 cursor-wait' : ''}`}
            title="Случайная история - перелёт к случайной точке"
          >
            <svg
              className={`w-5 h-5 text-white ${isFlying ? 'animate-spin' : 'group-hover:animate-bounce'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12c-.83 0-1.5-.67-1.5-1.5S10.17 12 11 12s1.5.67 1.5 1.5S11.83 15 11 15zm2-6c-.83 0-1.5-.67-1.5-1.5S12.17 6 13 6s1.5.67 1.5 1.5S13.83 9 13 9zm-4 0c-.83 0-1.5-.67-1.5-1.5S8.17 6 9 6s1.5.67 1.5 1.5S9.83 9 9 9zm6 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-6 4c-.83 0-1.5-.67-1.5-1.5S8.17 16 9 16s1.5.67 1.5 1.5S9.83 19 9 19zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            <span className="text-sm font-semibold text-white hidden sm:inline">Случайная история</span>
          </button>
        )}
      </div>

      {hoveredRegion && currentZoom < ZOOM_LEVELS.REGION && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-zinc-900/90 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-xl max-w-[85vw]">
            <div className="text-xs sm:text-sm font-medium text-center truncate">{hoveredRegion}</div>
          </div>
        </div>
      )}

      {currentZoom >= ZOOM_LEVELS.SETTLEMENT && (
        <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xl flex items-center gap-2 max-w-[90vw]">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-center">Нажмите на карту, чтобы оставить историю</span>
          </div>
        </div>
      )}

      {currentZoom >= ZOOM_LEVELS.SETTLEMENT && (
        <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-zinc-100">
            <div className="text-xs font-medium text-zinc-500 mb-2">OpenFreeMap</div>
            <div className="flex flex-col gap-1.5 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-[#e8e4e0] to-[#c0b8b0]" />
                <span>3D здания</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-zinc-400" />
                <span>Улицы</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500">123</span>
                <span>Номера домов</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .story-marker { cursor: pointer; transition: transform 0.2s ease; }
        .story-marker:hover { transform: scale(1.15); z-index: 100 !important; }
        .marker-container { display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25)); }
        .marker-container.selected { transform: scale(1.2); }
        .marker-pin { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 3px solid #f59e0b; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
        .marker-emoji { font-size: 22px; line-height: 1; transform: rotate(45deg); }
        .marker-hearts { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px; margin-top: 4px; }
        .region-story-count { cursor: pointer; transition: transform 0.2s ease; }
        .region-story-count:hover { transform: scale(1.15); z-index: 100 !important; }
        .region-badge { display: flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 2px solid #f59e0b; border-radius: 20px; padding: 6px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .region-badge.warm { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); }
        .region-badge.hot { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); }
        .region-badge .count { font-size: 14px; font-weight: 700; color: #92400e; }
        .region-badge .icon { font-size: 14px; }
        .maplibregl-ctrl-group { background: rgba(255,255,255,0.98) !important; backdrop-filter: blur(12px); border-radius: 14px !important; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.12) !important; border: 1px solid rgba(0,0,0,0.05) !important; }
        .maplibregl-ctrl-group button { width: 36px !important; height: 36px !important; }
        .maplibregl-ctrl-scale { background: rgba(255,255,255,0.95) !important; border-radius: 8px !important; padding: 4px 10px !important; font-size: 11px !important; }
      `}</style>
    </div>
  );
}

export default InteractiveMap;
