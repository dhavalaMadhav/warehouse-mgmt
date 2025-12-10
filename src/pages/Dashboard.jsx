import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  Box,
  PackageCheck,
} from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';
import ActionButton from '../components/ActionButton.jsx';
import { initSocket } from '../utils/socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [gateIns, setGateIns] = useState([]);
  const [gateOuts, setGateOuts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize WebSocket
    const socket = initSocket();

    socket.on('inventory:update', (data) => {
      // Refresh inventory on real-time updates
      loadData();
    });

    loadData();

    return () => {
      socket.off('inventory:update');
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, giRes, goRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/inventory`),
        axios.get(`${API_BASE_URL}/gate-in`),
        axios.get(`${API_BASE_URL}/gate-out`),
      ]);
      setInventory(invRes.data || []);
      setGateIns(giRes.data || []);
      setGateOuts(goRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalSkus = inventory.length;
    const totalQty = inventory.reduce(
      (sum, row) => sum + (Number(row.quantity) || 0),
      0,
    );
    const lowStock = inventory.filter(
      (row) => (Number(row.quantity) || 0) < 10,
    ).length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayGateIns = gateIns.filter((g) =>
      (g.createdAt || g.gateInDate || '').startsWith(todayStr),
    ).length;
    const todayGateOuts = gateOuts.filter((g) =>
      (g.createdAt || g.gateOutDate || '').startsWith(todayStr),
    ).length;

    return { totalSkus, totalQty, lowStock, todayGateIns, todayGateOuts };
  }, [inventory, gateIns, gateOuts]);

  const recentGateIns = useMemo(
    () => gateIns.slice().reverse().slice(0, 5),
    [gateIns],
  );
  const recentGateOuts = useMemo(
    () => gateOuts.slice().reverse().slice(0, 5),
    [gateOuts],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="h-12 w-12 border-2 border-black/60 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-[32px] font-semibold text-black mb-2">
        Dashboard
      </h1>
      <p className="text-base text-black/70 mb-6">
        Snapshot of inventory, inbound (Gate In) and outbound (Gate Out) activity.
      </p>

      {/* Quick Actions */}
      <SectionCard className="mb-6">
        <h2 className="text-lg font-semibold text-black mb-4 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={ArrowDownToLine}
            label="Receive"
            onClick={() => navigate('/supplier-gate-in')}
            color="blue"
          />
          <ActionButton
            icon={ShoppingCart}
            label="Pick"
            onClick={() => navigate('/pick-orders')}
            color="green"
          />
          <ActionButton
            icon={PackageCheck}
            label="Pack"
            onClick={() => navigate('/pack-orders')}
            color="amber"
          />
        </div>
      </SectionCard>

      {/* Metrics row with icons, blended background and vertical dividers */}
      <div className="bg-white border border-black/10 rounded-[5px] mb-6">
        <div className="flex divide-x divide-black/10">
          <MetricCell
            icon={Package}
            label="Total SKUs"
            value={metrics.totalSkus}
            color="text-emerald-600"
          />
          <MetricCell
            icon={Truck}
            label="Total Qty on Hand"
            value={metrics.totalQty}
            color="text-sky-600"
          />
          <MetricCell
            icon={Package}
            label="Low‑stock SKUs (< 10)"
            value={metrics.lowStock}
            color="text-amber-600"
          />
          <MetricCell
            icon={ArrowDownToLine}
            label="Today Gate Ins"
            value={metrics.todayGateIns}
            color="text-blue-600"
          />
          <MetricCell
            icon={ArrowUpFromLine}
            label="Today Gate Outs"
            value={metrics.todayGateOuts}
            color="text-rose-600"
          />
        </div>
      </div>

      {/* Recent movements */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <SectionCard>
          <RecentGateTable
            title="Recent Gate Ins"
            rows={recentGateIns}
            type="in"
          />
        </SectionCard>
        <SectionCard>
          <RecentGateTable
            title="Recent Gate Outs"
            rows={recentGateOuts}
            type="out"
          />
        </SectionCard>
      </div>

      {/* Inventory summary table (top SKUs) */}
      <SectionCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black uppercase tracking-wide">
            Top Inventory by Quantity
          </h2>
          <span className="text-xs text-black/70 uppercase">
            Showing up to 10 SKUs
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10 text-[15px]">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-black/70 uppercase tracking-wide text-xs">
                  Item
                </th>
                <th className="px-4 py-3 text-left font-medium text-black/70 uppercase tracking-wide text-xs">
                  Location
                </th>
                <th className="px-4 py-3 text-right font-medium text-black/70 uppercase tracking-wide text-xs">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 bg-white">
              {inventory
                .slice()
                .sort(
                  (a, b) =>
                    (Number(b.quantity) || 0) - (Number(a.quantity) || 0),
                )
                .slice(0, 10)
                .map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap text-black text-[15px]">
                      {row.itemCode || row.item?.code}{' '}
                      {row.itemName || row.item?.name
                        ? `– ${row.itemName || row.item?.name}`
                        : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-black/80 text-[15px]">
                      {row.locationCode || row.location?.code}{' '}
                      {row.locationName || row.location?.name
                        ? `– ${row.locationName || row.location?.name}`
                        : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-black text-[15px]">
                      {row.quantity}
                    </td>
                  </tr>
                ))}
              {inventory.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-sm text-black/50"
                  >
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* Small components */

function MetricCell({ icon: Icon, label, value, color }) {
  return (
    <div className="flex-1 px-5 py-4 md:px-6 md:py-5 flex items-center gap-4">
      <Icon className={`w-7 h-7 md:w-8 md:h-8 ${color} flex-shrink-0`} />
      <div>
        <p className="text-xs md:text-sm uppercase tracking-wide text-black/70 mb-1">
          {label}
        </p>
        <p className="text-2xl md:text-[26px] font-semibold text-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function RecentGateTable({ title, rows, type }) {
  const isIn = type === 'in';
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-black uppercase tracking-wide">{title}</h2>
        <span className="text-xs text-black/70 uppercase">
          Latest {rows.length} records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-black/10 text-[15px]">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-black/70 uppercase tracking-wide text-xs">
                Vehicle
              </th>
              <th className="px-4 py-3 text-left font-medium text-black/70 uppercase tracking-wide text-xs">
                Party
              </th>
              <th className="px-4 py-3 text-left font-medium text-black/70 uppercase tracking-wide text-xs">
                Remarks
              </th>
              <th className="px-4 py-3 text-right font-medium text-black/70 uppercase tracking-wide text-xs">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 bg-white">
            {rows.map((g, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap text-black">
                  {g.vehicleNo}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-black/80">
                  {isIn
                    ? g.supplierName || g.sourceWarehouseName
                    : g.customerName || g.destinationWarehouseName}
                </td>
                <td className="px-4 py-3 text-black/70 max-w-xs truncate">
                  {g.remarks}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-black/80">
                  {(g.createdAt || g.gateInDate || g.gateOutDate || '')
                    .replace('T', ' ')
                    .slice(0, 16)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-black/50"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
