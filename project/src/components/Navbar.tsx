import { useState } from 'react';
import { Menu, X, User, LogOut, Package, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Ilhas do Pará
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('search')}
              className="text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Explorar
            </button>

            {user ? (
              <>
                {profile?.role === 'host' && (
                  <button
                    onClick={() => onNavigate('host-dashboard')}
                    className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <Package size={18} />
                    <span>Meus Pacotes</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('messages')}
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <MessageSquare size={18} />
                  <span>Mensagens</span>
                </button>

                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <User size={18} />
                  <span>{profile?.full_name || 'Perfil'}</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <button
              onClick={() => {
                onNavigate('search');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left text-gray-700 hover:text-emerald-600 transition-colors py-2"
            >
              Explorar
            </button>

            {user ? (
              <>
                {profile?.role === 'host' && (
                  <button
                    onClick={() => {
                      onNavigate('host-dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-emerald-600 transition-colors py-2"
                  >
                    <Package size={18} />
                    <span>Meus Pacotes</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onNavigate('messages');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-gray-700 hover:text-emerald-600 transition-colors py-2"
                >
                  <MessageSquare size={18} />
                  <span>Mensagens</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-gray-700 hover:text-emerald-600 transition-colors py-2"
                >
                  <User size={18} />
                  <span>{profile?.full_name || 'Perfil'}</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full text-red-600 hover:text-red-700 transition-colors py-2"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-emerald-600 transition-colors py-2"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Cadastrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
