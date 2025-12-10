import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, RadioTower } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function RfidTags() {
  const [tags, setTags] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tagCode: '',
    itemId: '',
    active: true,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [tagsRes, itemsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/rfid-tags`),
          axios.get(`${API_BASE_URL}/items`),
        ]);
        setTags(tagsRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error('Failed to load RFID tags or items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredTags = useMemo(() => {
    const q = search.toLowerCase();
    return tags.filter(
      (t) =>
        t.tagCode?.toLowerCase().includes(q) ||
        t.item?.name?.toLowerCase().includes(q) ||
        t.item?.code?.toLowerCase().includes(q),
    );
  }, [tags, search]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      alert('Select an item');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tagCode: formData.tagCode,
        itemId: Number(formData.itemId),
        active: !!formData.active,
      };
      const { data } = await axios.post(`${API_BASE_URL}/rfid-tags`, payload);
      setTags((prev) => [...prev, data]);
      setFormData({ tagCode: '', itemId: '', active: true });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create RFID tag', err);
      alert('Failed to create RFID tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this RFID tag?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/rfid-tags/${id}`);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete tag', err);
      alert('Delete failed');
    }
  };

  const findItemLabel = (tag) => {
    if (tag.item) return `${tag.item.code} – ${tag.item.name}`;
    const it = items.find((i) => i.id === tag.itemId);
    return it ? `${it.code} – ${it.name}` : `Item #${tag.itemId}`;
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
          <RadioTower className="w-8 h-8 text-slate-800" />
          <div>
            <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900">
              RFID Tags
            </h1>
            <p className="text-base text-slate-600">
              Manage RFID tags mapped to items for Gate In, Internal Transfers and Gate Out.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[5px] border border-black/10 bg-black text-white text-sm font-medium hover:bg-slate-800"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[15px]">New RFID Tag</span>
        </button>
      </div>

      {/* Search + table */}
      <SectionCard className="mb-6">
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by tag code or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-black/15 rounded-[5px] text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-[15px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Tag Code
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                  Item
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
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900">
                    {tag.tagCode}
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {findItemLabel(tag)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-[5px] text-xs font-medium border ${
                        tag.active
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                          : 'border-rose-300 text-rose-700 bg-rose-50'
                      }`}
                    >
                      {tag.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="inline-flex items-center justify-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTags.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No RFID tags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Create tag modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-[5px] border border-black/15 shadow-lg w-full max-w-md px-6 py-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-900">
                New RFID Tag
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
                  Tag Code
                </label>
                <input
                  type="text"
                  value={formData.tagCode}
                  onChange={(e) => updateForm('tagCode', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  placeholder="RFID-LAP-001"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Item
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) => updateForm('itemId', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                >
                  <option value="">Select item</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.code} – {it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="tag-active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => updateForm('active', e.target.checked)}
                  className="rounded border-black/30"
                />
                <label
                  htmlFor="tag-active"
                  className="text-sm text-slate-700"
                >
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
                  {saving ? 'Saving...' : 'Save Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
