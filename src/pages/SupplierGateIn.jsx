import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ChevronRight, Truck } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

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
          items: itemsRes.data,
          locations: locRes.data,
          gateKeepers: gkRes.data,
          storeKeepers: skRes.data,
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
        lines: [
          {
            itemId: Number(form.itemId),
            qty: Number(form.qty),
            toLocationId: Number(form.toLocationId),
          },
        ],
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
    setStep(1);
  };

  const { items, locations, gateKeepers, storeKeepers } = masterData;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Truck className="w-8 h-8 text-slate-800" />
          <div>
            <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900">
              Supplier Gate In
            </h1>
            <p className="text-base text-slate-600">
              Record supplier inbound vehicle, attach RFID tags, assign locations, and confirm Gate In.
            </p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <SectionCard className="mb-6">
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {['Details', 'RFID Tags', 'Assign Location', 'Confirm', 'Done'].map(
            (label, index) => {
              const s = index + 1;
              const active = step === s;
              const completed = step > s;
              return (
                <div key={label} className="flex items-center mb-1">
                  <div
                    className={`
                      flex items-center justify-center w-7 h-7 rounded-full border text-xs font-semibold
                      ${
                        completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : active
                          ? 'bg-black border-black text-white'
                          : 'border-black/20 text-slate-700'
                      }
                    `}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      s
                    )}
                  </div>
                  <span className="ml-2 mr-3 text-slate-700 text-[13px]">
                    {label}
                  </span>
                  {index < 4 && (
                    <ChevronRight className="w-4 h-4 text-slate-400 mr-3" />
                  )}
                </div>
              );
            },
          )}
        </div>
      </SectionCard>

      {/* STEP 1: details + line */}
      {step === 1 && (
        <SectionCard className="space-y-6 mb-6">
          <form onSubmit={handleCreateGateIn} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Vehicle No
                </label>
                <input
                  type="text"
                  value={form.vehicleNo}
                  onChange={(e) => updateForm('vehicleNo', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Gate Keeper
                </label>
                <select
                  value={form.gateKeeperId}
                  onChange={(e) => updateForm('gateKeeperId', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                >
                  <option value="">Select</option>
                  {gateKeepers.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Store Keeper
                </label>
                <select
                  value={form.storeKeeperId}
                  onChange={(e) => updateForm('storeKeeperId', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                >
                  <option value="">Select</option>
                  {storeKeepers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={form.supplierName}
                  onChange={(e) => updateForm('supplierName', e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Supplier Address
                </label>
                <input
                  type="text"
                  value={form.supplierAddress}
                  onChange={(e) =>
                    updateForm('supplierAddress', e.target.value)
                  }
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Remarks / PO No
              </label>
              <input
                type="text"
                value={form.remarks}
                onChange={(e) => updateForm('remarks', e.target.value)}
                className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
              />
            </div>

            <div className="border-t border-slate-200 pt-4 mt-2">
              <h3 className="text-base font-semibold text-slate-900 mb-3">
                Line Details
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Item
                  </label>
                  <select
                    value={form.itemId}
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
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.qty}
                    onChange={(e) => updateForm('qty', e.target.value)}
                    className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Put‑away Location
                  </label>
                  <select
                    value={form.toLocationId}
                    onChange={(e) =>
                      updateForm('toLocationId', e.target.value)
                    }
                    className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.code} – {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-[5px] bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Gate In'}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* STEP 2: RFID tags */}
      {step === 2 && (
        <SectionCard className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Attach RFID Tags (Gate In #{gateInId})
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                (e.preventDefault(), handleAddTagLocal())
              }
              placeholder="Scan or type RFID tag and press Enter"
              className="flex-1 border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
            />
            <button
              type="button"
              onClick={handleAddTagLocal}
              className="px-4 py-2.5 rounded-[5px] border border-black/10 bg-slate-50 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-[5px] border border-slate-300 bg-slate-50 text-slate-800 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {attachedTags.length === 0 && (
              <p className="text-xs text-slate-500">No tags added yet.</p>
            )}
          </div>
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Back to details
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleAttachTagsApi}
              className="px-5 py-2.5 rounded-[5px] bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Attach Tags & Continue'}
            </button>
          </div>
        </SectionCard>
      )}

      {/* STEP 3: assign + confirm */}
      {step === 3 && (
        <SectionCard className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Assign Location (optional)
          </h2>
          <p className="text-sm text-slate-600">
            Confirm or update the put‑away location for this Gate In line before final confirmation.
          </p>
          <div className="max-w-sm">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Put‑away Location
            </label>
            <select
              value={form.toLocationId}
              onChange={(e) => updateForm('toLocationId', e.target.value)}
              className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
            >
              <option value="">Keep original</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.code} – {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Back to RFID tags
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                await handleAssignLocation();
                await handleConfirmGateIn();
              }}
              className="px-5 py-2.5 rounded-[5px] bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Processing...' : 'Assign & Confirm Gate In'}
            </button>
          </div>
        </SectionCard>
      )}

      {/* STEP 5: done */}
      {step === 5 && (
        <SectionCard className="flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Gate In Confirmed
          </h2>
          <p className="text-sm text-slate-600">
            Supplier Gate In #{gateInId} has been confirmed with {attachedTags.length} RFID tags.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-2 px-5 py-2.5 rounded-[5px] bg-black text-white text-sm font-medium hover:bg-slate-800"
          >
            New Gate In
          </button>
        </SectionCard>
      )}
    </div>
  );
}
