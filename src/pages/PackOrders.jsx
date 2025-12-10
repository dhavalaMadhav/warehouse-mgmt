import { useState, useEffect } from 'react';
import { Package, CheckCircle2, Printer, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SectionCard from '../components/SectionCard.jsx';
import QRScanner from '../components/QRScanner.jsx';

export default function PackOrders() {
  const [readyToPack, setReadyToPack] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [packedItems, setPackedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReadyToPack();
  }, []);

  const loadReadyToPack = async () => {
    try {
      const { data } = await api.get('/orders?status=picked');
      setReadyToPack(data);
    } catch (err) {
      console.error('Failed to load orders');
    }
  };

  const startPacking = (order) => {
    setCurrentOrder(order);
    setPackedItems([]);
  };

  const scanItem = (code) => {
    const item = currentOrder.lines.find(l => l.itemCode === code);
    if (!item) {
      toast.error('Item not in this order!');
      return;
    }

    if (packedItems.find(p => p.id === item.id)) {
      toast.error('Already packed!');
      return;
    }

    setPackedItems(prev => [...prev, item]);
    toast.success(`✓ Packed ${item.itemCode}`);

    if (packedItems.length + 1 === currentOrder.lines.length) {
      toast.success('All items packed!', { duration: 5000 });
    }
  };

  const completePacking = async () => {
    setLoading(true);
    try {
      await api.post(`/orders/${currentOrder.id}/pack`, {
        packedItems,
      });

      // Auto-generate shipping label
      const { data } = await api.get(`/orders/${currentOrder.id}/shipping-label`);
      
      toast.success('Order packed! Shipping label generated.');
      
      // Print label (browser print dialog)
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(data.labelHtml);
      printWindow.document.close();
      printWindow.print();

      setCurrentOrder(null);
      loadReadyToPack();
    } catch (err) {
      toast.error('Failed to complete packing');
    } finally {
      setLoading(false);
    }
  };

  if (currentOrder) {
    const progress = (packedItems.length / currentOrder.lines.length) * 100;

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-black">Packing Order #{currentOrder.orderNumber}</h1>
            <p className="text-black/70">
              {packedItems.length} of {currentOrder.lines.length} items packed
            </p>
          </div>
          <button
            onClick={() => setCurrentOrder(null)}
            className="px-4 py-2 border border-black/10 rounded-[5px] hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

        {/* Progress */}
        <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <SectionCard className="mb-6">
          <h2 className="text-lg font-semibold text-black mb-4">Pack Items</h2>
          
          <button
            onClick={() => setShowScanner(true)}
            className="w-full mb-6 py-3 bg-blue-600 text-white rounded-[5px] font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Scan Item to Pack
          </button>

          <div className="space-y-2">
            {currentOrder.lines.map(item => {
              const isPacked = packedItems.find(p => p.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-4 border rounded-[5px] ${
                    isPacked ? 'border-emerald-500 bg-emerald-50' : 'border-black/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isPacked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-black'
                  }`}>
                    {isPacked ? '✓' : ''}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black">{item.itemCode}</div>
                    <div className="text-sm text-black/60">Qty: {item.quantity}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {packedItems.length === currentOrder.lines.length && (
            <button
              onClick={completePacking}
              disabled={loading}
              className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-[5px] font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              {loading ? 'Processing...' : 'Complete & Print Label'}
            </button>
          )}
        </SectionCard>

        {showScanner && (
          <QRScanner
            onScan={scanItem}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-black mb-2">Pack Orders</h1>
      <p className="text-black/70 mb-6">
        Orders ready for packing after picking
      </p>

      <SectionCard>
        <h2 className="text-lg font-semibold text-black mb-4">Ready to Pack</h2>
        
        {readyToPack.length === 0 ? (
          <div className="text-center py-12 text-black/50">
            No orders ready for packing
          </div>
        ) : (
          <div className="space-y-3">
            {readyToPack.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border border-black/10 rounded-[5px] hover:border-black/30 transition-all"
              >
                <div>
                  <div className="font-medium text-black">Order #{order.orderNumber}</div>
                  <div className="text-sm text-black/60">
                    {order.lineCount} items • {order.customerName}
                  </div>
                </div>
                <button
                  onClick={() => startPacking(order)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-[5px] hover:bg-blue-700 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Start Packing
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
