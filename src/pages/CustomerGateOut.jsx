import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, User, Phone, Plus, Calendar, Clock, ChevronRight, ArrowRight, Box, CheckCircle } from 'lucide-react';

export default function CustomerGateOut() {
  const [shipments, setShipments] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section - Clean Swiss Design */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                CUSTOMER GATE OUT
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Ship orders to customers
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
              <span className="font-bold text-emerald-800 tracking-widest text-sm">
                SHIPPING MODULE: READY
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            PENDING SHIPMENTS: {shipments.length}
          </div>
        </div>
      </div>

      {/* Quick Actions - Swiss Grid */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-black mr-3"></div>
          <h2 className="text-2xl font-black text-black tracking-tight">SHIPPING ACTIONS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Create Shipment Button */}
          <button className="group border border-black/10 p-6 hover:border-black/30 transition-all duration-200 text-left relative overflow-hidden">
            {/* Clipped background - Diagonal */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-transparent"></div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <Truck className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
              <Plus className="w-5 h-5 text-black/50 group-hover:text-black transition-colors" />
            </div>
            <div className="font-black text-black text-xl tracking-tight mb-2 group-hover:translate-x-1 transition-transform relative z-10">
              NEW SHIPMENT
            </div>
            <div className="text-sm text-black/80 font-medium relative z-10">
              Create a new customer shipment
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-black/70 group-hover:text-black transition-colors relative z-10">
              START SHIPPING
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Shipment History Button */}
          <button className="group border border-black/10 p-6 hover:border-black/30 transition-all duration-200 text-left relative overflow-hidden">
            {/* Clipped background - Triangle */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent"></div>
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <Package className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-black bg-black/5 px-2 py-1">
                {shipments.length}
              </span>
            </div>
            <div className="font-black text-black text-xl tracking-tight mb-2 group-hover:translate-x-1 transition-transform relative z-10">
              SHIPMENT HISTORY
            </div>
            <div className="text-sm text-black/80 font-medium relative z-10">
              View past customer deliveries
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-bold text-black/70 group-hover:text-black transition-colors relative z-10">
              VIEW HISTORY
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="border border-black/20 p-8 relative overflow-hidden">
        {/* Clipped background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
             style={{
               clipPath: `polygon(0 0, 100% 0, 100% 70%, 0 100%)`
             }}>
        </div>
        
        <div className="text-center py-16 relative z-10">
          <div className="inline-block p-10 border border-black/10 mb-8">
            <Truck className="w-20 h-20 text-black/30" />
          </div>
          
          <h3 className="text-3xl font-black text-black tracking-tight mb-4">
            NO PENDING SHIPMENTS
          </h3>
          <p className="text-lg text-black/80 font-medium mb-3">
            Pack and prepare orders for customer delivery
          </p>
          <p className="text-sm text-black/60 font-medium mb-10 max-w-lg mx-auto">
            Create shipments for customer orders, generate shipping labels, and track deliveries to external locations
          </p>
          
          <button className="group flex items-center gap-3 border border-black bg-black px-8 py-4 hover:bg-black/90 transition-all duration-200 relative overflow-hidden mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <Plus className="w-5 h-5 text-white relative z-10" />
            <span className="font-bold text-white text-sm tracking-wide relative z-10">
              CREATE SHIPMENT
            </span>
            <ArrowRight className="w-4 h-4 text-white relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-12 pt-8 border-t border-black/10 max-w-2xl mx-auto">
            <div className="text-xs font-bold text-black/40 tracking-widest uppercase mb-3">
              SHIPPING PROCESS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Package, label: "PACK ORDER", desc: "Complete packing process" },
                { icon: User, label: "VERIFY DETAILS", desc: "Check customer information" },
                { icon: Truck, label: "DISPATCH", desc: "Ship and track delivery" },
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-block p-3 border border-black/10 rounded-full mb-3">
                    <step.icon className="w-5 h-5 text-black/60" />
                  </div>
                  <div className="text-sm font-bold text-black tracking-wide mb-1">{step.label}</div>
                  <div className="text-xs text-black/50">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-black" />
              <div className="text-sm font-bold text-black tracking-widest">CUSTOMER GATE OUT SYSTEM</div>
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Ready for shipments
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">SHIPPING: READY</span>
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