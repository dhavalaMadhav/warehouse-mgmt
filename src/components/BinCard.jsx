import { MapPin, Package } from 'lucide-react';

export default function BinCard({ bin, onDrop, isDragOver }) {
  const utilizationPercent = (bin.currentCapacity / bin.maxCapacity) * 100;
  const isFull = utilizationPercent >= 100;
  const isNearFull = utilizationPercent >= 80;

  return (
    <div
      className={`
        border-2 border-dashed rounded-[5px] p-4 transition-all
        ${isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 'border-black/20'}
        ${isFull ? 'bg-red-50 border-red-300' : ''}
        ${isNearFull && !isFull ? 'bg-amber-50 border-amber-300' : ''}
      `}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex items-start gap-3">
        <MapPin className={`w-6 h-6 flex-shrink-0 ${
          isFull ? 'text-red-600' : 
          isNearFull ? 'text-amber-600' : 
          'text-slate-600'
        }`} />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1">{bin.code}</h3>
          <p className="text-xs text-slate-600 mb-2 truncate">{bin.name}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  isFull ? 'bg-red-500' : 
                  isNearFull ? 'bg-amber-500' : 
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700">
              {utilizationPercent.toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Package className="w-3 h-3" />
            <span>{bin.currentCapacity} / {bin.maxCapacity}</span>
          </div>

          {isFull && (
            <div className="mt-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 font-medium">
              FULL
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
