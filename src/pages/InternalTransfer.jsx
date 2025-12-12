import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeftRight, Plus, Trash2, Calendar, Clock, MapPin, Package, RefreshCw, History, CheckCircle, AlertCircle, ChevronRight, ArrowRight, Filter, Search, Database } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function InternalTransfer() {
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [time, setTime] = useState(new Date());

  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [remarks, setRemarks] = useState('');

  const [lines, setLines] = useState([
    { tempId: 1, itemId: '', requisitionQty: '' },
  ]);

  const [creating, setCreating] = useState(false);
  const [transfer, setTransfer] = useState(null);
  const [issueState, setIssueState] = useState({});
  const [historyState, setHistoryState] = useState({});
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // load master data
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingMaster(true);
        const [locRes, itemRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/locations`),
          axios.get(`${API_BASE_URL}/items`),
        ]);
        setLocations(locRes.data || []);
        setItems(itemRes.data || []);
      } catch (err) {
        console.error('Failed to load locations/items for transfer', err);
      } finally {
        setLoadingMaster(false);
      }
    };
    load();
  }, []);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { tempId: Date.now(), itemId: '', requisitionQty: '' },
    ]);
  };

  const removeLine = (tempId) => {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((l) => l.tempId !== tempId));
    }
  };

  const updateLine = (tempId, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.tempId === tempId ? { ...l, [field]: value } : l)),
    );
  };

  // POST /api/transfers
  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!fromLocationId || !toLocationId) {
      alert('Select both from and to locations');
      return;
    }
    if (lines.length === 0) {
      alert('Add at least one line');
      return;
    }
    const invalidLine = lines.find(
      (l) => !l.itemId || !l.requisitionQty || Number(l.requisitionQty) <= 0,
    );
    if (invalidLine) {
      alert('Fill item and positive quantity on all lines');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        fromLocationId: Number(fromLocationId),
        toLocationId: Number(toLocationId),
        remarks,
        lines: lines.map((l) => ({
          itemId: Number(l.itemId),
          requisitionQty: Number(l.requisitionQty),
        })),
      };
      const { data } = await axios.post(`${API_BASE_URL}/transfers`, payload);
      setTransfer(data);
      setActiveTab('manage');
    } catch (err) {
      console.error('Failed to create transfer', err);
      alert('Failed to create transfer');
    } finally {
      setCreating(false);
    }
  };

  const initIssueStateIfNeeded = (lineId) => {
    setIssueState((prev) =>
      prev[lineId]
        ? prev
        : {
            ...prev,
            [lineId]: {
              quantity: '',
              fromRFIDTag: '',
              toRFIDTag: '',
              loading: false,
            },
          },
    );
  };

  // POST /api/transfers/{id}/lines/{lineId}/issue
  const handleIssue = async (line) => {
    initIssueStateIfNeeded(line.id);
    const st = issueState[line.id] || {
      quantity: '',
      fromRFIDTag: '',
      toRFIDTag: '',
    };
    if (!st.quantity || Number(st.quantity) <= 0) {
      alert('Enter a positive issue quantity');
      return;
    }
    if (!st.fromRFIDTag || !st.toRFIDTag) {
      alert('Enter from and to RFID tags');
      return;
    }

    setIssueState((prev) => ({
      ...prev,
      [line.id]: { ...st, loading: true },
    }));

    try {
      await axios.post(
        `${API_BASE_URL}/transfers/${transfer.id}/lines/${line.id}/issue`,
        {
          quantity: Number(st.quantity),
          fromRFIDTag: st.fromRFIDTag,
          toRFIDTag: st.toRFIDTag,
        },
      );
      alert('Issue recorded successfully');
      setIssueState((prev) => ({
        ...prev,
        [line.id]: {
          quantity: '',
          fromRFIDTag: '',
          toRFIDTag: '',
          loading: false,
        },
      }));
    } catch (err) {
      console.error('Failed to issue stock', err);
      alert('Failed to issue stock');
      setIssueState((prev) => ({
        ...prev,
        [line.id]: { ...st, loading: false },
      }));
    }
  };

  // GET /api/transfers/{id}/lines/{lineId}/history
  const loadHistory = async (line) => {
    setHistoryState((prev) => ({
      ...prev,
      [line.id]: { loading: true, records: prev[line.id]?.records || [] },
    }));
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/transfers/${transfer.id}/lines/${line.id}/history`,
      );
      setHistoryState((prev) => ({
        ...prev,
        [line.id]: { loading: false, records: data },
      }));
    } catch (err) {
      console.error('Failed to load history', err);
      alert('Failed to load history');
      setHistoryState((prev) => ({
        ...prev,
        [line.id]: { loading: false, records: prev[line.id]?.records || [] },
      }));
    }
  };

  const getLocationLabel = (id) => {
    const loc = locations.find((l) => l.id === id);
    return loc ? `${loc.code} – ${loc.name}` : `Location #${id}`;
  };

  const getItemLabel = (id) => {
    const it = items.find((i) => i.id === id);
    return it ? `${it.code} – ${it.name}` : `Item #${id}`;
  };

  const resetForm = () => {
    setFromLocationId('');
    setToLocationId('');
    setRemarks('');
    setLines([{ tempId: 1, itemId: '', requisitionQty: '' }]);
    setTransfer(null);
    setActiveTab('create');
    setIssueState({});
    setHistoryState({});
  };

  if (loadingMaster) {
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
                INTERNAL TRANSFER
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Move stock between locations with RFID traceability
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

        {/* System Status - Purple bordered box (Transfer specific) */}
        <div className="flex items-center justify-between mb-8">
          <div className="border border-purple-300 bg-purple-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-600"></div>
              <span className="font-bold text-purple-800 tracking-widest text-sm">TRANSFER SYSTEM: OPERATIONAL</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            {items.length} ITEMS • {locations.length} LOCATIONS
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-black/20">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === 'create' 
                ? 'border-b-2 border-black text-black' 
                : 'text-black/60 hover:text-black'
            }`}
          >
            <Plus className="w-4 h-4" />
            CREATE TRANSFER
          </button>
          {transfer && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors ${
                activeTab === 'manage' 
                  ? 'border-b-2 border-black text-black' 
                  : 'text-black/60 hover:text-black'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              MANAGE TRANSFER #{transfer.id}
            </button>
          )}
        </div>
      </div>

      {/* Create Transfer Form */}
      {activeTab === 'create' && !transfer && (
        <div className="border border-black/20 mb-8">
          <div className="border-b border-black/20 p-6 bg-black/2">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">CREATE NEW TRANSFER</h2>
            </div>
          </div>
          
          <form onSubmit={handleCreateTransfer} className="p-6 space-y-8">
            {/* Transfer Basics */}
            <div>
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-black/60 mr-3" />
                <h3 className="text-lg font-bold text-black">TRANSFER LOCATIONS</h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    FROM LOCATION
                  </div>
                  <select
                    value={fromLocationId}
                    onChange={(e) => setFromLocationId(e.target.value)}
                    className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                    required
                  >
                    <option value="">SELECT SOURCE</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} – {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-black/40" />
                </div>
                
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    TO LOCATION
                  </div>
                  <select
                    value={toLocationId}
                    onChange={(e) => setToLocationId(e.target.value)}
                    className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                    required
                  >
                    <option value="">SELECT DESTINATION</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} – {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                  REMARKS / REFERENCE
                </div>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                  placeholder="Reason for transfer, reference number, etc."
                />
              </div>
            </div>
            
            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-black/60 mr-3" />
                  <h3 className="text-lg font-bold text-black">TRANSFER ITEMS</h3>
                </div>
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-2 border border-black/20 px-4 py-2 text-sm font-bold text-black hover:border-black/40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  ADD ITEM
                </button>
              </div>
              
              <div className="border border-black/10">
                <div className="grid grid-cols-12 border-b border-black/10 bg-black/2 p-4">
                  <div className="col-span-8 text-xs font-black text-black/80 tracking-widest uppercase">
                    ITEM DETAILS
                  </div>
                  <div className="col-span-3 text-xs font-black text-black/80 tracking-widest uppercase">
                    QUANTITY
                  </div>
                  <div className="col-span-1 text-xs font-black text-black/80 tracking-widest uppercase">
                    ACTIONS
                  </div>
                </div>
                
                <div className="divide-y divide-black/10">
                  {lines.map((line) => (
                    <div key={line.tempId} className="grid grid-cols-12 p-4 hover:bg-black/2 transition-colors group">
                      <div className="col-span-8">
                        <select
                          value={line.itemId}
                          onChange={(e) => updateLine(line.tempId, 'itemId', e.target.value)}
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
                      </div>
                      
                      <div className="col-span-3 px-2">
                        <input
                          type="number"
                          min="1"
                          value={line.requisitionQty}
                          onChange={(e) => updateLine(line.tempId, 'requisitionQty', e.target.value)}
                          className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                          placeholder="0"
                          required
                        />
                      </div>
                      
                      <div className="col-span-1 flex items-center justify-center">
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(line.tempId)}
                            className="p-2 hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove Item"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {lines.length === 0 && (
                    <div className="p-8 text-center">
                      <Package className="w-12 h-12 mx-auto text-black/20 mb-4" />
                      <p className="text-black/40 font-bold text-sm">NO ITEMS ADDED</p>
                      <p className="text-black/30 text-xs mt-1">Add at least one item to create transfer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-black/20 pt-6">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-black/60">
                  READY TO CREATE TRANSFER
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="group border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      CREATING...
                    </>
                  ) : (
                    <>
                      CREATE TRANSFER
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Manage Transfer */}
      {activeTab === 'manage' && transfer && (
        <div className="space-y-8">
          {/* Transfer Header */}
          <div className="border border-black/20">
            <div className="border-b border-black/20 p-6 bg-black/2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-purple-600 mr-3"></div>
                  <div>
                    <h2 className="text-xl font-black text-black tracking-tight">
                      TRANSFER #{transfer.id}
                    </h2>
                    <div className="text-sm text-black/60 font-medium mt-1">
                      {getLocationLabel(transfer.fromLocationId)} → {getLocationLabel(transfer.toLocationId)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 border border-black/20 px-4 py-2 text-sm font-bold text-black hover:border-black/40 transition-colors"
                >
                  NEW TRANSFER
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {transfer.remarks && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    REMARKS
                  </div>
                  <div className="border border-black/10 p-4 bg-black/2">
                    {transfer.remarks}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="border border-black/10 p-4">
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    FROM LOCATION
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-black text-lg">
                      {getLocationLabel(transfer.fromLocationId)}
                    </span>
                  </div>
                </div>
                
                <div className="border border-black/10 p-4">
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    TO LOCATION
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-black text-lg">
                      {getLocationLabel(transfer.toLocationId)}
                    </span>
                  </div>
                </div>
                
                <div className="border border-black/10 p-4">
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    STATUS
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500"></div>
                    <span className="font-bold text-black text-lg">
                      IN PROGRESS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lines & Issue */}
          <div className="border border-black/20">
            <div className="border-b border-black/20 p-6 bg-black/2">
              <div className="flex items-center">
                <div className="w-2 h-8 bg-black mr-3"></div>
                <h2 className="text-xl font-black text-black tracking-tight">LINE ITEMS & ISSUANCE</h2>
              </div>
            </div>
            
            <div className="divide-y divide-black/10">
              {transfer.lines?.map((line) => {
                const st = issueState[line.id] || {
                  quantity: '',
                  fromRFIDTag: '',
                  toRFIDTag: '',
                  loading: false,
                };
                const hist = historyState[line.id];
                
                return (
                  <div key={line.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-black/60" />
                          <span className="font-bold text-black text-sm">
                            {getItemLabel(line.itemId)}
                          </span>
                        </div>
                        <div className="text-xs text-black/40 font-medium">
                          Line #{line.id} • Requested: {line.requisitionQty} units
                        </div>
                      </div>
                      <div className="text-xs font-bold text-black/60">
                        READY FOR ISSUE
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Issue Form */}
                      <div>
                        <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-3">
                          ISSUE STOCK
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-bold text-black mb-2">Quantity to Transfer</div>
                            <input
                              type="number"
                              min="1"
                              max={line.requisitionQty}
                              value={st.quantity}
                              onChange={(e) =>
                                setIssueState((prev) => ({
                                  ...prev,
                                  [line.id]: {
                                    ...st,
                                    quantity: e.target.value,
                                  },
                                }))
                              }
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                              placeholder="Enter quantity"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-bold text-black mb-2">From RFID Tag</div>
                              <input
                                type="text"
                                value={st.fromRFIDTag}
                                onChange={(e) =>
                                  setIssueState((prev) => ({
                                    ...prev,
                                    [line.id]: {
                                      ...st,
                                      fromRFIDTag: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                                placeholder="Source RFID"
                              />
                            </div>
                            
                            <div>
                              <div className="text-sm font-bold text-black mb-2">To RFID Tag</div>
                              <input
                                type="text"
                                value={st.toRFIDTag}
                                onChange={(e) =>
                                  setIssueState((prev) => ({
                                    ...prev,
                                    [line.id]: {
                                      ...st,
                                      toRFIDTag: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                                placeholder="Destination RFID"
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            disabled={st.loading}
                            onClick={() => handleIssue(line)}
                            className="w-full border border-purple-600 bg-purple-600 text-white px-6 py-3 font-bold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                          >
                            {st.loading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                ISSUING STOCK...
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4" />
                                ISSUE STOCK
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* History */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-bold text-black/80 tracking-widest uppercase">
                            ISSUE HISTORY
                          </div>
                          <button
                            type="button"
                            onClick={() => loadHistory(line)}
                            className="flex items-center gap-1 text-xs font-bold text-black/60 hover:text-black transition-colors"
                          >
                            <History className="w-3 h-3" />
                            LOAD HISTORY
                          </button>
                        </div>
                        
                        <div className="border border-black/10">
                          {hist?.loading ? (
                            <div className="p-8 text-center">
                              <RefreshCw className="w-6 h-6 mx-auto text-black/20 animate-spin mb-2" />
                              <p className="text-sm text-black/40">Loading history...</p>
                            </div>
                          ) : hist?.records && hist.records.length > 0 ? (
                            <div className="divide-y divide-black/5 max-h-64 overflow-y-auto">
                              {hist.records.map((r, idx) => (
                                <div key={idx} className="p-3 hover:bg-black/2 transition-colors">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      <span className="font-bold text-black text-sm">
                                        {r.quantity} units
                                      </span>
                                    </div>
                                    <div className="text-xs text-black/40">
                                      {r.timestamp || r.createdAt}
                                    </div>
                                  </div>
                                  <div className="text-xs text-black/60 font-medium">
                                    {r.fromRFIDTag} → {r.toRFIDTag}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <Database className="w-6 h-6 mx-auto text-black/20 mb-2" />
                              <p className="text-sm text-black/40">No issue history</p>
                              <p className="text-xs text-black/30 mt-1">Issue stock to see history</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {!transfer.lines?.length && (
                <div className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-black/20 mb-4" />
                  <p className="font-bold text-black text-lg mb-2">NO TRANSFER LINES</p>
                  <p className="text-sm text-black/60">
                    No lines returned from backend for this transfer
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">INTERNAL TRANSFER SYSTEM</div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Active transfers: {transfer ? 1 : 0} • Version 3.2.1
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">SYSTEM: ONLINE</span>
            </div>
            <div className="text-xs font-medium text-black/70">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}