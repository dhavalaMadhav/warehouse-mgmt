import { Package, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ItemCard({ item, onClick, draggable = false }) {
  const isLowStock = item.quantity < 10;
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
  const isHighPriority = item.priority === 'HIGH';

  return (
    <div
      className={`
        border rounded-[5px] p-4 cursor-pointer transition-all hover:shadow-md
        ${isExpired ? 'border-red-500 bg-red-50' : ''}
        ${isLowStock ? 'border-amber-500 bg-amber-50' : 'border-black/10'}
        ${isHighPriority ? 'border-blue-500 bg-blue-50' : ''}
      `}
      onClick={onClick}
      draggable={draggable}
    >
      <div className="flex items-start gap-3">
        <Package className={`w-6 h-6 flex-shrink-0 ${
          isExpired ? 'text-red-600' : 
          isLowStock ? 'text-amber-600' : 
          'text-slate-600'
        }`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{item.code}</h3>
            {isHighPriority && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                HIGH
              </span>
            )}
          </div>
          
          <p className="text-sm text-slate-600 truncate mb-2">{item.name}</p>
          
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${
              isLowStock ? 'text-amber-700' : 'text-slate-700'
            }`}>
              Qty: {item.quantity}
            </span>
            
            {item.expiryDate && (
              <div className={`flex items-center gap-1 ${
                isExpired ? 'text-red-600' : 'text-slate-500'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(item.expiryDate), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>

          {isLowStock && !isExpired && (
            <div className="flex items-center gap-1 mt-2 text-amber-700 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>Low Stock Alert</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
