import { useState, useEffect } from 'react';
import { Plus, Package as PackageIcon, CreditCard as Edit, Trash2, Eye } from 'lucide-react';
import { supabase, Package } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreatePackage from '../components/CreatePackage';

interface HostDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export default function HostDashboard({ onNavigate }: HostDashboardProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('host_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pacote?')) return;

    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);

      if (error) throw error;
      setPackages(packages.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Erro ao excluir pacote');
    }
  };

  const handlePackageCreated = () => {
    setShowCreateModal(false);
    setEditingPackage(null);
    loadPackages();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      pending_approval: 'bg-yellow-100 text-yellow-700',
      archived: 'bg-red-100 text-red-700',
    };

    const labels = {
      draft: 'Rascunho',
      published: 'Publicado',
      pending_approval: 'Pendente',
      archived: 'Arquivado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Pacotes</h1>
            <p className="text-gray-600 mt-2">Gerencie suas experiências e pacotes turísticos</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Criar Pacote
          </button>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <PackageIcon className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum pacote criado ainda</h2>
            <p className="text-gray-600 mb-6">
              Comece a compartilhar suas experiências criando seu primeiro pacote
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Criar Primeiro Pacote
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-64 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                    {pkg.images && pkg.images.length > 0 ? (
                      <img
                        src={pkg.images[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <PackageIcon size={48} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{pkg.short_description}</p>
                      </div>
                      <div className="ml-4">{getStatusBadge(pkg.status)}</div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <span>{pkg.duration_days} {pkg.duration_days === 1 ? 'dia' : 'dias'}</span>
                      <span>até {pkg.capacity_max} pessoas</span>
                      <span className="font-bold text-emerald-600">
                        R$ {pkg.price_per_person.toLocaleString('pt-BR')}/pessoa
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => onNavigate('package', { id: pkg.id })}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                      >
                        <Eye size={18} />
                        Visualizar
                      </button>
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setShowCreateModal(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                      >
                        <Edit size={18} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={18} />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePackage
          packageToEdit={editingPackage}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPackage(null);
          }}
          onSuccess={handlePackageCreated}
        />
      )}
    </div>
  );
}
