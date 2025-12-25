// src/pages/QAInspections.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ClipboardCheck,
  Search,
  RefreshCw,
  Calendar,
  Clock,
  Truck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function QAInspections() {
  const [records, setRecords] = useState([]);
  const [gateInQa, setGateInQa] = useState(null);

  const [form, setForm] = useState({
    gateInId: '',
    driverRating: 5,
    itemQualityRating: 5,
    qaRemarks: '',
    inspectedById: 1,
  });

  const [gateInQuery, setGateInQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllQa();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchAllQa = async () => {
    try {
      clearMessages();
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/qa`);
      setRecords(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load QA records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    clearMessages();
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitQa = async e => {
    e.preventDefault();
    try {
      clearMessages();
      setLoading(true);

      const payload = {
        gateInId: Number(form.gateInId),
        driverRating: Number(form.driverRating),
        itemQualityRating: Number(form.itemQualityRating),
        qaRemarks: form.qaRemarks,
        inspectedById: Number(form.inspectedById),
      };

      await axios.post(`${API_BASE_URL}/qa`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess('QA inspection saved successfully.');
      setForm({
        gateInId: '',
        driverRating: 5,
        itemQualityRating: 5,
        qaRemarks: '',
        inspectedById: 1,
      });
      setGateInQa(null);
      fetchAllQa();
    } catch (err) {
      console.error(err);
      setError('Failed to submit QA inspection.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchByGateIn = async () => {
    if (!gateInQuery) return;
    try {
      clearMessages();
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/qa/gate-in/${gateInQuery}`,
      );
      setGateInQa(data);
    } catch (err) {
      console.error(err);
      setError('No QA record found for this Gate In ID.');
      setGateInQa(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && records.length === 0 && !error && !success) {
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

  const totalQa = records.length;
  const avgDriverRating =
    totalQa === 0
      ? 0
      : (
          records.reduce(
            (sum, r) => sum + (Number(r.driverRating) || 0),
            0,
          ) / totalQa
        ).toFixed(1);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                QA INSPECTIONS
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Quality checks for inbound shipments
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center gap-3 mb-1">
                <Calendar className="w-5 h-5 text-black/70" />
                <span className="font-bold text-black text-lg">
                  {time
                    .toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-black/70" />
                <span className="font-bold text-black text-lg">
                  {time.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <div className="flex items-center justify-between mb-8">
          <div className="border border-emerald-300 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-600"></div>
              <span className="font-bold text-emerald-800 tracking-widest text-sm">
                QUALITY CONTROL: ACTIVE
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70 flex items-center gap-2">
            <Truck className="w-4 h-4 text-black/70" />
            <span>{totalQa} inspections recorded</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(error || success) && (
        <div
          className={`mb-6 border px-4 py-3 text-sm flex items-center gap-2 ${
            error
              ? 'border-red-300 bg-red-50 text-red-800'
              : 'border-emerald-300 bg-emerald-50 text-emerald-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">{error || success}</span>
        </div>
      )}

      {/* Top grid: form + per-gate-in view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Record QA */}
        <form
          onSubmit={handleSubmitQa}
          className="lg:col-span-2 border border-black/20 p-6 relative overflow-hidden bg-white"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
            }}
          ></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">
                RECORD QA INSPECTION
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchAllQa}
              className="flex items-center gap-2 text-sm font-medium text-black/80 hover:text-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Gate In ID
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.gateInId}
                onChange={e => handleFormChange('gateInId', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Inspected By (User ID)
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.inspectedById}
                onChange={e =>
                  handleFormChange('inspectedById', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Driver Rating (1–5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.driverRating}
                onChange={e =>
                  handleFormChange('driverRating', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Item Quality Rating (1–5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.itemQualityRating}
                onChange={e =>
                  handleFormChange('itemQualityRating', e.target.value)
                }
              />
            </div>
          </div>

          <div className="mt-4 relative z-10">
            <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
              QA Remarks
            </label>
            <textarea
              rows={3}
              className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
              value={form.qaRemarks}
              onChange={e => handleFormChange('qaRemarks', e.target.value)}
              placeholder="Good quality items. Driver was professional and on time. Minor packaging issues noted."
            />
          </div>

          <div className="mt-6 pt-4 border-t border-black/20 flex justify-end relative z-10">
            <button
              type="submit"
              disabled={loading}
              className="group border border-black bg-black text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-black/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {loading ? 'PROCESSING...' : 'SAVE QA INSPECTION'}
            </button>
          </div>
        </form>

        {/* View by Gate In */}
        <div className="border border-black/20 p-5 bg-white">
          <div className="flex items-center mb-4">
            <div className="w-2 h-6 bg-black mr-3"></div>
            <h3 className="text-sm font-black text-black tracking-tight">
              VIEW QA BY GATE IN
            </h3>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="number"
              min={1}
              className="flex-1 border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
              placeholder="Gate In ID"
              value={gateInQuery}
              onChange={e => setGateInQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={handleFetchByGateIn}
              disabled={!gateInQuery || loading}
              className="flex items-center gap-1 border border-black bg-black text-white px-3 py-2 text-xs font-bold hover:bg-black/90 disabled:opacity-60"
            >
              <Search className="w-3 h-3" />
              VIEW
            </button>
          </div>

          {gateInQa && (
            <div className="mt-3 border border-black/10 bg-black/2 p-2 max-h-64 overflow-auto text-[11px] text-black/80">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(gateInQa, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-black/20 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-black/70 tracking-widest uppercase">
              Total QA Records
            </div>
            <div className="text-2xl font-black text-black">{totalQa}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="border border-black/20 p-4">
          <div className="text-xs font-bold text-black/70 tracking-widest uppercase mb-1">
            Avg Driver Rating
          </div>
          <div className="text-2xl font-black text-black">{avgDriverRating}</div>
        </div>
        <div className="border border-black/20 p-4">
          <div className="text-xs font-bold text-black/70 tracking-widest uppercase mb-1">
            Gate Ins with QA
          </div>
          <div className="text-2xl font-black text-black">
            {new Set(records.map(r => r.gateInId)).size}
          </div>
        </div>
      </div>

      {/* QA records table */}
      <div className="border border-black/20">
        <div className="border-b border-black/20 bg-black/2">
          <div className="grid grid-cols-12 p-4">
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              GATE IN
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              DRIVER RATING
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              ITEM RATING
            </div>
            <div className="col-span-4 text-xs font-black text-black/80 tracking-widest uppercase">
              REMARKS
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              INSPECTED BY
            </div>
          </div>
        </div>

        <div>
          {records.map(rec => (
            <div
              key={rec.id}
              className="border-b border-black/10 hover:bg-black/2 transition-colors"
            >
              <div className="grid grid-cols-12 p-4">
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    GI #{rec.gateInId}
                  </div>
                  <div className="text-xs text-black/50 font-medium">
                    QA #{rec.id}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    {rec.driverRating}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    {rec.itemQualityRating}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="text-xs text-black/70 font-medium truncate max-w-[260px]">
                    {rec.qaRemarks || 'No remarks'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    {rec.inspectedById}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <div className="p-10 text-center">
              <ClipboardCheck className="w-10 h-10 mx-auto text-black/20 mb-3" />
              <p className="text-black/40 font-bold text-lg">
                NO QA RECORDS FOUND
              </p>
              <p className="text-black/60 text-sm">
                Record inspections for completed Gate In operations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">
              QUALITY ASSURANCE MODULE
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Last Updated: Today
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">
                QA ENGINE: ONLINE
              </span>
            </div>
            <div className="text-xs font-medium text-black/70">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
