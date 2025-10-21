import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Users, Briefcase, Shield } from 'lucide-react';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'traveler' | 'host' | 'admin'>('traveler');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      setError('Erro ao criar conta. Email pode já estar em uso.');
      setLoading(false);
    } else {
      onNavigate('home');
    }
  };

  const fillAdminData = () => {
    setFullName('Administrador');
    setEmail('ADM1212@admin.com');
    setPassword('ACAD');
    setRole('admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <UserPlus className="text-emerald-600" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Criar Conta
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Comece sua aventura pelas ilhas do Pará
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="João Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
              <p className="text-sm text-gray-500 mt-1">Mínimo 4 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('traveler')}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    role === 'traveler'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Users className={`mx-auto mb-2 ${role === 'traveler' ? 'text-emerald-600' : 'text-gray-600'}`} size={20} />
                  <p className={`font-semibold text-sm ${role === 'traveler' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    Viajante
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    role === 'host'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Briefcase className={`mx-auto mb-2 ${role === 'host' ? 'text-emerald-600' : 'text-gray-600'}`} size={20} />
                  <p className={`font-semibold text-sm ${role === 'host' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    Anfitrião
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    role === 'admin'
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Shield className={`mx-auto mb-2 ${role === 'admin' ? 'text-gray-800' : 'text-gray-600'}`} size={20} />
                  <p className={`font-semibold text-sm ${role === 'admin' ? 'text-gray-800' : 'text-gray-900'}`}>
                    Admin
                  </p>
                </button>
              </div>
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={fillAdminData}
                  className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Preencher dados do Admin (ADM1212)
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
