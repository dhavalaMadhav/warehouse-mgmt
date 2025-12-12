import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  PackageCheck,
  ChevronRight,
  Activity,
  TrendingUp,
  AlertCircle,
  Calendar,
  Clock,
  Warehouse,
  BarChart3,
  MapPin,
  Brain,
  TrendingDown,
  Eye,
  Mic,
  Sparkles,
  Zap,
  Cpu,
  ChevronDown,
  X,
} from 'lucide-react';
import { initSocket } from '../utils/socket';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [gateIns, setGateIns] = useState([]);
  const [gateOuts, setGateOuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 1,
      title: "Predict Low Stock & Auto-Create PO",
      description: "AI predicts which items will run low based on sales patterns and can automatically generate purchase orders.",
      icon: TrendingDown,
      status: "active",
      suggestion: "3 items predicted to run low in next 7 days",
      action: "Review Predictions",
      color: "rose"
    },
    {
      id: 2,
      title: "AI-Based Bin Allocation",
      description: "Smart warehouse bin assignments optimize picking routes and reduce travel time by 23%.",
      icon: MapPin,
      status: "available",
      suggestion: "Optimize bin locations for 12 high-frequency items",
      action: "View Optimization Plan",
      color: "blue"
    },
    {
      id: 3,
      title: "Vision-Based Scanning",
      description: "Camera-based item detection without barcodes. Increase scanning speed by 40%.",
      icon: Eye,
      status: "available",
      suggestion: "Enable camera scanning for faster processing",
      action: "Enable Vision",
      color: "emerald"
    },
    {
      id: 4,
      title: "Voice Picking",
      description: "Hands-free operation with voice commands like 'Pick 10 from Bin A3'.",
      icon: Mic,
      status: "experimental",
      suggestion: "Try voice commands for picking tasks",
      action: "Try Demo",
      color: "purple"
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = initSocket();
    socket.on('inventory:update', (data) => {
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

    const totalValue = inventory.reduce(
      (sum, row) => sum + (Number(row.value) || 0),
      0,
    ).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return { 
      totalSkus, 
      totalQty, 
      lowStock, 
      todayGateIns, 
      todayGateOuts,
      totalValue
    };
  }, [inventory, gateIns, gateOuts]);

  const recentGateIns = useMemo(
    () => gateIns.slice().reverse().slice(0, 5),
    [gateIns],
  );
  const recentGateOuts = useMemo(
    () => gateOuts.slice().reverse().slice(0, 5),
    [gateOuts],
  );

  const handleAISuggestionClick = (suggestion) => {
    console.log('AI suggestion clicked:', suggestion.title);
    // Here you would implement the specific AI feature
    alert(`Implementing: ${suggestion.title}`);
  };

  const dismissAISuggestion = (id) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          {/* Box Border Loading Animation */}
          <div className="h-24 w-24">
            {/* Static outer box */}
            <div className="absolute inset-0 border-2 border-black/10"></div>
            {/* Rotating border box */}
            <div className="absolute inset-0 border-2 border-transparent border-t-black border-r-black animate-spin"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-black tracking-widest text-sm">
            LOADING
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section - Clean Swiss Design */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                LOGISTICS DASHBOARD
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Real-time inventory management system
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center gap-3 mb-1">
                <Calendar className="w-5 h-5 text-black/70" />
                <span className="font-bold text-black text-lg">
                  {time.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  }).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-black/70" />
                <span className="font-bold text-black text-lg">
                  {time.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status - Green bordered box */}
        <div className="flex items-center justify-between mb-8">
          <div className="border border-emerald-300 bg-emerald-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-600"></div>
              <span className="font-bold text-emerald-800 tracking-widest text-sm">SYSTEM STATUS: OPERATIONAL</span>
            </div>
          </div>
          <button
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
          >
            <Brain className="w-4 h-4" />
            {showAISuggestions ? 'Hide AI Suggestions' : 'Show AI Suggestions'}
          </button>
        </div>
      </div>

      {/* AI Suggestions Section - Optional & Collapsible */}
      {showAISuggestions && (
        <div className="mb-12 border border-purple-200 bg-gradient-to-br from-purple-50/10 to-transparent">
          {/* AI Suggestions Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-black tracking-tight">AI ENHANCEMENTS</h2>
                <p className="text-sm text-black/60 font-medium">
                  Optional suggestions that don't interrupt manual workflows
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAISuggestions(false)}
              className="text-black/50 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {aiSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`border border-black/10 p-5 hover:border-${suggestion.color}-300 transition-all duration-200 bg-white`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${suggestion.color}-50 rounded-lg`}>
                      <suggestion.icon className={`w-6 h-6 text-${suggestion.color}-600`} />
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">{suggestion.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold ${
                          suggestion.status === 'active' ? 'text-emerald-600 bg-emerald-50' :
                          suggestion.status === 'available' ? 'text-blue-600 bg-blue-50' :
                          'text-purple-600 bg-purple-50'
                        } px-2 py-1 rounded`}>
                          {suggestion.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAISuggestion(suggestion.id)}
                    className="text-black/30 hover:text-black/60 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-black/70 mb-4">
                  {suggestion.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-black/60">
                    {suggestion.suggestion}
                  </div>
                  <button
                    onClick={() => handleAISuggestionClick(suggestion)}
                    className={`text-xs font-bold bg-${suggestion.color}-600 text-white px-3 py-2 hover:bg-${suggestion.color}-700 transition-colors`}
                  >
                    {suggestion.action}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Footer Note */}
          <div className="border-t border-purple-100 p-4 bg-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-black/60">
                  AI suggestions update based on your usage patterns
                </span>
              </div>
              <button
                onClick={() => setAiSuggestions([
                  {
                    id: 1,
                    title: "Predict Low Stock & Auto-Create PO",
                    description: "AI predicts which items will run low based on sales patterns and can automatically generate purchase orders.",
                    icon: TrendingDown,
                    status: "active",
                    suggestion: "3 items predicted to run low in next 7 days",
                    action: "Review Predictions",
                    color: "rose"
                  },
                  {
                    id: 2,
                    title: "AI-Based Bin Allocation",
                    description: "Smart warehouse bin assignments optimize picking routes and reduce travel time by 23%.",
                    icon: MapPin,
                    status: "available",
                    suggestion: "Optimize bin locations for 12 high-frequency items",
                    action: "View Optimization Plan",
                    color: "blue"
                  },
                  {
                    id: 3,
                    title: "Vision-Based Scanning",
                    description: "Camera-based item detection without barcodes. Increase scanning speed by 40%.",
                    icon: Eye,
                    status: "available",
                    suggestion: "Enable camera scanning for faster processing",
                    action: "Enable Vision",
                    color: "emerald"
                  },
                  {
                    id: 4,
                    title: "Voice Picking",
                    description: "Hands-free operation with voice commands like 'Pick 10 from Bin A3'.",
                    icon: Mic,
                    status: "experimental",
                    suggestion: "Try voice commands for picking tasks",
                    action: "Try Demo",
                    color: "purple"
                  }
                ])}
                className="text-xs font-medium text-purple-700 hover:text-purple-800 transition-colors"
              >
                Reset All Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Swiss Grid */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">OPERATIONS</h2>
          </div>
          {!showAISuggestions && (
            <button
              onClick={() => setShowAISuggestions(true)}
              className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors group"
            >
              <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Show AI Suggestions
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Quick Action Button 1 */}
          <button
            onClick={() => navigate('/supplier-gate-in')}
            className="group border border-black/10 p-4 md:p-5 hover:border-black/30 transition-all duration-200 text-left relative overflow-hidden"
          >
            {/* Clipped background - Diagonal */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent clip-path-polygon"></div>
            
            <div className="flex items-start justify-between mb-3 relative z-10">
              <ArrowDownToLine className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
              {metrics.todayGateIns !== undefined && (
                <span className="text-xs font-bold text-black bg-black/5 px-2 py-1">
                  {metrics.todayGateIns}
                </span>
              )}
            </div>
            <div className="font-black text-black text-lg tracking-tight mb-1 group-hover:translate-x-1 transition-transform relative z-10">
              RECEIVE GOODS
            </div>
            <div className="text-sm text-black/80 font-medium relative z-10">
              Supplier Gate In
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-black/70 group-hover:text-black transition-colors relative z-10">
              ACCESS
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Quick Action Button 2 */}
          <button
            onClick={() => navigate('/pick-orders')}
            className="group border border-black/10 p-4 md:p-5 hover:border-black/30 transition-all duration-200 text-left relative overflow-hidden"
          >
            {/* Clipped background - Triangle */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent clip-path-triangle"></div>
            
            <div className="flex items-start justify-between mb-3 relative z-10">
              <ShoppingCart className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
              {metrics.todayGateOuts !== undefined && (
                <span className="text-xs font-bold text-black bg-black/5 px-2 py-1">
                  {metrics.todayGateOuts}
                </span>
              )}
            </div>
            <div className="font-black text-black text-lg tracking-tight mb-1 group-hover:translate-x-1 transition-transform relative z-10">
              PICK ORDERS
            </div>
            <div className="text-sm text-black/80 font-medium relative z-10">
              Order Fulfillment
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-black/70 group-hover:text-black transition-colors relative z-10">
              ACCESS
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Quick Action Button 3 */}
          <button
            onClick={() => navigate('/pack-orders')}
            className="group border border-black/10 p-4 md:p-5 hover:border-black/30 transition-all duration-200 text-left relative overflow-hidden"
          >
            {/* Clipped background - Rectangle */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-transparent clip-path-rectangle"></div>
            
            <div className="flex items-start justify-between mb-3 relative z-10">
              <PackageCheck className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-black text-black text-lg tracking-tight mb-1 group-hover:translate-x-1 transition-transform relative z-10">
              PACK & SHIP
            </div>
            <div className="text-sm text-black/80 font-medium relative z-10">
              Dispatch Center
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-black/70 group-hover:text-black transition-colors relative z-10">
              ACCESS
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Warehouse Metrics - Single Container with Unique Dividers */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-black mr-3"></div>
          <h2 className="text-2xl font-black text-black tracking-tight">WAREHOUSE METRICS</h2>
        </div>
        
        {/* Metrics Container - No background, no shadow */}
        <div className="border border-black/20">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-black/10">
            {[
              { icon: Warehouse, label: "TOTAL SKUs", value: metrics.totalSkus, change: "+2.1%", color: "blue" },
              { icon: Package, label: "TOTAL QUANTITY", value: metrics.totalQty.toLocaleString(), change: "+1.8%", color: "emerald" },
              { icon: AlertCircle, label: "LOW STOCK ALERTS", value: metrics.lowStock, change: "-0.5%", color: "amber", alert: metrics.lowStock > 0 },
              { icon: ArrowDownToLine, label: "TODAY INBOUND", value: metrics.todayGateIns, change: "+3.2%", color: "cyan" },
              { icon: ArrowUpFromLine, label: "TODAY OUTBOUND", value: metrics.todayGateOuts, change: "+2.7%", color: "rose" },
            ].map((metric, index) => (
              <div key={index} className="relative group overflow-hidden">
                {/* Custom divider - improved design */}
                {index > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-px">
                    <div className="absolute left-0 top-0 w-px h-1/4 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
                    <div className="absolute left-0 top-1/4 h-1/2 w-px bg-black/30"></div>
                    <div className="absolute left-0 bottom-0 w-px h-1/4 bg-gradient-to-t from-transparent via-black/10 to-black/30"></div>
                  </div>
                )}
                
                {/* Clipped background for metric boxes */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-50/20 to-transparent opacity-30`} 
                     style={{
                       clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                     }}>
                </div>
                
                <div className="p-6 text-center hover:bg-black/2 transition-colors relative z-10">
                  <div className="flex justify-center mb-4">
                    <metric.icon className={`w-8 h-8 ${metric.alert ? 'text-amber-600' : 'text-black'}`} />
                  </div>
                  <div className="text-3xl font-black text-black mb-1 tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    {metric.label}
                  </div>
                  <div className={`text-xs font-bold ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory Section */}
        <div className="lg:col-span-2">
          <div className="border border-black/20 p-6 relative overflow-hidden">
            {/* Clipped background for inventory section */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 to-transparent opacity-20" 
                 style={{
                   clipPath: `polygon(0 0, 100% 0, 90% 100%, 0 100%)`
                 }}>
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center">
                <div className="w-2 h-8 bg-black mr-3"></div>
                <h2 className="text-xl font-black text-black tracking-tight">INVENTORY ANALYSIS</h2>
              </div>
              <button 
                onClick={() => navigate('/inventory')}
                className="flex items-center gap-1 text-sm font-bold text-black hover:text-black/70 transition-colors group"
              >
                VIEW FULL INVENTORY
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="overflow-auto relative z-10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/20">
                    <th className="text-left py-4 px-2 text-xs font-black text-black/80 tracking-widest uppercase">
                      ITEM
                    </th>
                    <th className="text-left py-4 px-2 text-xs font-black text-black/80 tracking-widest uppercase">
                      LOCATION
                    </th>
                    <th className="text-left py-4 px-2 text-xs font-black text-black/80 tracking-widest uppercase">
                      QTY
                    </th>
                    <th className="text-left py-4 px-2 text-xs font-black text-black/80 tracking-widest uppercase">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventory
                    .slice()
                    .sort((a, b) => (Number(b.quantity) || 0) - (Number(a.quantity) || 0))
                    .slice(0, 8)
                    .map((row, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-black/10 hover:bg-black/2 transition-colors group"
                      >
                        <td className="py-4 px-2">
                          <div className="font-bold text-black text-sm tracking-wide">
                            {row.itemCode || row.item?.code}
                          </div>
                          <div className="text-xs text-black/80 font-medium truncate max-w-[200px]">
                            {row.itemName || row.item?.name}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-black/60" />
                            <span className="font-bold text-black text-sm">
                              {row.locationCode || row.location?.code}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="font-black text-lg text-black tracking-tight">
                            {row.quantity}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className={`inline-block h-2 w-2 ${
                            (Number(row.quantity) || 0) < 10 
                              ? 'bg-amber-600' 
                              : 'bg-emerald-600'
                          }`}></div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activities */}
        <div className="space-y-4">
          {/* Recent Gate Ins */}
          <div className="border border-black/20 p-6 relative overflow-hidden">
            {/* Clipped background for recent gate ins */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/10 to-transparent opacity-20" 
                 style={{
                   clipPath: `polygon(0 0, 100% 0, 100% 80%, 20% 100%)`
                 }}>
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center">
                <div className="w-2 h-6 bg-black mr-3"></div>
                <h3 className="font-black text-black tracking-tight">RECENT INBOUND</h3>
              </div>
              <span className="text-xs font-bold text-black/60">{recentGateIns.length}</span>
            </div>
            
            <div className="space-y-2 relative z-10">
              {recentGateIns.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-black/2 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-black/60" />
                      <span className="font-bold text-black text-sm truncate">{g.vehicleNo}</span>
                    </div>
                    <div className="text-xs text-black/70 font-medium truncate">
                      {g.supplierName || g.sourceWarehouseName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-black">
                      {(g.createdAt || g.gateInDate || '').slice(11, 16)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Gate Outs */}
          <div className="border border-black/20 p-6 relative overflow-hidden">
            {/* Clipped background for recent gate outs */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/10 to-transparent opacity-20" 
                 style={{
                   clipPath: `polygon(0 20%, 100% 0, 100% 100%, 0 100%)`
                 }}>
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center">
                <div className="w-2 h-6 bg-black mr-3"></div>
                <h3 className="font-black text-black tracking-tight">RECENT OUTBOUND</h3>
              </div>
              <span className="text-xs font-bold text-black/60">{recentGateOuts.length}</span>
            </div>
            
            <div className="space-y-2 relative z-10">
              {recentGateOuts.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-black/2 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-black/60" />
                      <span className="font-bold text-black text-sm truncate">{g.vehicleNo}</span>
                    </div>
                    <div className="text-xs text-black/70 font-medium truncate">
                      {g.customerName || g.destinationWarehouseName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-black">
                      {(g.createdAt || g.gateOutDate || '').slice(11, 16)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="border border-black p-6 bg-black relative overflow-hidden">
            {/* Clipped pattern for performance */}
            <div className="absolute inset-0 opacity-5" 
                 style={{
                   backgroundImage: `linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white),
                                   linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%, white)`,
                   backgroundSize: '20px 20px',
                   backgroundPosition: '0 0, 10px 10px'
                 }}>
            </div>
            
            <div className="flex items-center mb-4 relative z-10">
              <BarChart3 className="w-5 h-5 text-white mr-3" />
              <h3 className="font-black text-white tracking-tight">PERFORMANCE</h3>
            </div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Efficiency</span>
                <span className="font-bold text-white">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Accuracy</span>
                <span className="font-bold text-emerald-400">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Processing Time</span>
                <span className="font-bold text-white">42min</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/30 relative z-10">
              <div className="text-xs font-bold text-white/80 tracking-widest">
                +12% vs last week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">LOGISTICS MANAGEMENT SYSTEM</div>
            <div className="text-xs text-black/70 font-medium mt-1">Version 3.2.1 • Last Updated: Today</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">SYSTEM: ONLINE</span>
            </div>
            <div className="text-xs font-medium text-black/70">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}