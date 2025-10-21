import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Package } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreatePackageProps {
  packageToEdit?: Package | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePackage({ packageToEdit, onClose, onSuccess }: CreatePackageProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [capacityMin, setCapacityMin] = useState('1');
  const [capacityMax, setCapacityMax] = useState('10');
  const [durationDays, setDurationDays] = useState('2');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [itinerary, setItinerary] = useState([{ day: 1, activities: [''] }]);
  const [accommodations, setAccommodations] = useState([{ name: '', address: '', nights: 1 }]);
  const [meals, setMeals] = useState('');
  const [transport, setTransport] = useState('');
  const [includes, setIncludes] = useState('');
  const [whatToBring, setWhatToBring] = useState('');

  const availableTags = ['gastronomia', 'ecoturismo', 'cultural', 'aventura', 'família'];

  useEffect(() => {
    if (packageToEdit) {
      setTitle(packageToEdit.title);
      setShortDescription(packageToEdit.short_description);
      setPricePerPerson(packageToEdit.price_per_person.toString());
      setCapacityMin(packageToEdit.capacity_min.toString());
      setCapacityMax(packageToEdit.capacity_max.toString());
      setDurationDays(packageToEdit.duration_days.toString());
      setTags(packageToEdit.tags || []);
      setImages(packageToEdit.images?.join('\n') || '');
      setCancellationPolicy(packageToEdit.cancellation_policy || '');
      setStatus(packageToEdit.status === 'published' ? 'published' : 'draft');

      const doc = packageToEdit.long_document;
      if (doc.days) setItinerary(doc.days);
      if (doc.accommodations) setAccommodations(doc.accommodations);
      if (doc.meals) setMeals(doc.meals.join(', '));
      if (doc.transport) setTransport(doc.transport);
      if (doc.includes) setIncludes(doc.includes.join('\n'));
      if (doc.what_to_bring) setWhatToBring(doc.what_to_bring.join('\n'));
    }
  }, [packageToEdit]);

  const addItineraryDay = () => {
    setItinerary([...itinerary, { day: itinerary.length + 1, activities: [''] }]);
  };

  const updateItineraryActivity = (dayIdx: number, actIdx: number, value: string) => {
    const updated = [...itinerary];
    updated[dayIdx].activities[actIdx] = value;
    setItinerary(updated);
  };

  const addActivity = (dayIdx: number) => {
    const updated = [...itinerary];
    updated[dayIdx].activities.push('');
    setItinerary(updated);
  };

  const addAccommodation = () => {
    setAccommodations([...accommodations, { name: '', address: '', nights: 1 }]);
  };

  const updateAccommodation = (idx: number, field: string, value: any) => {
    const updated = [...accommodations];
    updated[idx] = { ...updated[idx], [field]: value };
    setAccommodations(updated);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const longDocument = {
        duration_days: Number(durationDays),
        days: itinerary.filter((day) => day.activities.some((a) => a.trim())),
        accommodations: accommodations.filter((acc) => acc.name.trim()),
        meals: meals.split(',').map((m) => m.trim()).filter((m) => m),
        transport,
        includes: includes.split('\n').map((i) => i.trim()).filter((i) => i),
        what_to_bring: whatToBring.split('\n').map((w) => w.trim()).filter((w) => w),
      };

      const packageData = {
        host_id: profile?.id,
        title,
        short_description: shortDescription,
        long_document: longDocument,
        price_per_person: Number(pricePerPerson),
        capacity_min: Number(capacityMin),
        capacity_max: Number(capacityMax),
        duration_days: Number(durationDays),
        tags,
        images: images.split('\n').map((img) => img.trim()).filter((img) => img),
        cancellation_policy: cancellationPolicy,
        status,
      };

      if (packageToEdit) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', packageToEdit.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('packages').insert(packageData);

        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving package:', err);
      setError('Erro ao salvar pacote');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {packageToEdit ? 'Editar Pacote' : 'Criar Novo Pacote'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Pacote *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Roteiro Gastronômico nas Ilhas de Belém"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Curta *
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Uma experiência única combinando cultura ribeirinha e gastronomia amazônica..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço/pessoa (R$) *
              </label>
              <input
                type="number"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (dias) *
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mín. pessoas *
              </label>
              <input
                type="number"
                value={capacityMin}
                onChange={(e) => setCapacityMin(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máx. pessoas *
              </label>
              <input
                type="number"
                value={capacityMax}
                onChange={(e) => setCapacityMax(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tags.includes(tag)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Itinerário
            </label>
            {itinerary.map((day, dayIdx) => (
              <div key={dayIdx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Dia {day.day}</h4>
                {day.activities.map((activity, actIdx) => (
                  <input
                    key={actIdx}
                    type="text"
                    value={activity}
                    onChange={(e) => updateItineraryActivity(dayIdx, actIdx, e.target.value)}
                    placeholder="Atividade"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addActivity(dayIdx)}
                  className="text-emerald-600 text-sm font-medium"
                >
                  + Adicionar atividade
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItineraryDay}
              className="text-emerald-600 font-medium"
            >
              + Adicionar dia
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospedagens
            </label>
            {accommodations.map((acc, idx) => (
              <div key={idx} className="mb-3 p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={acc.name}
                  onChange={(e) => updateAccommodation(idx, 'name', e.target.value)}
                  placeholder="Nome da pousada"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={acc.address}
                  onChange={(e) => updateAccommodation(idx, 'address', e.target.value)}
                  placeholder="Endereço"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={acc.nights}
                  onChange={(e) => updateAccommodation(idx, 'nights', Number(e.target.value))}
                  placeholder="Noites"
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addAccommodation}
              className="text-emerald-600 font-medium"
            >
              + Adicionar hospedagem
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refeições (separadas por vírgula)
            </label>
            <input
              type="text"
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              placeholder="tacacá, maniçoba, açaí"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transporte
            </label>
            <input
              type="text"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
              placeholder="Lancha ida e volta"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O que está incluído (um por linha)
            </label>
            <textarea
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
              rows={4}
              placeholder="Transporte&#10;Refeições&#10;Guia local"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O que levar (um por linha)
            </label>
            <textarea
              value={whatToBring}
              onChange={(e) => setWhatToBring(e.target.value)}
              rows={4}
              placeholder="Protetor solar&#10;Repelente&#10;Roupa leve"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URLs das Imagens (uma por linha)
            </label>
            <textarea
              value={images}
              onChange={(e) => setImages(e.target.value)}
              rows={4}
              placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Política de Cancelamento
            </label>
            <textarea
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              rows={3}
              placeholder="Cancelamento gratuito até 7 dias antes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : packageToEdit ? 'Atualizar' : 'Criar Pacote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
