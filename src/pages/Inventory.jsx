// src/pages/Inventory.jsx
import { useState } from 'react';
import axios from 'axios';
import {
  Search,
  MapPin,
  Package,
  Layers,
  Calendar,
  Clock,
  AlertCircle,
  Warehouse,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Inventory() {
  const [locationId, setLocationId] = useState('');
  const [itemId, setItemId] = useState('');
  const [locationInventory, setLocationInventory] = useState([]);
  const [itemInventory, setItemInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time] = useState(new Date());
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const fetchByLocation = async () => {
    if (!locationId) return;
    try {
      clearError();
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/inventory/location/${locationId}`,
      );
      setLocationInventory(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load inventory for this location.');
      setLocationInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchByItem = async () => {
    if (!itemId) return;
    try {
      clearError();
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/inventory/item/${itemId}`,
      );
      setItemInventory(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load inventory for this item.');
      setItemInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const totalItemQty = itemInventory.reduce(
    (sum, row) => sum + (row.quantity ?? row.qty ?? 0),
    0,
  );
  const totalLocationQty = locationInventory.reduce(
    (sum, row) => sum + (row.quantity ?? row.qty ?? 0),
    0,
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                INVENTORY VIEW
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Stock visibility by item and location
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
                INVENTORY SERVICE: ACTIVE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-black/70">
            <Warehouse className="w-4 h-4 text-black/70" />
            <span>Real-time stock lookup</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 border border-red-300 bg-red-50 text-red-800 px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Search panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* By location */}
        <div className="border border-black/20 p-6 relative overflow-hidden bg-white">
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
            }}
          ></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">
                INVENTORY BY LOCATION
              </h2>
            </div>
          </div>

          <div className="flex gap-2 mb-4 relative z-10">
            <input
              type="number"
              min={1}
              className="flex-1 border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
              placeholder="Location ID"
              value={locationId}
              onChange={e => {
                clearError();
                setLocationId(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={fetchByLocation}
              disabled={!locationId || loading}
              className="flex items-center gap-1 border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-black/90 disabled:opacity-60"
            >
              <Search className="w-3 h-3" />
              VIEW
            </button>
          </div>

          <div className="overflow-auto border border-black/10 bg-black/1 max-h-80 relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-black/2">
                  <th className="text-left py-3 px-2 text-[11px] font-black text-black/80 tracking-widest uppercase">
                    Item
                  </th>
                  <th className="text-left py-3 px-2 text-[11px] font-black text-black/80 tracking-widest uppercase">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {locationInventory.length > 0 ? (
                  locationInventory.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-black/10 hover:bg-black/2 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="font-bold text-black text-sm">
                          {row.itemCode || row.itemId}
                        </div>
                        <div className="text-xs text-black/70 font-medium truncate max-w-[220px]">
                          {row.itemName || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-black text-lg text-black">
                          {row.quantity ?? row.qty ?? 0}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-6 px-2 text-center text-xs text-black/50"
                    >
                      No inventory for this location.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* By item */}
        <div className="border border-black/20 p-6 relative overflow-hidden bg-white">
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-20"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
            }}
          ></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-xl font-black text-black tracking-tight">
                INVENTORY BY ITEM
              </h2>
            </div>
          </div>

          <div className="flex gap-2 mb-4 relative z-10">
            <input
              type="number"
              min={1}
              className="flex-1 border border-black/20 p-3 text-sm focus:outline-none focus:border-black/40"
              placeholder="Item ID"
              value={itemId}
              onChange={e => {
                clearError();
                setItemId(e.target.value);
              }}
            />
            <button
              type="button"
              onClick={fetchByItem}
              disabled={!itemId || loading}
              className="flex items-center gap-1 border border-black bg-black text-white px-4 py-2 text-xs font-bold hover:bg-black/90 disabled:opacity-60"
            >
              <Search className="w-3 h-3" />
              VIEW
            </button>
          </div>

          <div className="overflow-auto border border-black/10 bg-black/1 max-h-80 relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 bg-black/2">
                  <th className="text-left py-3 px-2 text-[11px] font-black text-black/80 tracking-widest uppercase">
                    Location
                  </th>
                  <th className="text-left py-3 px-2 text-[11px] font-black text-black/80 tracking-widest uppercase">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {itemInventory.length > 0 ? (
                  itemInventory.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-black/10 hover:bg-black/2 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-black/60" />
                          <span className="font-bold text-black text-sm">
                            {row.locationCode || row.locationId}
                          </span>
                        </div>
                        <div className="text-xs text-black/70 font-medium truncate max-w-[220px]">
                          {row.locationName || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-black text-lg text-black">
                          {row.quantity ?? row.qty ?? 0}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-6 px-2 text-center text-xs text-black/50"
                    >
                      No inventory for this item.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-black/20 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-black/70 tracking-widest uppercase">
              Item total quantity
            </div>
            <div className="text-2xl font-black text-black">
              {totalItemQty}
            </div>
          </div>
          <Package className="w-6 h-6 text-black/70" />
        </div>
        <div className="border border-black/20 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-black/70 tracking-widest uppercase">
              Location total quantity
            </div>
            <div className="text-2xl font-black text-black">
              {totalLocationQty}
            </div>
          </div>
          <MapPin className="w-6 h-6 text-black/70" />
        </div>
        <div className="border border-black/20 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-black/70 tracking-widest uppercase">
              Locations for item
            </div>
            <div className="text-2xl font-black text-black">
              {itemInventory.length}
            </div>
          </div>
          <Layers className="w-6 h-6 text-black/70" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">
              INVENTORY ANALYSIS MODULE
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Last Updated: Today
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">
                DATA FEED: ONLINE
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
