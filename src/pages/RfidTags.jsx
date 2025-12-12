import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, RadioTower, Calendar, Clock, Tag, Activity, AlertCircle, ChevronRight, Package, Filter, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function RfidTags() {
  const [tags, setTags] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [time, setTime] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    tagCode: '',
    itemId: '',
    active: true,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [tagsRes, itemsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/rfid-tags`),
          axios.get(`${API_BASE_URL}/items`),
        ]);
        setTags(tagsRes.data || []);
        setItems(itemsRes.data || []);
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
    const filtered = tags.filter(
      (t) =>
        t.tagCode?.toLowerCase().includes(q) ||
        t.item?.name?.toLowerCase().includes(q) ||
        t.item?.code?.toLowerCase().includes(q),
    );
    
    if (filter === 'active') return filtered.filter(t => t.active !== false);
    if (filter === 'inactive') return filtered.filter(t => t.active === false);
    return filtered;
  }, [tags, search, filter]);

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

  const getTagStatus = (tag) => {
    if (!tag.active) return { label: 'INACTIVE', color: 'rose', icon: XCircle };
    if (tag.lastScanned) {
      const lastScan = new Date(tag.lastScanned);
      const hoursAgo = (new Date() - lastScan) / (1000 * 60 * 60);
      if (hoursAgo > 24) return { label: 'IDLE', color: 'amber', icon: AlertCircle };
      return { label: 'ACTIVE', color: 'emerald', icon: CheckCircle };
    }
    return { label: 'NEW', color: 'blue', icon: Tag };
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
                RFID TAG MANAGEMENT
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Manage RFID tags for inventory tracking and automation
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
              <span className="font-bold text-emerald-800 tracking-widest text-sm">RFID SYSTEM: OPERATIONAL</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            {tags.length} TAGS REGISTERED
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">TAG REGISTRY</h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="group border border-black bg-black text-white px-4 md:px-6 py-3 hover:bg-black/90 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide">NEW RFID TAG</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="border border-black/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-black/60" />
                <span className="text-sm font-bold text-black/80 tracking-wide">SEARCH TAGS</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by tag code, item code, or item name..."
                  className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-black/50">
                  {filteredTags.length} / {tags.length}
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
                  { key: 'all', label: 'ALL TAGS', count: tags.length },
                  { key: 'active', label: 'ACTIVE', count: tags.filter(t => t.active !== false).length, color: 'emerald' },
                  { key: 'inactive', label: 'INACTIVE', count: tags.filter(t => t.active === false).length, color: 'rose' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${
                      filter === f.key 
                        ? (f.color ? `bg-${f.color}-100 text-${f.color}-700 border-${f.color}-300` : 'bg-black text-white') 
                        : 'bg-white text-black hover:bg-black/5'
                    }`}
                  >
                    <div>{f.label}</div>
                    <div className="text-xs opacity-70">({f.count})</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: RadioTower, label: 'TOTAL TAGS', value: tags.length, color: 'black' },
            { icon: Activity, label: 'ACTIVE TAGS', value: tags.filter(t => t.active !== false).length, color: 'emerald' },
            { icon: Package, label: 'TAGGED ITEMS', value: new Set(tags.filter(t => t.itemId).map(t => t.itemId)).size, color: 'blue' },
            { icon: AlertCircle, label: 'IDLE TAGS', value: tags.filter(t => {
              if (!t.lastScanned) return false;
              const hoursAgo = (new Date() - new Date(t.lastScanned)) / (1000 * 60 * 60);
              return hoursAgo > 24;
            }).length, color: 'amber' },
          ].map((stat, idx) => (
            <div key={idx} className="border border-black/20 p-4 hover:border-black/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                <div className={`text-xs font-bold px-2 py-1 ${
                  idx === 0 ? 'bg-black/10 text-black' :
                  idx === 1 ? 'bg-emerald-100 text-emerald-700' :
                  idx === 2 ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
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
      </div>

      {/* Tags Table */}
      <div className="border border-black/20 mb-6">
        {/* Table Header */}
        <div className="border-b border-black/20 bg-black/2">
          <div className="grid grid-cols-12 p-4">
            <div className="col-span-3 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <RadioTower className="w-3 h-3" />
                TAG CODE
              </div>
            </div>
            <div className="col-span-5 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                ASSIGNED ITEM
              </div>
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                STATUS
              </div>
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              ACTIONS
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {filteredTags.map((tag) => {
            const status = getTagStatus(tag);
            const Icon = status.icon;
            
            return (
              <div key={tag.id} className="group border-b border-black/10 hover:bg-black/2 transition-colors">
                <div className="grid grid-cols-12 p-4">
                  {/* Tag Code */}
                  <div className="col-span-3">
                    <div className="font-bold text-black text-sm tracking-wide">
                      {tag.tagCode}
                    </div>
                    <div className="text-xs text-black/50 font-medium">
                      ID: {tag.id}
                    </div>
                  </div>

                  {/* Assigned Item */}
                  <div className="col-span-5">
                    <div className="font-bold text-black text-sm">
                      {findItemLabel(tag)}
                    </div>
                    <div className="text-xs text-black/50 font-medium truncate max-w-[300px]">
                      Item ID: {tag.itemId}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-${status.color}-100 text-${status.color}-700`}>
                        <Icon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>
                    {tag.lastScanned && (
                      <div className="text-xs text-black/40 font-medium mt-1">
                        Scanned: {new Date(tag.lastScanned).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-1 hover:bg-black/10 transition-colors group/delete"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600 group-hover/delete:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => {
                          setFormData({
                            tagCode: tag.tagCode,
                            itemId: tag.itemId,
                            active: tag.active,
                          });
                          setShowForm(true);
                        }}
                        className="p-1 hover:bg-black/10 transition-colors"
                        title="Edit Tag"
                      >
                        <Tag className="w-4 h-4 text-black/70" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTags.length === 0 && (
            <div className="p-12 text-center">
              <RadioTower className="w-16 h-16 mx-auto text-black/20 mb-4" />
              <h3 className="font-black text-black text-lg tracking-tight mb-2">NO RFID TAGS FOUND</h3>
              <p className="text-sm text-black/60 mb-4">
                {search || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Register your first RFID tag to start tracking inventory'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors"
              >
                REGISTER FIRST TAG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">RFID MANAGEMENT SYSTEM</div>
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
            <button className="flex items-center gap-1 text-xs font-bold text-black/70 hover:text-black transition-colors group">
              EXPORT TAG DATA
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Tag Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black/20 max-w-lg w-full">
            <div className="border-b border-black/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-black mr-3"></div>
                  <h3 className="text-xl font-black text-black tracking-tight">
                    {formData.tagCode ? 'EDIT RFID TAG' : 'REGISTER NEW RFID TAG'}
                  </h3>
                </div>
                <button 
                  onClick={() => !saving && setShowForm(false)}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Tag Code */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <RadioTower className="w-4 h-4 text-black/60" />
                    <label className="text-sm font-bold text-black/80 tracking-wide">
                      TAG IDENTIFIER
                    </label>
                  </div>
                  <input
                    type="text"
                    value={formData.tagCode}
                    onChange={(e) => updateForm('tagCode', e.target.value)}
                    className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                    placeholder="RFID-LAP-001"
                    required
                  />
                  <div className="text-xs text-black/50 font-medium mt-1">
                    Unique identifier for the RFID tag
                  </div>
                </div>

                {/* Item Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-black/60" />
                    <label className="text-sm font-bold text-black/80 tracking-wide">
                      ASSIGN TO ITEM
                    </label>
                  </div>
                  <select
                    value={formData.itemId}
                    onChange={(e) => updateForm('itemId', e.target.value)}
                    className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                    required
                  >
                    <option value="">SELECT ITEM</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.code} – {it.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-black/50 font-medium mt-1">
                    Choose the item this tag will track
                  </div>
                </div>

                {/* Active Status */}
                <div className="border border-black/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-black/60" />
                    <label className="text-sm font-bold text-black/80 tracking-wide">
                      TAG STATUS
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="tag-active"
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => updateForm('active', e.target.checked)}
                      className="border border-black/20 w-5 h-5"
                    />
                    <label
                      htmlFor="tag-active"
                      className="text-sm text-black/80 font-medium"
                    >
                      Mark tag as active for scanning
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/20 mt-6 pt-6">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => !saving && setShowForm(false)}
                    className="border border-black/20 px-6 py-3 text-black font-bold hover:border-black/30 transition-colors"
                    disabled={saving}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors disabled:opacity-60"
                  >
                    {saving ? 'PROCESSING...' : (formData.tagCode ? 'UPDATE TAG' : 'REGISTER TAG')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}