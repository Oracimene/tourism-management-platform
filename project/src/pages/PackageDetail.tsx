import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Star, Clock, Utensils, Home, Navigation } from 'lucide-react';
import { supabase, Package, Review } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PackageDetailProps {
  packageId: string;
  onNavigate: (page: string, params?: any) => void;
}

export default function PackageDetail({ packageId, onNavigate }: PackageDetailProps) {
  const [pkg, setPackage] = useState<Package | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    loadPackage();
    loadReviews();
  }, [packageId]);

  const loadPackage = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          host:profiles!packages_host_id_fkey(*)
        `)
        .eq('id', packageId)
        .maybeSingle();

      if (error) throw error;
      setPackage(data);
    } catch (error) {
      console.error('Error loading package:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(*)
        `)
        .eq('package_id', packageId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Pacote não encontrado</p>
          <button
            onClick={() => onNavigate('search')}
            className="mt-4 text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Voltar para busca
          </button>
        </div>
      </div>
    );
  }

  const doc = pkg.long_document;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden">
              {pkg.images && pkg.images.length > 0 ? (
                <img
                  src={pkg.images[activeImage]}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin size={64} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {pkg.images && pkg.images.slice(1, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx + 1)}
                  className="relative h-44 bg-gray-200 rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img src={img} alt={`${pkg.title} ${idx + 2}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{pkg.title}</h1>
                <p className="text-gray-600 text-lg">{pkg.short_description}</p>
              </div>
              <div className="text-right ml-6">
                <p className="text-4xl font-bold text-emerald-600">
                  R$ {pkg.price_per_person.toLocaleString('pt-BR')}
                </p>
                <p className="text-gray-600">por pessoa</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" size={20} />
                <span className="font-semibold">
                  {calculateAverageRating().toFixed(1)}
                </span>
                <span className="text-gray-600">({reviews.length} avaliações)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={20} />
                <span>{pkg.duration_days} {pkg.duration_days === 1 ? 'dia' : 'dias'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={20} />
                <span>{pkg.capacity_min} - {pkg.capacity_max} pessoas</span>
              </div>
            </div>

            {pkg.tags && pkg.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {pkg.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {doc.days && doc.days.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="text-emerald-600" />
                  Itinerário
                </h2>
                <div className="space-y-4">
                  {doc.days.map((day, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">
                        Dia {day.day}
                      </h3>
                      <ul className="space-y-2">
                        {day.activities.map((activity, actIdx) => (
                          <li key={actIdx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-emerald-600 mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.accommodations && doc.accommodations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="text-emerald-600" />
                  Hospedagem
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doc.accommodations.map((acc, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{acc.name}</h3>
                      <p className="text-gray-600 mb-2">{acc.address}</p>
                      <p className="text-sm text-gray-500">{acc.nights} {acc.nights === 1 ? 'noite' : 'noites'}</p>
                      {acc.amenities && acc.amenities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {acc.amenities.map((amenity, amIdx) => (
                            <span key={amIdx} className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.meals && doc.meals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Utensils className="text-emerald-600" />
                  Refeições Incluídas
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex flex-wrap gap-3">
                    {doc.meals.map((meal, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white rounded-lg text-gray-700 font-medium">
                        {meal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {doc.transport && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Navigation className="text-emerald-600" />
                  Transporte
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700">{doc.transport}</p>
                </div>
              </div>
            )}

            {doc.includes && doc.includes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">O que está incluído</h3>
                <ul className="space-y-2">
                  {doc.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {doc.what_to_bring && doc.what_to_bring.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">O que levar</h3>
                <ul className="space-y-2">
                  {doc.what_to_bring.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pkg.cancellation_policy && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Política de Cancelamento</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <p className="text-gray-700">{pkg.cancellation_policy}</p>
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Avaliações</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-emerald-600">
                            {review.reviewer?.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.reviewer?.full_name}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                size={16}
                                className={idx < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-gray-700">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {user ? (
                <button
                  onClick={() => onNavigate('booking', { packageId: pkg.id })}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-lg"
                >
                  Reservar Agora
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-lg"
                >
                  Entre para Reservar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
