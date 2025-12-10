import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import axios from 'axios';
import SectionCard from '../components/SectionCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/warehouses`);
      setWarehouses(data || []);
    } catch (err) {
      console.error('Failed to load warehouses');
      setWarehouses([]);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-semibold text-black">Warehouses</h1>
          <p className="text-black/70">Manage warehouse locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-[5px] hover:bg-black/80">
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((warehouse) => (
          <SectionCard key={warehouse.id}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-black mb-1">{warehouse.name}</h3>
                <p className="text-sm text-black/60 mb-2">{warehouse.code}</p>
                <p className="text-xs text-black/50">{warehouse.address}</p>
              </div>
            </div>
          </SectionCard>
        ))}

        {warehouses.length === 0 && (
          <div className="col-span-full text-center py-12 text-black/50">
            No warehouses found
          </div>
        )}
      </div>
    </div>
  );
}
