import { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function InternalTransfer() {
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [remarks, setRemarks] = useState('');

  const [lines, setLines] = useState([
    { tempId: 1, itemId: '', requisitionQty: '' },
  ]);

  const [creating, setCreating] = useState(false);
  const [transfer, setTransfer] = useState(null); // { id, lines: [...] }
  const [issueState, setIssueState] = useState({}); // lineId -> { quantity, fromRFIDTag, toRFIDTag, loading }
  const [historyState, setHistoryState] = useState({}); // lineId -> { loading, records: [] }

  // load master data
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingMaster(true);
        const [locRes, itemRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/locations`),
          axios.get(`${API_BASE_URL}/items`),
        ]);
        setLocations(locRes.data);
        setItems(itemRes.data);
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
    setLines((prev) => prev.filter((l) => l.tempId !== tempId));
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
      alert('Issue recorded');
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

  if (loadingMaster) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="h-12 w-12 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-slate-800" />
          <div>
            <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900">
              Internal Transfer
            </h1>
            <p className="text-base text-slate-600">
              Move stock between locations inside the same warehouse with RFID
              traceability.
            </p>
          </div>
        </div>
      </div>

      {/* Create transfer */}
      {!transfer && (
        <SectionCard className="space-y-6 mb-6">
          <form onSubmit={handleCreateTransfer} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  From Location
                </label>
                <select
                  value={fromLocationId}
                  onChange={(e) => setFromLocationId(e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                >
                  <option value="">Select</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} – {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  To Location
                </label>
                <select
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                  required
                >
                  <option value="">Select</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} – {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-black/15 rounded-[5px] px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                  placeholder="Reason / reference"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-slate-900">
                  Lines
                </h2>
                <button
                  type="button"
                  onClick={addLine}
                  className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-[5px] border border-black/10 bg-slate-50 text-slate-800 hover:bg-slate-100"
                >
                  <Plus className="w-4 h-4" />
                  Add Line
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-[15px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                        Requested Qty
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {lines.map((line) => (
                      <tr key={line.tempId}>
                        <td className="px-4 py-3">
                          <select
                            value={line.itemId}
                            onChange={(e) =>
                              updateLine(line.tempId, 'itemId', e.target.value)
                            }
                            className="w-full border border-black/15 rounded-[5px] px-2.5 py-2 text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-black/30"
                            required
                          >
                            <option value="">Select item</option>
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.code} – {it.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={line.requisitionQty}
                            onChange={(e) =>
                              updateLine(
                                line.tempId,
                                'requisitionQty',
                                e.target.value,
                              )
                            }
                            className="w-full border border-black/15 rounded-[5px] px-2.5 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
                            required
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(line.tempId)}
                              className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-4 text-center text-sm text-slate-500"
                        >
                          No lines. Add at least one item.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-[5px] bg-black text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Transfer'}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* After transfer created */}
      {transfer && (
        <div className="space-y-6">
          <SectionCard>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Transfer #{transfer.id}
                </h2>
                <p className="text-sm text-slate-600">
                  {getLocationLabel(transfer.fromLocationId)} →{' '}
                  {getLocationLabel(transfer.toLocationId)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                New Transfer
              </button>
            </div>
            {transfer.remarks && (
              <p className="text-sm text-slate-500 mt-1">
                Remarks: {transfer.remarks}
              </p>
            )}
          </SectionCard>

          <SectionCard>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Lines & Issue
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-[15px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                      Item
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                      Requested
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wide text-xs">
                      History
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {transfer.lines?.map((line) => {
                    const st =
                      issueState[line.id] || {
                        quantity: '',
                        fromRFIDTag: '',
                        toRFIDTag: '',
                        loading: false,
                      };
                    const hist = historyState[line.id];

                    return (
                      <tr key={line.id}>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-slate-900">
                            {getItemLabel(line.itemId)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Line #{line.id}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right align-top text-slate-800">
                          {line.requisitionQty}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <input
                              type="number"
                              min="1"
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
                              className="border border-black/15 rounded-[5px] px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/30"
                              placeholder="Qty"
                            />
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
                              className="border border-black/15 rounded-[5px] px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/30"
                              placeholder="From RFID"
                            />
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
                              className="border border-black/15 rounded-[5px] px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/30"
                              placeholder="To RFID"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={st.loading}
                            onClick={() => handleIssue(line)}
                            className="px-3 py-1.5 rounded-[5px] bg-black text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60"
                          >
                            {st.loading ? 'Issuing…' : 'Issue'}
                          </button>
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <button
                            type="button"
                            onClick={() => loadHistory(line)}
                            className="text-xs text-blue-600 hover:underline mb-2"
                          >
                            View history
                          </button>
                          {hist?.loading && (
                            <p className="text-xs text-slate-400">Loading…</p>
                          )}
                          {hist?.records && hist.records.length > 0 && (
                            <div className="mt-1 max-h-32 overflow-y-auto border border-slate-200 rounded-[5px]">
                              <table className="w-full text-[11px]">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-2 py-1 text-left text-slate-500">
                                      Qty
                                    </th>
                                    <th className="px-2 py-1 text-left text-slate-500">
                                      From
                                    </th>
                                    <th className="px-2 py-1 text-left text-slate-500">
                                      To
                                    </th>
                                    <th className="px-2 py-1 text-left text-slate-500">
                                      Time
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {hist.records.map((r, idx) => (
                                    <tr key={idx} className="border-t">
                                      <td className="px-2 py-1">
                                        {r.quantity}
                                      </td>
                                      <td className="px-2 py-1">
                                        {r.fromRFIDTag}
                                      </td>
                                      <td className="px-2 py-1">
                                        {r.toRFIDTag}
                                      </td>
                                      <td className="px-2 py-1">
                                        {r.timestamp || r.createdAt}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!transfer.lines?.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-sm text-slate-500"
                      >
                        No lines returned from backend.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
