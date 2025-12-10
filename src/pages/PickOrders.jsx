import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, MapPin, Navigation, CheckCircle2, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useStore } from '../store/useStore';
import SectionCard from '../components/SectionCard.jsx';
import QRScanner from '../components/QRScanner.jsx';

export default function PickOrders() {
  const navigate = useNavigate();
  const { pickCart, addToPickCart, removeFromPickCart, clearPickCart } = useStore();
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [pickList, setPickList] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      const { data } = await api.get('/orders?status=pending');
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders');
    }
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const generatePickList = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Select at least one order');
      return;
    }

    setLoading(true);
    try {
      // Fetch detailed order lines
      const { data } = await api.post('/orders/generate-pick-list', {
        orderIds: selectedOrders,
      });

      // Consolidate items from multiple orders
      const consolidated = consolidateItems(data.lines);
      setPickList(consolidated);

      // Optimize picking route (shortest path)
      const optimized = await optimizePickingRoute(consolidated);
      setOptimizedRoute(optimized);

      toast.success(`Multi-pick list generated for ${selectedOrders.length} orders`);
    } catch (err) {
      toast.error('Failed to generate pick list');
    } finally {
      setLoading(false);
    }
  };

  const consolidateItems = (lines) => {
    const map = {};
    lines.forEach(line => {
      const key = `${line.itemId}-${line.locationId}`;
      if (map[key]) {
        map[key].quantity += line.quantity;
        map[key].orderIds.push(line.orderId);
      } else {
        map[key] = {
          ...line,
          orderIds: [line.orderId],
        };
      }
    });
    return Object.values(map);
  };

  const optimizePickingRoute = async (items) => {
    try {
      // Call backend TSP solver
      const { data } = await api.post('/warehouse/optimize-route', {
        locations: items.map(i => ({
          binCode: i.location?.code,
          coordinates: i.location?.coordinates, // {x, y, z}
        })),
      });
      
      // Re-order pick list by optimized sequence
      return data.optimizedSequence.map(idx => items[idx]);
    } catch (err) {
      console.warn('Route optimization failed, using default order');
      return items.sort((a, b) => 
        (a.location?.code || '').localeCompare(b.location?.code || '')
      );
    }
  };

  const confirmPick = (item) => {
    addToPickCart({ ...item, pickedAt: new Date() });
    toast.success(`✓ Picked ${item.itemCode}`);
    
    if (currentStep < optimizedRoute.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.success('All items picked! Ready to pack.', { duration: 5000 });
    }
  };

  const handleQRScan = (code) => {
    const currentItem = optimizedRoute[currentStep];
    if (currentItem && currentItem.location?.code === code) {
      confirmPick(currentItem);
    } else {
      toast.error('Wrong bin scanned!');
    }
  };

  const completeMultiPick = async () => {
    setLoading(true);
    try {
      await api.post('/picks/complete', {
        orderIds: selectedOrders,
        pickedItems: pickCart,
      });

      toast.success('Multi-pick completed! Orders moved to packing.');
      clearPickCart();
      navigate('/pack-orders');
    } catch (err) {
      toast.error('Failed to complete pick');
    } finally {
      setLoading(false);
    }
  };

  if (optimizedRoute.length > 0) {
    const currentItem = optimizedRoute[currentStep];
    const progress = ((currentStep + 1) / optimizedRoute.length) * 100;

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-black">Picking in Progress</h1>
            <p className="text-black/70">
              Step {currentStep + 1} of {optimizedRoute.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{progress.toFixed(0)}%</div>
            <div className="text-xs text-black/70 uppercase">Completed</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Current pick instruction */}
        <SectionCard className="mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-lg bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {currentStep + 1}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-bold text-black">
                  Go to: {currentItem.location?.code}
                </h2>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-slate-600" />
                <p className="text-lg text-black/80">
                  Pick <span className="font-semibold">{currentItem.quantity}</span> x {currentItem.itemCode}
                </p>
              </div>

              <p className="text-sm text-black/60 mb-4">
                {currentItem.itemName}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-[5px] hover:bg-black/80"
                >
                  <QrCode className="w-4 h-4" />
                  Scan Bin
                </button>
                
                <button
                  onClick={() => confirmPick(currentItem)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-[5px] hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Pick
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Walking route preview */}
        <SectionCard>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Optimized Route
          </h3>
          <div className="space-y-2">
            {optimizedRoute.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 border rounded-[5px] ${
                  idx === currentStep
                    ? 'border-blue-500 bg-blue-50'
                    : idx < currentStep
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-black/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx < currentStep ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-black'
                }`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-black">{item.location?.code}</div>
                  <div className="text-xs text-black/60">
                    {item.quantity} x {item.itemCode}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentStep === optimizedRoute.length - 1 && (
            <button
              onClick={completeMultiPick}
              disabled={loading}
              className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-[5px] font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Multi-Pick'}
            </button>
          )}
        </SectionCard>

        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-black mb-2">Pick Orders</h1>
      <p className="text-black/70 mb-6">
        Select multiple orders for batch picking (multi-pick)
      </p>

      <SectionCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Pending Orders</h2>
          <div className="text-sm text-black/70">
            {selectedOrders.length} selected
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {orders.map(order => (
            <div
              key={order.id}
              className={`flex items-center gap-3 p-4 border rounded-[5px] cursor-pointer transition-all ${
                selectedOrders.includes(order.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-black/10 hover:border-black/30'
              }`}
              onClick={() => toggleOrderSelection(order.id)}
            >
              <input
                type="checkbox"
                checked={selectedOrders.includes(order.id)}
                onChange={() => {}}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-medium text-black">Order #{order.orderNumber}</div>
                <div className="text-sm text-black/60">
                  {order.lineCount} items • {order.customerName}
                </div>
              </div>
              <div className="text-xs text-black/70">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={generatePickList}
          disabled={selectedOrders.length === 0 || loading}
          className="w-full py-3 bg-blue-600 text-white rounded-[5px] font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? 'Generating...' : `Generate Pick List (${selectedOrders.length} orders)`}
        </button>
      </SectionCard>
    </div>
  );
}
