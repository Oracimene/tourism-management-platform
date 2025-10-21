import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Shield } from 'lucide-react';
import { createAdminUser } from '../utils/createAdmin';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminCreate, setShowAdminCreate] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Email ou senha inválidos');
      setLoading(false);
    } else {
      onNavigate('home');
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError('');

    const result = await createAdminUser();

    if (result.success) {
      alert('Administrador criado com sucesso!\n\nEmail: ADM1212@admin.com\nSenha: ACAD');
      setEmail('ADM1212@admin.com');
      setPassword('ACAD');
      setShowAdminCreate(false);
    } else {
      setError('Erro ao criar administrador. Pode já existir.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <LogIn className="text-emerald-600" size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Bem-vindo de volta
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Entre para continuar sua jornada
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="seu@email.com ou ADM1212@admin.com"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Cadastre-se
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowAdminCreate(!showAdminCreate)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Shield size={16} />
              <span>Acesso Administrativo</span>
            </button>

            {showAdminCreate && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Clique no botão abaixo para criar o usuário administrador:
                </p>
                <button
                  onClick={handleCreateAdmin}
                  disabled={loading}
                  className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar Admin (ADM1212)'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Email: ADM1212@admin.com | Senha: ACAD
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
