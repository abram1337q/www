'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, MapPin, Loader2, ChevronRight } from 'lucide-react';

interface AddressResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  addresstype: string;
}

interface AddressSearchProps {
  onAddressSelect: (coords: { lat: number; lng: number }, address: string) => void;
}

export function AddressSearch({ onAddressSelect }: AddressSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
  };

  // Debounced search using Nominatim (OpenStreetMap)
  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: 'json',
          addressdetails: '1',
          limit: '6',
          countrycodes: 'ru', // Ограничиваем поиск Россией
          'accept-language': 'ru',
        }),
        {
          headers: {
            'User-Agent': 'SledNaZemle/1.0'
          }
        }
      );

      if (response.ok) {
        const data: AddressResult[] = await response.json();
        setResults(data);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectAddress(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Handle address selection
  const handleSelectAddress = (result: AddressResult) => {
    const coords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };

    // Close the search panel with animation
    handleClose();

    // Trigger the fly-to animation
    onAddressSelect(coords, result.display_name);
  };

  // Get short address for display
  const getShortAddress = (displayName: string): string => {
    const parts = displayName.split(', ');
    if (parts.length <= 3) return displayName;
    return parts.slice(0, 3).join(', ');
  };

  // Get address type icon
  const getAddressTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      'city': 'Город',
      'town': 'Город',
      'village': 'Село',
      'hamlet': 'Деревня',
      'suburb': 'Район',
      'neighbourhood': 'Микрорайон',
      'road': 'Улица',
      'house': 'Дом',
      'building': 'Здание',
      'administrative': 'Область',
      'state': 'Регион',
    };
    return types[type] || 'Место';
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 -translate-y-1/2 right-4 z-30"
    >
      {/* Search Button / Container */}
      <div
        className={`
          relative overflow-hidden transition-all duration-500 ease-out
          ${isOpen
            ? 'w-80 sm:w-96 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200'
            : 'w-12 h-12'
          }
        `}
      >
        {/* Collapsed: Icon Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-xl shadow-lg border border-zinc-100 flex items-center justify-center hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-300 group"
            aria-label="Поиск адреса"
          >
            <Search className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 transition-colors" />
          </button>
        )}

        {/* Expanded: Search Input */}
        {isOpen && (
          <div className="p-4">
            {/* Search Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-800">Поиск места</h3>
                <p className="text-xs text-zinc-500">Введите адрес или название</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Input Field */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Москва, Красная площадь..."
                className="w-full h-12 pl-4 pr-12 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-sm"
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Results Dropdown */}
            {results.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-zinc-100 bg-white divide-y divide-zinc-50">
                {results.map((result, index) => (
                  <button
                    key={result.place_id}
                    onClick={() => handleSelectAddress(result)}
                    className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all group ${
                      selectedIndex === index ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      selectedIndex === index
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-zinc-100 group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-orange-500'
                    }`}>
                      <MapPin className={`w-4 h-4 ${
                        selectedIndex === index ? 'text-white' : 'text-zinc-500 group-hover:text-white'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-800 truncate">
                        {getShortAddress(result.display_name)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {getAddressTypeLabel(result.addresstype)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-all ${
                      selectedIndex === index
                        ? 'text-amber-500 translate-x-0'
                        : 'text-zinc-300 -translate-x-1 group-hover:translate-x-0 group-hover:text-amber-500'
                    }`} />
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {query.length >= 3 && results.length === 0 && !isLoading && (
              <div className="mt-3 p-4 rounded-xl bg-zinc-50 text-center">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-500">Ничего не найдено</p>
                <p className="text-xs text-zinc-400 mt-1">Попробуйте другой запрос</p>
              </div>
            )}

            {/* Hint */}
            {query.length < 3 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px]">↑↓</kbd>
                <span>навигация</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px]">Enter</kbd>
                <span>выбрать</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 font-mono text-[10px]">Esc</kbd>
                <span>закрыть</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddressSearch;
