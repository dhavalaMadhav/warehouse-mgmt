// src/pages/Shipments.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  RefreshCw,
  Search,
  Link2,
  Calendar,
  Clock,
  Truck,
  Package,
  MapPin,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    expectedArrivalDate: '',
    driverName: '',
    truckNumber: '',
    supplierName: '',
    warehouseId: 1,
    remarks: '',
    lines: [{ itemId: 1, expectedQuantity: 0 }],
  });

  const [viewId, setViewId] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);

  const [linkForm, setLinkForm] = useState({
    shipmentId: '',
    gateInId: '',
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadShipments();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const loadShipments = async () => {
    try {
      clearMessages();
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/shipments`);
      setShipments(data || []);
    } catch (err) {
      console.error('Failed to load shipments', err);
      setError('Failed to load shipments.');
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    clearMessages();
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (index, field, value) => {
    clearMessages();
    setForm(prev => {
      const lines = [...prev.lines];
      lines[index] = { ...lines[index], [field]: value };
      return { ...prev, lines };
    });
  };

  const addLine = () => {
    clearMessages();
    setForm(prev => ({
      ...prev,
      lines: [...prev.lines, { itemId: 1, expectedQuantity: 0 }],
    }));
  };

  const removeLine = index => {
    clearMessages();
    setForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleCreateShipment = async e => {
    e.preventDefault();
    try {
      clearMessages();
      setLoading(true);

      const payload = {
        ...form,
        warehouseId: Number(form.warehouseId),
        lines: form.lines.map(l => ({
          itemId: Number(l.itemId),
          expectedQuantity: Number(l.expectedQuantity),
        })),
      };

      await axios.post(`${API_BASE_URL}/shipments`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess('Shipment schedule created successfully.');
      setForm({
        expectedArrivalDate: '',
        driverName: '',
        truckNumber: '',
        supplierName: '',
        warehouseId: 1,
        remarks: '',
        lines: [{ itemId: 1, expectedQuantity: 0 }],
      });
      loadShipments();
    } catch (err) {
      console.error('Failed to create shipment', err);
      setError('Failed to create shipment schedule.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewShipment = async () => {
    if (!viewId) return;
    try {
      clearMessages();
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/shipments/${viewId}`);
      setSelectedShipment(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch shipment by ID.');
      setSelectedShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkShipment = async e => {
    e.preventDefault();
    if (!linkForm.shipmentId || !linkForm.gateInId) return;

    try {
      clearMessages();
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/shipments/${linkForm.shipmentId}/link-gate-in/${linkForm.gateInId}`,
      );
      setSuccess('Shipment linked to Gate In successfully.');
      setLinkForm({ shipmentId: '', gateInId: '' });
      loadShipments();
    } catch (err) {
      console.error(err);
      setError('Failed to link shipment to Gate In.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && shipments.length === 0 && !error && !success) {
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

  const totalShipments = shipments.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayShipments = shipments.filter(s =>
    (s.createdAt || s.expectedArrivalDate || '').startsWith(todayStr),
  ).length;

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                INBOUND SHIPMENTS
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Schedule and track supplier shipments
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
                INBOUND WORKFLOW: ACTIVE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-black/70">
            <Truck className="w-4 h-4 text-black/70" />
            <span>{todayShipments} shipments scheduled today</span>
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

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Create shipment */}
        <form
          onSubmit={handleCreateShipment}
          className="lg:col-span-2 border border-black/20 p-6 relative overflow-hidden bg-white"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
            }}
          ></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">
                CREATE SHIPMENT SCHEDULE
              </h2>
            </div>
            <button
              type="button"
              onClick={loadShipments}
              className="flex items-center gap-2 text-sm font-medium text-black/80 hover:text-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Expected Arrival Date
              </label>
              <input
                type="date"
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.expectedArrivalDate}
                onChange={e =>
                  handleFormChange('expectedArrivalDate', e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Driver Name
              </label>
              <input
                type="text"
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.driverName}
                onChange={e => handleFormChange('driverName', e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Truck Number
              </label>
              <input
                type="text"
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.truckNumber}
                onChange={e => handleFormChange('truckNumber', e.target.value)}
                placeholder="MH01AB1234"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Supplier Name
              </label>
              <input
                type="text"
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.supplierName}
                onChange={e =>
                  handleFormChange('supplierName', e.target.value)
                }
                placeholder="ABC Electronics Pvt Ltd"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Warehouse ID
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.warehouseId}
                onChange={e =>
                  handleFormChange('warehouseId', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Remarks
              </label>
              <input
                type="text"
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.remarks}
                onChange={e => handleFormChange('remarks', e.target.value)}
                placeholder="PO-2024-12345 - Urgent Delivery"
              />
            </div>
          </div>

          {/* Lines */}
          <div className="mt-6 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-black/70" />
                <span className="text-xs font-bold text-black/80 tracking-widest uppercase">
                  Shipment Lines
                </span>
              </div>
              <button
                type="button"
                onClick={addLine}
                className="text-xs font-bold text-black hover:text-black/70"
              >
                + ADD LINE
              </button>
            </div>

            <div className="space-y-3">
              {form.lines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 border border-black/10 p-3 bg-black/1"
                >
                  <div className="col-span-5">
                    <label className="block mb-1 text-[11px] font-bold text-black/60 tracking-widest uppercase">
                      Item ID
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
                      value={line.itemId}
                      onChange={e =>
                        handleLineChange(index, 'itemId', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block mb-1 text-[11px] font-bold text-black/60 tracking-widest uppercase">
                      Expected Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
                      value={line.expectedQuantity}
                      onChange={e =>
                        handleLineChange(
                          index,
                          'expectedQuantity',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-end justify-end">
                    {form.lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/20 flex justify-end relative z-10">
            <button
              type="submit"
              disabled={loading}
              className="group border border-black bg-black text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-black/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {loading ? 'PROCESSING...' : 'CREATE SHIPMENT'}
            </button>
          </div>
        </form>

        {/* Right column: view + link */}
        <div className="space-y-4">
          {/* View shipment */}
          <div className="border border-black/20 p-5 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-2 h-6 bg-black mr-3"></div>
              <h3 className="text-sm font-black text-black tracking-tight">
                VIEW SHIPMENT BY ID
              </h3>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="number"
                min={1}
                className="flex-1 border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
                placeholder="Shipment ID"
                value={viewId}
                onChange={e => setViewId(e.target.value)}
              />
              <button
                type="button"
                onClick={handleViewShipment}
                disabled={!viewId || loading}
                className="flex items-center gap-1 border border-black bg-black text-white px-3 py-2 text-xs font-bold hover:bg-black/90 disabled:opacity-60"
              >
                <Search className="w-3 h-3" />
                VIEW
              </button>
            </div>

            {selectedShipment && (
              <div className="mt-3 border border-black/10 bg-black/2 p-2 max-h-64 overflow-auto text-[11px] text-black/80">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(selectedShipment, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Link to gate in */}
          <form
            onSubmit={handleLinkShipment}
            className="border border-black/20 p-5 bg-white"
          >
            <div className="flex items-center mb-4">
              <div className="w-2 h-6 bg-black mr-3"></div>
              <h3 className="text-sm font-black text-black tracking-tight">
                LINK SHIPMENT TO GATE IN
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-[11px] font-bold text-black/60 tracking-widest uppercase">
                  Shipment ID
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
                  value={linkForm.shipmentId}
                  onChange={e =>
                    setLinkForm(prev => ({
                      ...prev,
                      shipmentId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-[11px] font-bold text-black/60 tracking-widest uppercase">
                  Gate In ID
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
                  value={linkForm.gateInId}
                  onChange={e =>
                    setLinkForm(prev => ({
                      ...prev,
                      gateInId: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-black/90 disabled:opacity-60"
              >
                <Link2 className="w-3 h-3" />
                {loading ? 'LINKING...' : 'LINK TO GATE IN'}
              </button>
            </div>
          </form>

          {/* Small summary card */}
          <div className="border border-black/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-black/70" />
              <div>
                <div className="text-xs font-bold text-black/70 tracking-widest uppercase">
                  TOTAL SHIPMENTS
                </div>
                <div className="text-2xl font-black text-black">
                  {totalShipments}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-black/70">
              VIEW INBOUND FLOW
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Shipments table */}
      <div className="border border-black/20">
        <div className="border-b border-black/20 bg-black/2">
          <div className="grid grid-cols-12 p-4">
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase flex items-center gap-2">
              <Truck className="w-3 h-3" />
              VEHICLE
            </div>
            <div className="col-span-3 text-xs font-black text-black/80 tracking-widest uppercase">
              SUPPLIER
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              ARRIVAL DATE
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              WAREHOUSE
            </div>
            <div className="col-span-3 text-xs font-black text-black/80 tracking-widest uppercase">
              REMARKS
            </div>
          </div>
        </div>

        <div>
          {shipments.map(row => (
            <div
              key={row.id}
              className="border-b border-black/10 hover:bg-black/2 transition-colors"
            >
              <div className="grid grid-cols-12 p-4">
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    {row.truckNumber}
                  </div>
                  <div className="text-xs text-black/50 font-medium">
                    DRIVER: {row.driverName || 'N/A'}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="font-bold text-black text-sm">
                    {row.supplierName}
                  </div>
                  <div className="text-xs text-black/50 font-medium">
                    #{row.id}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    {row.expectedArrivalDate}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-medium text-black text-sm">
                    WH {row.warehouseId}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-xs text-black/70 font-medium truncate max-w-[260px]">
                    {row.remarks || 'No remarks'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {shipments.length === 0 && (
            <div className="p-10 text-center">
              <Truck className="w-10 h-10 mx-auto text-black/20 mb-3" />
              <p className="text-black/40 font-bold text-lg">
                NO SHIPMENTS FOUND
              </p>
              <p className="text-black/60 text-sm">
                Create a shipment schedule to start the inbound workflow.
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
              INBOUND SHIPMENT MANAGEMENT
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Last Updated: Today
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">
                WORKFLOW: ONLINE
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
