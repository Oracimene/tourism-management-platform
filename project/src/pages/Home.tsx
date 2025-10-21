import { Search, Users, Map, Heart } from 'lucide-react';
import { useState } from 'react';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchGuests, setSearchGuests] = useState('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search', { query: searchQuery, date: searchDate, guests: searchGuests });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center">
            Descubra as Ilhas do Pará
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-center max-w-2xl">
            Experiências únicas em Belém e ilhas amazônicas
          </p>

          <form
            onSubmit={handleSearch}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 md:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino ou Experiência
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ilha do Combu, gastronomia..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pessoas
                </label>
                <input
                  type="number"
                  value={searchGuests}
                  onChange={(e) => setSearchGuests(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-semibold text-lg"
            >
              <Search size={20} />
              Buscar Experiências
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Por que escolher as Ilhas do Pará?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Map className="text-emerald-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Destinos Únicos
            </h3>
            <p className="text-gray-600">
              Explore ilhas paradisíacas próximas a Belém com cultura ribeirinha autêntica e natureza preservada.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-emerald-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Gastronomia Amazônica
            </h3>
            <p className="text-gray-600">
              Saboreie pratos típicos como tacacá, maniçoba e açaí preparados por comunidades locais.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Users className="text-emerald-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Anfitriões Locais
            </h3>
            <p className="text-gray-600">
              Conecte-se com guias e operadores locais que conhecem cada segredo das ilhas.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Experiências Populares
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Das praias de Mosqueiro aos sabores do Combu, cada ilha oferece uma aventura única
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onNavigate('search', { tag: 'gastronomia' })}
              className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow text-left"
            >
              <span className="text-2xl mb-2 block">🍲</span>
              <h4 className="font-bold text-gray-900 mb-1">Gastronomia</h4>
              <p className="text-sm text-gray-600">Sabores amazônicos</p>
            </button>

            <button
              onClick={() => onNavigate('search', { tag: 'ecoturismo' })}
              className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow text-left"
            >
              <span className="text-2xl mb-2 block">🌿</span>
              <h4 className="font-bold text-gray-900 mb-1">Ecoturismo</h4>
              <p className="text-sm text-gray-600">Natureza preservada</p>
            </button>

            <button
              onClick={() => onNavigate('search', { tag: 'cultural' })}
              className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow text-left"
            >
              <span className="text-2xl mb-2 block">🎭</span>
              <h4 className="font-bold text-gray-900 mb-1">Cultural</h4>
              <p className="text-sm text-gray-600">Cultura ribeirinha</p>
            </button>

            <button
              onClick={() => onNavigate('search', { tag: 'aventura' })}
              className="bg-white p-6 rounded-xl hover:shadow-lg transition-shadow text-left"
            >
              <span className="text-2xl mb-2 block">🚣</span>
              <h4 className="font-bold text-gray-900 mb-1">Aventura</h4>
              <p className="text-sm text-gray-600">Experiências únicas</p>
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Quer ser um anfitrião?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Compartilhe suas experiências e pacotes turísticos com viajantes do mundo todo
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Começar como Anfitrião
          </button>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Ilhas do Pará</h4>
              <p className="text-gray-400">
                Conectando viajantes às experiências autênticas das ilhas amazônicas
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Navegação</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button onClick={() => onNavigate('search')} className="hover:text-white transition-colors">
                    Explorar
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('register')} className="hover:text-white transition-colors">
                    Seja um Anfitrião
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Sobre</h4>
              <p className="text-gray-400 text-sm">
                Plataforma dedicada ao turismo sustentável e responsável nas ilhas do Pará
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Ilhas do Pará. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
