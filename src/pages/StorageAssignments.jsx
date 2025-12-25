// src/pages/StorageAssignments.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  UserCheck,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Package,
  AlertCircle,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function StorageAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [storekeepers, setStorekeepers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    gateInLineId: '',
    assignedToId: '',
    targetLocationId: '',
    quantityToStore: '',
  });

  const [completeId, setCompleteId] = useState('');
  const [completionRemarks, setCompletionRemarks] = useState('');

  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAssignments('');
    fetchStorekeepers();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const fetchAssignments = async status => {
    try {
      clearMessages();
      setLoading(true);
      const url = status
        ? `${API_BASE_URL}/storage-assignments?status=${encodeURIComponent(
            status,
          )}`
        : `${API_BASE_URL}/storage-assignments`;
      const { data } = await axios.get(url);
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load storage assignments.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorekeepers = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/storage-assignments/available-storekeepers`,
      );
      setStorekeepers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormChange = (field, value) => {
    clearMessages();
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAssignment = async e => {
    e.preventDefault();
    try {
      clearMessages();
      setLoading(true);

      const payload = {
        gateInLineId: Number(form.gateInLineId),
        assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
        targetLocationId: Number(form.targetLocationId),
        quantityToStore: Number(form.quantityToStore),
      };

      await axios.post(`${API_BASE_URL}/storage-assignments`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess('Storage assignment created successfully.');
      setForm({
        gateInLineId: '',
        assignedToId: '',
        targetLocationId: '',
        quantityToStore: '',
      });
      fetchAssignments(statusFilter);
    } catch (err) {
      console.error(err);
      setError('Failed to create storage assignment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAssignment = async e => {
    e.preventDefault();
    if (!completeId) return;
    try {
      clearMessages();
      setLoading(true);

      const payload = {
        completionRemarks: completionRemarks || 'Completed via UI.',
      };

      await axios.post(
        `${API_BASE_URL}/storage-assignments/${completeId}/complete`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      setSuccess('Assignment marked as complete.');
      setCompleteId('');
      setCompletionRemarks('');
      fetchAssignments(statusFilter);
    } catch (err) {
      console.error(err);
      setError('Failed to complete assignment.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = value => {
    setStatusFilter(value);
    fetchAssignments(value);
  };

  if (loading && assignments.length === 0 && !error && !success) {
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

  const totalAssignments = assignments.length;
  const completedCount = assignments.filter(a => a.status === 'COMPLETED')
    .length;

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                STORAGE ASSIGNMENTS
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Put-away planning and completion tracking
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
                PUT-AWAY ENGINE: ACTIVE
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-black/70" />
            <span>{totalAssignments} assignments in system</span>
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
        {/* Create assignment */}
        <form
          onSubmit={handleCreateAssignment}
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
                CREATE STORAGE ASSIGNMENT
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fetchAssignments(statusFilter)}
              className="flex items-center gap-2 text-sm font-medium text-black/80 hover:text-black transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              REFRESH
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Gate In Line ID
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.gateInLineId}
                onChange={e =>
                  handleFormChange('gateInLineId', e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Target Location ID
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.targetLocationId}
                onChange={e =>
                  handleFormChange('targetLocationId', e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Quantity to Store
              </label>
              <input
                type="number"
                min={0}
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.quantityToStore}
                onChange={e =>
                  handleFormChange('quantityToStore', e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-bold text-black/70 tracking-widest uppercase">
                Assign To (Storekeeper ID, optional)
              </label>
              <select
                className="w-full border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
                value={form.assignedToId}
                onChange={e =>
                  handleFormChange('assignedToId', e.target.value)
                }
              >
                <option value="">AUTO-ASSIGN (NULL)</option>
                {storekeepers.map(sk => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name || `Storekeeper ${sk.id}`} (ID: {sk.id})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-black/50 font-medium">
                Leave blank to let the system select the best storekeeper.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/20 flex justify-end relative z-10">
            <button
              type="submit"
              disabled={loading}
              className="group border border-black bg-black text-white px-6 py-3 font-bold text-sm tracking-wide hover:bg-black/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {loading ? 'PROCESSING...' : 'CREATE ASSIGNMENT'}
            </button>
          </div>
        </form>

        {/* Complete assignment + storekeepers */}
        <form
          onSubmit={handleCompleteAssignment}
          className="border border-black/20 p-5 bg-white space-y-5"
        >
          <div className="flex items-center mb-1">
            <div className="w-2 h-6 bg-black mr-3"></div>
            <h3 className="text-sm font-black text-black tracking-tight">
              COMPLETE ASSIGNMENT
            </h3>
          </div>

          <div>
            <label className="block mb-1 text-[11px] font-bold text-black/60 tracking-widest uppercase">
              Assignment ID
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
              value={completeId}
              onChange={e => setCompleteId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[11px] font-bold text-black/60 tracking-widest uppercase">
              Completion Remarks
            </label>
            <textarea
              rows={3}
              className="w-full border border-black/20 p-2 text-sm focus:outline-none focus:border-black/40"
              value={completionRemarks}
              onChange={e => setCompletionRemarks(e.target.value)}
              placeholder="All items stored successfully in designated bin."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-black/90 disabled:opacity-60 w-full"
          >
            <CheckCircle2 className="w-4 h-4" />
            {loading ? 'COMPLETING...' : 'MARK AS COMPLETE'}
          </button>

          <div className="pt-4 border-t border-black/10">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-4 h-4 text-black/70" />
              <span className="text-xs font-bold text-black/80 tracking-widest uppercase">
                Available Storekeepers
              </span>
            </div>
            <ul className="space-y-1 text-xs text-black/80">
              {storekeepers.length > 0 ? (
                storekeepers.map(sk => (
                  <li key={sk.id} className="flex justify-between">
                    <span>{sk.name || `Storekeeper ${sk.id}`}</span>
                    <span className="text-black/50">ID: {sk.id}</span>
                  </li>
                ))
              ) : (
                <li className="text-black/50">
                  No available storekeepers found.
                </li>
              )}
            </ul>
          </div>
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-black/20 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-black/70 tracking-widest uppercase">
              Total Assignments
            </div>
            <div className="text-2xl font-black text-black">
              {totalAssignments}
            </div>
          </div>
          <ClipboardList className="w-6 h-6 text-black/70" />
        </div>
        <div className="border border-black/20 p-4">
          <div className="text-xs font-bold text-black/70 tracking-widest uppercase mb-1">
            Completed
          </div>
          <div className="text-2xl font-black text-black">{completedCount}</div>
        </div>
        <div className="border border-black/20 p-4">
          <div className="text-xs font-bold text-black/70 tracking-widest uppercase mb-1">
            Pending / In Progress
          </div>
          <div className="text-2xl font-black text-black">
            {totalAssignments - completedCount}
          </div>
        </div>
      </div>

      {/* Assignments table */}
      <div className="border border-black/20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/20 bg-black/2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-black" />
            <span className="text-xs font-black text-black/80 tracking-widest uppercase">
              STORAGE ASSIGNMENTS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3 h-3 text-black/60" />
            <select
              className="border border-black/20 px-2 py-1 text-xs font-medium text-black/80 focus:outline-none focus:border-black/40"
              value={statusFilter}
              onChange={e => handleStatusChange(e.target.value)}
            >
              <option value="">ALL STATUSES</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        <div>
          {assignments.map(a => (
            <div
              key={a.id}
              className="border-b border-black/10 hover:bg-black/2 transition-colors"
            >
              <div className="grid grid-cols-12 p-4">
                <div className="col-span-2">
                  <div className="font-bold text-black text-sm">
                    ASSIGN #{a.id}
                  </div>
                  <div className="text-xs text-black/50 font-medium">
                    GI LINE {a.gateInLineId}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-black/60" />
                    <span className="font-bold text-black text-sm">
                      LOC {a.targetLocationId}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="font-black text-lg text-black tracking-tight">
                    {a.quantityToStore}
                  </div>
                  <div className="text-xs text-black/50 font-medium">
                    Qty to store
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3 h-3 text-black/60" />
                    <span className="font-medium text-black text-sm">
                      {a.assignedToId || 'Auto'}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div
                    className={`inline-flex items-center px-2 py-1 text-[11px] font-bold ${
                      a.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : a.status === 'ASSIGNED'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {a.status || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {assignments.length === 0 && (
            <div className="p-10 text-center">
              <Package className="w-10 h-10 mx-auto text-black/20 mb-3" />
              <p className="text-black/40 font-bold text-lg">
                NO ASSIGNMENTS FOUND
              </p>
              <p className="text-black/60 text-sm">
                Create a storage assignment from recent Gate In lines.
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
              STORAGE ASSIGNMENT MODULE
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Last Updated: Today
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">
                PUT-AWAY: ONLINE
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
