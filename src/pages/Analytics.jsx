import { BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import SectionCard from '../components/SectionCard';

export default function Analytics() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-black mb-2">Analytics</h1>
      <p className="text-black/70 mb-6">Warehouse performance insights</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-black/60 uppercase">Avg Pick Time</p>
              <p className="text-2xl font-semibold text-black">4.2 min</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-black/60 uppercase">Accuracy</p>
              <p className="text-2xl font-semibold text-black">98.5%</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-black/60 uppercase">Daily Orders</p>
              <p className="text-2xl font-semibold text-black">127</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-black/60 uppercase">Low Stock</p>
              <p className="text-2xl font-semibold text-black">12</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <h2 className="text-lg font-semibold text-black mb-4">Performance Overview</h2>
        <div className="h-64 flex items-center justify-center border border-black/10 rounded-[5px] bg-slate-50">
          <p className="text-black/50">Chart placeholder - Connect backend for data</p>
        </div>
      </SectionCard>
    </div>
  );
}
