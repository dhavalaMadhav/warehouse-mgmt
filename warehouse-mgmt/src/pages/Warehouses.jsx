import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit3, Trash2, Warehouse } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    active: true,
  });

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/warehouses`);
        setWarehouses(data);
      } catch (err) {
        console.error('Failed to load warehouses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        active: !!formData.active,
      };
      const { data } = await axios.post(`${API_BASE_URL}/warehouses`, payload);
      setWarehouses((prev) => [...prev, data]);
      setFormData({ name: '', address: '', active: true });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create warehouse', err);
      alert('Failed to create warehouse');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this warehouse?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/warehouses/${id}`);
      setWarehouses((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Warehouse className="w-8 h-8 text-slate-800" />
          <div>
            <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900">
              Warehouses
            </h1>
            <p className="text-base text-slate-600">
              Master list of warehouses used for locations and inter‑warehouse transfers.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] border border-black/10 bg-black text-white text-sm font-medium hover:bg-slate-800"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[15px]">New Warehouse</span>
        </button>
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-[15px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Address
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {warehouses.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                    {w.name}
                  </td>
                  <td className="px-4 py-3 text-slate-800">{w.address}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-[5px] text-xs font-medium border ${
                        w.active
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                          : 'border-rose-300 text-rose-700 bg-rose-50'
                      }`}
                    >
                      {w.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-1.5 rounded-[5px] text-slate-600 hover:bg-slate-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-[5px] text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No warehouses found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Create / edit warehouse modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-[5px] border border-black/15 shadow-lg w-full max-w-md px-6 py-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-900">
                New Warehouse
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
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="wh-active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => updateForm('active', e.target.checked)}
                  className="rounded border-black/30"
                />
                <label htmlFor="wh-active" className="text-sm text-slate-700">
                  Active
                </label>
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
                  {saving ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
