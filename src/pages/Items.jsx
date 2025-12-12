import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Clock, Filter, ChevronRight, Package, Barcode, Tag, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Items() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [time, setTime] = useState(new Date());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
  ).filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return item.active !== false;
    if (filter === 'inactive') return item.active === false;
    return true;
  });

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
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          {/* Box Border Loading Animation */}
          <div className="h-24 w-24">
            {/* Static outer box */}
            <div className="absolute inset-0 border-2 border-black/10"></div>
            {/* Rotating border box */}
            <div className="absolute inset-0 border-2 border-transparent border-t-black border-r-black animate-spin"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-black tracking-widest text-sm">
            LOADING
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                ITEM MASTER
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Manage inventory item master data
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center gap-3 mb-1">
                <Calendar className="w-5 h-5 text-black/70" />
                <span className="font-bold text-black text-lg">
                  {time.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  }).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-black/70" />
                <span className="font-bold text-black text-lg">
                  {time.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status - Green bordered box */}
        <div className="flex items-center justify-between mb-8">
          <div className="border border-emerald-300 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-600"></div>
              <span className="font-bold text-emerald-800 tracking-widest text-sm">MASTER DATA: ACTIVE</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            {items.length} ITEMS LOADED
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">ITEM CATALOG</h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="group border border-black bg-black text-white px-4 md:px-6 py-3 hover:bg-black/90 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide">ADD ITEM</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="border border-black/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-black/60" />
                <span className="text-sm font-bold text-black/80 tracking-wide">SEARCH ITEMS</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code, name, or description..."
                  className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-black/50">
                  {filteredItems.length} / {items.length}
                </div>
              </div>
            </div>

            {/* Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-black/60" />
                <span className="text-sm font-bold text-black/80 tracking-wide">FILTER STATUS</span>
              </div>
              <div className="flex border border-black/20">
                {[
                  { key: 'all', label: 'ALL ITEMS', count: items.length },
                  { key: 'active', label: 'ACTIVE', count: items.filter(i => i.active !== false).length },
                  { key: 'inactive', label: 'INACTIVE', count: items.filter(i => i.active === false).length },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${
                      filter === f.key 
                        ? 'bg-black text-white' 
                        : 'bg-white text-black hover:bg-black/5'
                    }`}
                  >
                    <div>{f.label}</div>
                    <div className="text-xs opacity-70">{f.count}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-black/20">
        {/* Table Header */}
        <div className="border-b border-black/20 bg-black/2">
          <div className="grid grid-cols-12 p-4">
            <div className="col-span-3 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Barcode className="w-3 h-3" />
                ITEM CODE
              </div>
            </div>
            <div className="col-span-4 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                ITEM NAME
              </div>
            </div>
            <div className="col-span-3 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Tag className="w-3 h-3" />
                CATEGORY
              </div>
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                STATUS
              </div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {filteredItems.map((item) => (
            <div key={item.id} className="group border-b border-black/10 hover:bg-black/2 transition-colors">
              <div className="grid grid-cols-12 p-4">
                {/* Item Code */}
                <div className="col-span-3">
                  <div className="font-bold text-black text-sm tracking-wide">
                    {item.code}
                  </div>
                  <div className="text-xs text-black/50 font-medium">
                    SKU: {item.sku || 'N/A'}
                  </div>
                </div>

                {/* Item Name */}
                <div className="col-span-4">
                  <div className="font-bold text-black text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs text-black/50 font-medium truncate max-w-[300px]">
                    {item.description || 'No description'}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-black text-sm">
                      {item.category || 'Uncategorized'}
                    </div>
                    {item.subCategory && (
                      <div className="text-xs text-black/40">
                        • {item.subCategory}
                      </div>
                    )}
                  </div>
                  {item.unit && (
                    <div className="text-xs text-black/40 font-medium">
                      Unit: {item.unit}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold ${
                      item.active === false 
                        ? 'bg-black/10 text-black/60' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.active === false ? 'INACTIVE' : 'ACTIVE'}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowModal(true);
                        }}
                        className="p-1 hover:bg-black/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-black/70" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 hover:bg-black/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/40 font-bold text-lg mb-2">NO ITEMS FOUND</p>
              <p className="text-black/50 text-sm">
                {search ? 'Try a different search term' : 'Add your first item to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Summary Cards */}
          {[
            { icon: Package, label: 'TOTAL ITEMS', value: items.length, color: 'black' },
            { icon: Tag, label: 'CATEGORIES', value: new Set(items.map(i => i.category)).size, color: 'blue' },
            { icon: AlertCircle, label: 'ACTIVE ITEMS', value: items.filter(i => i.active !== false).length, color: 'emerald' },
            { icon: Filter, label: 'SEARCH RESULTS', value: filteredItems.length, color: 'amber' },
          ].map((stat, idx) => (
            <div key={idx} className="border border-black/20 p-4 hover:border-black/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                <div className={`text-xs font-bold ${
                  idx === 0 ? 'bg-black/10 text-black' :
                  idx === 1 ? 'bg-blue-100 text-blue-700' :
                  idx === 2 ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                } px-2 py-1`}>
                  LIVE
                </div>
              </div>
              <div className="text-2xl font-black text-black tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-black/80 tracking-widest uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-black/20 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="text-sm font-bold text-black tracking-widest">ITEM MANAGEMENT SYSTEM</div>
              <div className="text-xs text-black/70 font-medium mt-1">
                Last sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                Version 3.2.1
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600"></div>
                <span className="text-xs font-bold text-black">SYSTEM: ONLINE</span>
              </div>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1 text-xs font-bold text-black/70 hover:text-black transition-colors group"
              >
                EXPORT DATA
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal (Placeholder) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black/20 max-w-2xl w-full">
            <div className="border-b border-black/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-black mr-3"></div>
                  <h3 className="text-xl font-black text-black tracking-tight">
                    {editingItem ? 'EDIT ITEM' : 'ADD NEW ITEM'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-black/20 mb-4" />
                <p className="text-black/40 font-bold">ITEM FORM</p>
                <p className="text-black/50 text-sm mt-2">Connect backend to enable item creation/editing</p>
              </div>
            </div>
            
            <div className="border-t border-black/20 p-6">
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="border border-black/20 px-6 py-3 text-black font-bold hover:border-black/30 transition-colors"
                >
                  CANCEL
                </button>
                <button 
                  onClick={() => {
                    // Handle save
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors"
                >
                  {editingItem ? 'UPDATE ITEM' : 'CREATE ITEM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}