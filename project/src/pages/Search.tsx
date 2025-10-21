import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, Star, MapPin, Calendar, Users } from 'lucide-react';
import { supabase, Package } from '../lib/supabase';

interface SearchProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: {
    query?: string;
    date?: string;
    guests?: string;
    tag?: string;
  };
}

export default function Search({ onNavigate, initialParams }: SearchProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialParams?.query || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialParams?.tag ? [initialParams.tag] : []
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);

  const availableTags = ['gastronomia', 'ecoturismo', 'cultural', 'aventura', 'família'];

  useEffect(() => {
    loadPackages();
  }, [selectedTags, priceRange]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          host:profiles!packages_host_id_fkey(*)
        `)
        .eq('status', 'published')
        .gte('price_per_person', priceRange.min)
        .lte('price_per_person', priceRange.max)
        .order('created_at', { ascending: false });

      if (selectedTags.length > 0) {
        query = query.overlaps('tags', selectedTags);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const calculateAverageRating = () => 4.5;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadPackages()}
                placeholder="Buscar pacotes, ilhas, experiências..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={loadPackages}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              Buscar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço (por pessoa)
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    placeholder="Mín"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="self-center text-gray-500">até</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    placeholder="Máx"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">Carregando pacotes...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhum pacote encontrado</p>
            <p className="text-gray-500 mt-2">Tente ajustar seus filtros de busca</p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {packages.length} {packages.length === 1 ? 'pacote encontrado' : 'pacotes encontrados'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => onNavigate('package', { id: pkg.id })}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden text-left"
                >
                  <div className="relative h-48 bg-gray-200">
                    {pkg.images && pkg.images.length > 0 ? (
                      <img
                        src={pkg.images[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin size={48} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2">
                        {pkg.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {pkg.short_description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {pkg.duration_days} {pkg.duration_days === 1 ? 'dia' : 'dias'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        até {pkg.capacity_max}
                      </span>
                    </div>

                    {pkg.tags && pkg.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pkg.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="font-semibold text-gray-900">
                          {calculateAverageRating().toFixed(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          R$ {pkg.price_per_person.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">por pessoa</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
