import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Clock, Filter, ChevronRight, Package, Barcode, Tag, AlertCircle, X } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    sku: '',
    unit: '',
    subCategory: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      console.error('Failed to load items', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.code?.toLowerCase().includes(search.toLowerCase()) ||
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  ).filter(item => {
    if (filter === 'all') return true;
    if (filter === 'active') return item.active !== false;
    if (filter === 'inactive') return item.active === false;
    return true;
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this item? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/items/${id}`);
      setItems(items.filter(item => item.id !== id));
      alert('Item deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      // Editing existing item
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        category: item.category || '',
        sku: item.sku || '',
        unit: item.unit || '',
        subCategory: item.subCategory || '',
        active: item.active !== false
      });
    } else {
      // Creating new item
      setEditingItem(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        category: '',
        sku: '',
        unit: '',
        subCategory: '',
        active: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: '',
      sku: '',
      unit: '',
      subCategory: '',
      active: true
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Item name is required';
    }
    
    if (!formData.code?.trim()) {
      errors.code = 'Item code is required';
    }
    
    if (!formData.category?.trim()) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingItem) {
        // Update existing item
        const { data } = await axios.put(`${API_BASE_URL}/items/${editingItem.id}`, formData);
        setItems(items.map(item => item.id === editingItem.id ? data : item));
        alert('Item updated successfully');
      } else {
        // Create new item
        const { data } = await axios.post(`${API_BASE_URL}/items`, formData);
        setItems([...items, data]);
        alert('Item created successfully');
      }
      closeModal();
      loadItems(); // Reload to get fresh data
    } catch (err) {
      console.error('Submit failed:', err);
      alert(editingItem ? 'Failed to update item' : 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="h-24 w-24">
            <div className="absolute inset-0 border-2 border-black/10"></div>
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

        {/* System Status */}
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
            onClick={() => openModal()}
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
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase text-right">
              ACTIONS
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
                  <div className="flex items-center justify-end gap-2">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold ${
                      item.active === false 
                        ? 'bg-black/10 text-black/60' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.active === false ? 'INACTIVE' : 'ACTIVE'}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 hover:bg-black/10 transition-colors border border-transparent hover:border-black/20"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-black/70" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
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
              {!search && items.length === 0 && (
                <button
                  onClick={() => openModal()}
                  className="mt-4 border border-black bg-black text-white px-6 py-2 text-sm font-bold hover:bg-black/90 transition-colors"
                >
                  ADD FIRST ITEM
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Package, label: 'TOTAL ITEMS', value: items.length, color: 'black' },
            { icon: Tag, label: 'CATEGORIES', value: new Set(items.map(i => i.category).filter(Boolean)).size, color: 'blue' },
            { icon: AlertCircle, label: 'ACTIVE ITEMS', value: items.filter(i => i.active !== false).length, color: 'emerald' },
            { icon: Filter, label: 'SEARCH RESULTS', value: filteredItems.length, color: 'amber' },
          ].map((stat, idx) => (
            <div key={idx} className="border border-black/20 p-4 hover:border-black/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${
                  idx === 0 ? 'text-black' :
                  idx === 1 ? 'text-blue-600' :
                  idx === 2 ? 'text-emerald-600' :
                  'text-amber-600'
                }`} />
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
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-black/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-black mr-3"></div>
                  <h3 className="text-xl font-black text-black tracking-tight">
                    {editingItem ? 'EDIT ITEM' : 'ADD NEW ITEM'}
                  </h3>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                    ITEM NAME *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full border ${formErrors.name ? 'border-rose-500' : 'border-black/20'} p-3 focus:outline-none focus:border-black/40 transition-colors`}
                    placeholder="Enter item name"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.name}</p>
                  )}
                </div>

                {/* Item Code */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                    ITEM CODE *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className={`w-full border ${formErrors.code ? 'border-rose-500' : 'border-black/20'} p-3 focus:outline-none focus:border-black/40 transition-colors`}
                    placeholder="e.g., ITEM-001"
                  />
                  {formErrors.code && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.code}</p>
                  )}
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                      CATEGORY *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full border ${formErrors.category ? 'border-rose-500' : 'border-black/20'} p-3 focus:outline-none focus:border-black/40 transition-colors`}
                      placeholder="e.g., Electronics"
                    />
                    {formErrors.category && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{formErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                      placeholder="Stock keeping unit"
                    />
                  </div>
                </div>

                {/* Sub-Category & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                      SUB-CATEGORY
                    </label>
                    <input
                      type="text"
                      value={formData.subCategory}
                      onChange={(e) => handleInputChange('subCategory', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                      UNIT
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                      placeholder="e.g., PCS, KG, BOX"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 tracking-wide">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors resize-none"
                    placeholder="Optional item description"
                  />
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      className="w-5 h-5 border-2 border-black/20"
                    />
                    <span className="text-sm font-bold text-black tracking-wide">
                      ITEM IS ACTIVE
                    </span>
                  </label>
                  <p className="text-xs text-black/50 mt-1 ml-8">
                    Inactive items won't appear in operational screens
                  </p>
                </div>
              </div>
            </form>
            
            <div className="border-t border-black/20 p-6">
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="border border-black/20 px-6 py-3 text-black font-bold hover:border-black/30 transition-colors disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {editingItem ? 'UPDATING...' : 'CREATING...'}
                    </>
                  ) : (
                    <>{editingItem ? 'UPDATE ITEM' : 'CREATE ITEM'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
