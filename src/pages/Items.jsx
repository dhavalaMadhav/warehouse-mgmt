import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import SectionCard from '../components/SectionCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Items() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/items`);
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.code?.toLowerCase().includes(search.toLowerCase()) ||
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/items/${id}`);
      loadItems();
    } catch (err) {
      alert('Failed to delete item');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-black">Items</h1>
          <p className="text-black/70">Manage item master data</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-[5px] hover:bg-black/80"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <SectionCard>
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border border-black/20 rounded-[5px] focus:outline-none focus:ring-2 focus:ring-black/30"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-black/70 uppercase tracking-wide">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black/70 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-black/70 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-black/70 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-black font-medium">{item.code}</td>
                  <td className="px-4 py-3 text-black">{item.name}</td>
                  <td className="px-4 py-3 text-black/70">{item.category}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-black/50">
              No items found
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
