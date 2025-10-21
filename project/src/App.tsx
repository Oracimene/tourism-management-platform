import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import PackageDetail from './pages/PackageDetail';
import HostDashboard from './pages/HostDashboard';
import Booking from './pages/Booking';
import Profile from './pages/Profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>({});
  const { loading } = useAuth();

  const navigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'login' && currentPage !== 'register' && (
        <Navbar onNavigate={navigate} currentPage={currentPage} />
      )}

      {currentPage === 'home' && <Home onNavigate={navigate} />}
      {currentPage === 'login' && <Login onNavigate={navigate} />}
      {currentPage === 'register' && <Register onNavigate={navigate} />}
      {currentPage === 'search' && <Search onNavigate={navigate} initialParams={pageParams} />}
      {currentPage === 'package' && <PackageDetail packageId={pageParams.id} onNavigate={navigate} />}
      {currentPage === 'host-dashboard' && <HostDashboard onNavigate={navigate} />}
      {currentPage === 'booking' && <Booking packageId={pageParams.packageId} onNavigate={navigate} />}
      {currentPage === 'profile' && <Profile onNavigate={navigate} />}
      {currentPage === 'messages' && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Mensagens</h2>
            <p className="text-gray-600">Em desenvolvimento</p>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
