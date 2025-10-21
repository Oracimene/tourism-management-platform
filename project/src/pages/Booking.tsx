import { useState, useEffect } from 'react';
import { Calendar, Users, CreditCard, FileText } from 'lucide-react';
import { supabase, Package } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingProps {
  packageId: string;
  onNavigate: (page: string, params?: any) => void;
}

export default function Booking({ packageId, onNavigate }: BookingProps) {
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [numPeople, setNumPeople] = useState('2');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'boleto'>('credit_card');

  const { user, profile } = useAuth();

  useEffect(() => {
    loadPackage();
  }, [packageId]);

  const loadPackage = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
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

  const calculateTotal = () => {
    if (!pkg) return 0;
    return pkg.price_per_person * Number(numPeople);
  };

  const calculateCommission = () => {
    return calculateTotal() * 0.1;
  };

  const calculateHostAmount = () => {
    return calculateTotal() - calculateCommission();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user || !pkg) {
        throw new Error('Usuário ou pacote não encontrado');
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + pkg.duration_days - 1);

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          package_id: pkg.id,
          user_id: user.id,
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0],
          num_people: Number(numPeople),
          total_amount: calculateTotal(),
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          booking_id: bookingData.id,
          amount: calculateTotal(),
          commission: calculateCommission(),
          gateway_fee: 0,
          net_amount: calculateHostAmount(),
          payment_method: paymentMethod,
          status: 'pending',
        });

      if (transactionError) throw transactionError;

      alert('Reserva criada com sucesso! Processando pagamento...');
      onNavigate('profile');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Erro ao criar reserva. Tente novamente.');
      setSubmitting(false);
    }
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
        <p className="text-gray-600">Pacote não encontrado</p>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Reserva</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-emerald-600" />
                  Detalhes da Viagem
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={minDate.toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Pessoas *
                    </label>
                    <input
                      type="number"
                      value={numPeople}
                      onChange={(e) => setNumPeople(e.target.value)}
                      min={pkg.capacity_min}
                      max={pkg.capacity_max}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Mínimo: {pkg.capacity_min} | Máximo: {pkg.capacity_max}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="text-emerald-600" />
                  Forma de Pagamento
                </h2>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={paymentMethod === 'credit_card' ? 'text-emerald-600' : 'text-gray-600'} />
                      <div>
                        <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                        <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'boleto'
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={paymentMethod === 'boleto' ? 'text-emerald-600' : 'text-gray-600'} />
                      <div>
                        <p className="font-semibold text-gray-900">Boleto Bancário</p>
                        <p className="text-sm text-gray-600">Pagamento em até 3 dias úteis</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl hover:bg-emerald-700 transition-colors font-bold text-lg disabled:opacity-50"
              >
                {submitting ? 'Processando...' : 'Confirmar Reserva'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo da Reserva</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={pkg.images?.[0] || ''}
                    alt={pkg.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 line-clamp-2">{pkg.title}</p>
                    <p className="text-sm text-gray-600">{pkg.duration_days} dias</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>R$ {pkg.price_per_person.toLocaleString('pt-BR')} x {numPeople} pessoas</span>
                  <span>R$ {(pkg.price_per_person * Number(numPeople)).toLocaleString('pt-BR')}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taxa de serviço (incluída)</span>
                  <span>R$ {calculateCommission().toLocaleString('pt-BR')}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>R$ {calculateTotal().toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Nota:</strong> Sua reserva será confirmada após o pagamento.
                  O anfitrião receberá R$ {calculateHostAmount().toLocaleString('pt-BR')}
                  (já descontada a comissão de 10%).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
