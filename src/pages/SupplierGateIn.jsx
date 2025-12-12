import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ChevronRight, Truck, Calendar, Clock, MapPin, Package, Users, FileText, RadioTower, Building, AlertCircle, ArrowRight, ArrowLeft, Save, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

const initialForm = {
  vehicleNo: '',
  gateKeeperId: '',
  storeKeeperId: '',
  supplierName: '',
  supplierAddress: '',
  remarks: '',
  itemId: '',
  qty: '',
  toLocationId: '',
};

export default function SupplierGateIn() {
  const [step, setStep] = useState(1);
  const [masterData, setMasterData] = useState({
    items: [],
    locations: [],
    gateKeepers: [],
    storeKeepers: [],
  });
  const [form, setForm] = useState(initialForm);
  const [gateInId, setGateInId] = useState(null);
  const [lineId, setLineId] = useState(null);
  const [rfidInput, setRfidInput] = useState('');
  const [attachedTags, setAttachedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [time, setTime] = useState(new Date());
  const [lines, setLines] = useState([{ itemId: '', qty: '', toLocationId: '' }]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // load dropdown data
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [itemsRes, locRes, gkRes, skRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/items`),
          axios.get(`${API_BASE_URL}/locations`),
          axios.get(`${API_BASE_URL}/gate-keepers`),
          axios.get(`${API_BASE_URL}/store-keepers`),
        ]);
        setMasterData({
          items: itemsRes.data || [],
          locations: locRes.data || [],
          gateKeepers: gkRes.data || [],
          storeKeepers: skRes.data || [],
        });
      } catch (err) {
        console.error('Failed to load master data for Gate In', err);
      }
    };
    loadMaster();
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { itemId: '', qty: '', toLocationId: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index);
      setLines(newLines);
    }
  };

  // STEP 1: create Gate In
  const handleCreateGateIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        vehicleNo: form.vehicleNo,
        gateKeeperId: Number(form.gateKeeperId),
        storeKeeperId: Number(form.storeKeeperId),
        supplierName: form.supplierName,
        supplierAddress: form.supplierAddress,
        remarks: form.remarks,
        lines: lines.map(line => ({
          itemId: Number(line.itemId),
          qty: Number(line.qty),
          toLocationId: Number(line.toLocationId),
        })),
      };
      const { data } = await axios.post(`${API_BASE_URL}/gate-in`, payload);
      setGateInId(data.id || data.gateInId || 1);
      const firstLine = (data.lines && data.lines[0]) || { id: 1 };
      setLineId(firstLine.id);
      setStep(2);
    } catch (err) {
      console.error('Failed to create Gate In', err);
      alert('Failed to create Gate In');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 2: attach RFID tags
  const handleAddTagLocal = () => {
    const trimmed = rfidInput.trim();
    if (!trimmed) return;
    if (!attachedTags.includes(trimmed)) {
      setAttachedTags((prev) => [...prev, trimmed]);
    }
    setRfidInput('');
  };

  const handleAttachTagsApi = async () => {
    if (!gateInId || attachedTags.length === 0) {
      alert('No tags to attach');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/gate-in/${gateInId}/attach-rfid`, {
        rfidTags: attachedTags,
      });
      setStep(3);
    } catch (err) {
      console.error('Failed to attach RFID tags', err);
      alert('Failed to attach RFID tags');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 3: assign location
  const handleAssignLocation = async () => {
    if (!gateInId || !lineId || !form.toLocationId) {
      setStep(4);
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/gate-in/${gateInId}/assign-location`, {
        lineId: Number(lineId),
        toLocationId: Number(form.toLocationId),
      });
      setStep(4);
    } catch (err) {
      console.error('Failed to assign location', err);
      alert('Failed to assign location');
      setSubmitting(false);
    }
  };

  const handleConfirmGateIn = async () => {
    if (!gateInId) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/gate-in/${gateInId}/confirm`);
      setStep(5);
    } catch (err) {
      console.error('Failed to confirm Gate In', err);
      alert('Failed to confirm Gate In');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setForm(initialForm);
    setGateInId(null);
    setLineId(null);
    setAttachedTags([]);
    setRfidInput('');
    setLines([{ itemId: '', qty: '', toLocationId: '' }]);
    setStep(1);
  };

  const { items, locations, gateKeepers, storeKeepers } = masterData;

  const getStepIcon = (stepNumber) => {
    const icons = [Truck, RadioTower, MapPin, CheckCircle2, CheckCircle2];
    return icons[stepNumber - 1] || Truck;
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                SUPPLIER GATE IN
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Record inbound vehicles, attach RFID tags, and confirm receipt
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

        {/* System Status - Blue bordered box (Inbound specific) */}
        <div className="flex items-center justify-between mb-8">
          <div className="border border-blue-300 bg-blue-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-600"></div>
              <span className="font-bold text-blue-800 tracking-widest text-sm">INBOUND SYSTEM: OPERATIONAL</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            {lines.length} LINE{lines.length !== 1 ? 'S' : ''} • {attachedTags.length} RFID TAG{attachedTags.length !== 1 ? 'S' : ''}
          </div>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-black mr-3"></div>
          <h2 className="text-2xl font-black text-black tracking-tight">PROCESS STEPS</h2>
        </div>
        
        <div className="border border-black/20 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => {
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              const StepIcon = getStepIcon(stepNum);
              const stepLabels = [
                'GATE IN DETAILS',
                'RFID TAGGING',
                'LOCATION ASSIGNMENT',
                'CONFIRMATION',
                'COMPLETED'
              ];
              
              return (
                <div key={stepNum} className="flex flex-col items-center mb-4 md:mb-0">
                  <div className={`flex items-center justify-center w-12 h-12 border-2 ${
                    isCompleted 
                      ? 'border-emerald-600 bg-emerald-600 text-white' 
                      : isActive
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 text-black/40'
                  } mb-3`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className={`text-xs font-bold tracking-widest ${
                    isActive || isCompleted ? 'text-black' : 'text-black/40'
                  }`}>
                    STEP {stepNum}
                  </div>
                  <div className={`text-xs font-bold mt-1 ${
                    isActive || isCompleted ? 'text-black/80' : 'text-black/40'
                  }`}>
                    {stepLabels[stepNum - 1]}
                  </div>
                  
                  {stepNum < 5 && (
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 mt-8">
                      <ChevronRight className={`w-4 h-4 ${
                        step > stepNum ? 'text-emerald-600' : 'text-black/20'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-black/10">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-black/60">
                CURRENT STATUS: {step === 5 ? 'COMPLETED' : 'IN PROGRESS'}
              </div>
              <div className="text-sm font-bold text-black">
                {step === 1 && 'ENTER DETAILS'}
                {step === 2 && 'ATTACH RFID TAGS'}
                {step === 3 && 'ASSIGN LOCATIONS'}
                {step === 4 && 'FINAL CONFIRMATION'}
                {step === 5 && 'PROCESS COMPLETE'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border border-black/20 mb-8">
        {/* STEP 1: details + line */}
        {step === 1 && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">GATE IN DETAILS</h2>
            </div>
            
            <form onSubmit={handleCreateGateIn} className="space-y-8">
              {/* Basic Information */}
              <div className="border-b border-black/10 pb-6">
                <div className="flex items-center mb-4">
                  <Truck className="w-5 h-5 text-black/60 mr-3" />
                  <h3 className="text-lg font-bold text-black">VEHICLE & SUPPLIER INFORMATION</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      VEHICLE NUMBER
                    </div>
                    <input
                      type="text"
                      value={form.vehicleNo}
                      onChange={(e) => updateForm('vehicleNo', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                      placeholder="MH12AB1234"
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      GATE KEEPER
                    </div>
                    <select
                      value={form.gateKeeperId}
                      onChange={(e) => updateForm('gateKeeperId', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                      required
                    >
                      <option value="">SELECT GATE KEEPER</option>
                      {gateKeepers.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} • {g.employeeCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      STORE KEEPER
                    </div>
                    <select
                      value={form.storeKeeperId}
                      onChange={(e) => updateForm('storeKeeperId', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                      required
                    >
                      <option value="">SELECT STORE KEEPER</option>
                      {storeKeepers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} • {s.employeeCode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      SUPPLIER NAME
                    </div>
                    <input
                      type="text"
                      value={form.supplierName}
                      onChange={(e) => updateForm('supplierName', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                      placeholder="Supplier Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      SUPPLIER ADDRESS
                    </div>
                    <input
                      type="text"
                      value={form.supplierAddress}
                      onChange={(e) => updateForm('supplierAddress', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                      placeholder="Complete Address"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    REMARKS / PO NUMBER
                  </div>
                  <input
                    type="text"
                    value={form.remarks}
                    onChange={(e) => updateForm('remarks', e.target.value)}
                    className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                    placeholder="Purchase Order Number or Additional Notes"
                  />
                </div>
              </div>
              
              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-black/60 mr-3" />
                    <h3 className="text-lg font-bold text-black">LINE ITEMS</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-2 border border-black/20 px-3 py-2 text-sm font-bold text-black hover:border-black/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    ADD ITEM
                  </button>
                </div>
                
                <div className="space-y-4">
                  {lines.map((line, index) => (
                    <div key={index} className="border border-black/10 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-bold text-black">
                          ITEM #{index + 1}
                        </div>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                          >
                            REMOVE
                          </button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                            ITEM
                          </div>
                          <select
                            value={line.itemId}
                            onChange={(e) => updateLine(index, 'itemId', e.target.value)}
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
                        
                        <div>
                          <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                            QUANTITY
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={line.qty}
                            onChange={(e) => updateLine(index, 'qty', e.target.value)}
                            className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                            placeholder="0"
                            required
                          />
                        </div>
                        
                        <div>
                          <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                            PUT-AWAY LOCATION
                          </div>
                          <select
                            value={line.toLocationId}
                            onChange={(e) => updateLine(index, 'toLocationId', e.target.value)}
                            className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                            required
                          >
                            <option value="">SELECT LOCATION</option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.code} – {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-black/20 pt-6">
                <div className="flex justify-between">
                  <div className="text-sm font-medium text-black/60">
                    READY TO PROCEED
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {submitting ? (
                      'PROCESSING...'
                    ) : (
                      <>
                        CREATE GATE IN
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: RFID tags */}
        {step === 2 && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">RFID TAGGING</h2>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-black">GATE IN #{gateInId}</div>
                  <div className="text-xs text-black/60 font-medium">PROCESSING RFID TAGS</div>
                </div>
                <div className="text-xs font-bold text-black bg-black/10 px-3 py-1">
                  {attachedTags.length} TAGS ATTACHED
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                  SCAN RFID TAG
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), handleAddTagLocal())
                    }
                    placeholder="Scan RFID tag or enter manually"
                    className="flex-1 border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddTagLocal}
                    className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors"
                  >
                    ADD TAG
                  </button>
                </div>
                <div className="text-xs text-black/50 font-medium mt-2">
                  Press Enter to add tag automatically
                </div>
              </div>
              
              <div>
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                  ATTACHED TAGS
                </div>
                <div className="border border-black/10 p-4 min-h-[120px]">
                  {attachedTags.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {attachedTags.map((tag, index) => (
                        <div key={index} className="border border-black/10 p-3 flex items-center justify-between group hover:border-black/20 transition-colors">
                          <div className="flex items-center gap-2">
                            <RadioTower className="w-4 h-4 text-blue-600" />
                            <span className="font-mono text-sm font-bold text-black">{tag}</span>
                          </div>
                          <div className="text-xs font-bold text-emerald-600">
                            READY
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-24">
                      <RadioTower className="w-8 h-8 text-black/20 mb-2" />
                      <p className="text-sm text-black/40 font-medium">No tags added yet</p>
                      <p className="text-xs text-black/30">Start scanning to attach RFID tags</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-black/20 pt-6">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 border border-black/20 px-6 py-3 font-bold text-black hover:border-black/40 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO DETAILS
                  </button>
                  <button
                    type="button"
                    disabled={submitting || attachedTags.length === 0}
                    onClick={handleAttachTagsApi}
                    className="group border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      'SAVING TAGS...'
                    ) : (
                      <>
                        ATTACH TAGS & CONTINUE
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: assign + confirm */}
        {step === 3 && (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">LOCATION ASSIGNMENT</h2>
            </div>
            
            <div className="space-y-6">
              <div className="border-b border-black/10 pb-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-black/60 mr-3" />
                  <h3 className="text-lg font-bold text-black">PUT-AWAY LOCATIONS</h3>
                </div>
                
                <p className="text-sm text-black/60 mb-6">
                  Confirm or update the put‑away locations for the received items.
                  Each item can be assigned to a specific storage location.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      DEFAULT LOCATION
                    </div>
                    <div className="border border-black/10 p-4 bg-black/2">
                      <div className="text-sm font-bold text-black mb-1">
                        {locations.find(l => l.id === Number(lines[0]?.toLocationId))?.code || 'NOT SET'}
                      </div>
                      <div className="text-xs text-black/60">
                        {locations.find(l => l.id === Number(lines[0]?.toLocationId))?.name || 'No location selected'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      UPDATE LOCATION (OPTIONAL)
                    </div>
                    <select
                      value={form.toLocationId}
                      onChange={(e) => updateForm('toLocationId', e.target.value)}
                      className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors bg-white"
                    >
                      <option value="">KEEP ORIGINAL LOCATION</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.code} – {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-black/20 pt-6">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 border border-black/20 px-6 py-3 font-bold text-black hover:border-black/40 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO RFID TAGS
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={async () => {
                      await handleAssignLocation();
                      await handleConfirmGateIn();
                    }}
                    className="group border border-emerald-600 bg-emerald-600 text-white px-6 py-3 font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {submitting ? (
                      'PROCESSING...'
                    ) : (
                      <>
                        ASSIGN & CONFIRM GATE IN
                        <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmation in progress */}
        {step === 4 && (
          <div className="p-12 text-center">
            <div className="relative mb-6">
              <div className="h-24 w-24 mx-auto">
                <div className="absolute inset-0 border-2 border-black/10"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-emerald-600 border-r-emerald-600 animate-spin"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <h3 className="font-black text-black text-xl tracking-tight mb-3">CONFIRMING GATE IN</h3>
            <p className="text-sm text-black/60 mb-6">
              Processing your Gate In #{gateInId} with {attachedTags.length} RFID tags...
            </p>
            <div className="text-xs font-medium text-black/40">
              This may take a few moments
            </div>
          </div>
        )}

        {/* STEP 5: done */}
        {step === 5 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-black text-black text-xl tracking-tight mb-3">GATE IN CONFIRMED</h3>
            <div className="text-lg font-bold text-black mb-2">
              GATE IN #{gateInId}
            </div>
            <p className="text-sm text-black/60 mb-6">
              Successfully processed with {attachedTags.length} RFID tags and {lines.length} line item{lines.length !== 1 ? 's' : ''}
            </p>
            
            <div className="border border-black/10 p-6 mb-8 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-1">
                    VEHICLE
                  </div>
                  <div className="text-sm font-bold text-black">{form.vehicleNo}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-1">
                    SUPPLIER
                  </div>
                  <div className="text-sm font-bold text-black truncate">{form.supplierName}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-1">
                    RFID TAGS
                  </div>
                  <div className="text-sm font-bold text-black">{attachedTags.length}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-1">
                    STATUS
                  </div>
                  <div className="text-sm font-bold text-emerald-600">CONFIRMED</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={resetAll}
                className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors"
              >
                NEW GATE IN
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="border border-black/20 px-6 py-3 font-bold text-black hover:border-black/40 transition-colors"
              >
                PRINT RECEIPT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">INBOUND PROCESSING SYSTEM</div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Current step: {step} of 5 • Version 3.2.1
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${step < 5 ? 'bg-amber-500' : 'bg-emerald-600'}`}></div>
              <span className="text-xs font-bold text-black">
                STATUS: {step < 5 ? 'IN PROGRESS' : 'COMPLETED'}
              </span>
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