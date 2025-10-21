import { useState, useEffect } from 'react';
import { Calendar, MapPin, CreditCard, Star, MessageSquare } from 'lucide-react';
import { supabase, Booking } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { profile } = useAuth();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          package:packages(*),
          user:profiles!bookings_user_id_fkey(*)
        `)
        .eq('user_id', profile?.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
    };

    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Concluída',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-gray-100 text-gray-700',
    };

    const labels = {
      pending: 'Pagamento Pendente',
      processing: 'Processando',
      paid: 'Pago',
      refunded: 'Reembolsado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.start_date) >= new Date() && b.status !== 'cancelled'
  );

  const pastBookings = bookings.filter(
    (b) => new Date(b.start_date) < new Date() || b.status === 'cancelled'
  );

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-emerald-600">
                {profile?.full_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
              <p className="text-gray-600">
                {profile?.role === 'host' ? 'Anfitrião' : 'Viajante'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'upcoming'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Próximas Viagens ({upcomingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'past'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Histórico ({pastBookings.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {displayBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === 'upcoming' ? 'Nenhuma viagem agendada' : 'Nenhuma viagem anterior'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'upcoming'
                    ? 'Explore nossos pacotes e faça sua primeira reserva!'
                    : 'Suas viagens concluídas aparecerão aqui'}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => onNavigate('search')}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                  >
                    Explorar Pacotes
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {displayBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                        {booking.package?.images && booking.package.images.length > 0 ? (
                          <img
                            src={booking.package.images[0]}
                            alt={booking.package.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <MapPin size={48} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <button
                              onClick={() => onNavigate('package', { id: booking.package_id })}
                              className="text-xl font-bold text-gray-900 hover:text-emerald-600 transition-colors mb-2 text-left"
                            >
                              {booking.package?.title}
                            </button>
                            <p className="text-gray-600 line-clamp-2">
                              {booking.package?.short_description}
                            </p>
                          </div>
                          <div className="ml-4 space-y-2">
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking.payment_status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>
                              {new Date(booking.start_date).toLocaleDateString('pt-BR')} -{' '}
                              {new Date(booking.end_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{booking.num_people} {booking.num_people === 1 ? 'pessoa' : 'pessoas'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} />
                            <span className="font-semibold text-gray-900">
                              R$ {booking.total_amount.toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          {booking.status === 'completed' && (
                            <button
                              onClick={() => onNavigate('review', { bookingId: booking.id })}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <Star size={16} />
                              Avaliar
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate('messages')}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                          >
                            <MessageSquare size={16} />
                            Mensagens
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
