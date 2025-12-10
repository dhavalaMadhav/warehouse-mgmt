import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2 } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    defaultRate: '',
    defaultVatPercent: '',
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/items`);
        setItems(data);
      } catch (err) {
        console.error('Failed to load items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.name?.toLowerCase().includes(q) ||
        it.code?.toLowerCase().includes(q),
    );
  }, [items, search]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        defaultRate: parseFloat(formData.defaultRate || '0'),
        defaultVatPercent: parseFloat(formData.defaultVatPercent || '0'),
      };
      const { data } = await axios.post(`${API_BASE_URL}/items`, payload);
      setItems((prev) => [...prev, data]);
      setFormData({
        code: '',
        name: '',
        defaultRate: '',
        defaultVatPercent: '',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create item', err);
      alert('Failed to create item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/items/${id}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error('Failed to delete item', err);
      alert('Delete failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="h-12 w-12 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-slate-800" />
          <div>
            <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900">
              Items
            </h1>
            <p className="text-base text-slate-600">
              Master data of all SKUs used across warehouse operations.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] border border-black/10 bg-black text-white text-sm font-medium hover:bg-slate-800"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[15px]">New Item</span>
        </button>
      </div>

      <SectionCard>
        {/* Search bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:max-w-sm border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/40"
          />
          <span className="text-sm text-slate-500">
            {filteredItems.length} items
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-[15px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Code
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Name
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Default Rate
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                  VAT %
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">{item.code}</td>
                  <td className="px-4 py-3 text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    {item.defaultRate?.toFixed
                      ? item.defaultRate.toFixed(2)
                      : item.defaultRate}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-900">
                    {item.defaultVatPercent}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No items found. Try adjusting your search or create a new
                    item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Create Item Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-[5px] border border-black/15 shadow-lg w-full max-w-md px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">
                New Item
              </h2>
              <button
                onClick={() => !saving && setShowForm(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => updateForm('code', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/40"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/40"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Default Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.defaultRate}
                    onChange={(e) =>
                      updateForm('defaultRate', e.target.value)
                    }
                    className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    VAT %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.defaultVatPercent}
                    onChange={(e) =>
                      updateForm('defaultVatPercent', e.target.value)
                    }
                    className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/40"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !saving && setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-[5px] border border-black/10 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm rounded-[5px] bg-black text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
