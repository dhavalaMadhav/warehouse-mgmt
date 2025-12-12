import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, Building, Phone, Mail, Globe, Users, Package, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/warehouses`);
      setWarehouses(data || []);
    } catch (err) {
      console.error('Failed to load warehouses');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
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
      {/* Header Section */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                WAREHOUSE NETWORK
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Manage warehouse locations and operations
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
              <span className="font-bold text-emerald-800 tracking-widest text-sm">WAREHOUSE NETWORK: OPERATIONAL</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            {warehouses.length} FACILITIES ACTIVE
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">FACILITY MANAGEMENT</h2>
          </div>
          <button className="group border border-black bg-black text-white px-4 md:px-6 py-3 hover:bg-black/90 transition-all duration-200 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide">ADD WAREHOUSE</span>
          </button>
        </div>

        {/* Network Summary */}
        <div className="border border-black/20 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Building, label: 'TOTAL WAREHOUSES', value: warehouses.length, color: 'black' },
              { icon: Package, label: 'ACTIVE FACILITIES', value: warehouses.filter(w => w.status !== 'inactive').length, color: 'emerald' },
              { icon: Users, label: 'TOTAL CAPACITY', value: '15.2K', unit: 'pallets', color: 'blue' },
              { icon: MapPin, label: 'CITIES', value: new Set(warehouses.map(w => w.city)).size, color: 'amber' },
            ].map((stat, idx) => (
              <div key={idx} className="border border-black/20 p-4 hover:border-black/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  <div className={`text-xs font-bold ${
                    idx === 0 ? 'bg-black/10 text-black' :
                    idx === 1 ? 'bg-emerald-100 text-emerald-700' :
                    idx === 2 ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  } px-2 py-1`}>
                    LIVE
                  </div>
                </div>
                <div className="text-2xl font-black text-black tracking-tight mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase">
                  {stat.label}
                </div>
                {stat.unit && (
                  <div className="text-xs text-black/50 font-medium mt-1">
                    {stat.unit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="group border border-black/20 hover:border-black/30 transition-all duration-200">
            {/* Warehouse Header */}
            <div className="border-b border-black/20 p-6 bg-black/2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-black" />
                  <div>
                    <h3 className="font-black text-black text-lg tracking-tight">{warehouse.name}</h3>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase">
                      {warehouse.code}
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 ${
                  warehouse.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                  warehouse.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 
                  'bg-black/10 text-black/60'
                }`}>
                  {warehouse.status?.toUpperCase() || 'ACTIVE'}
                </div>
              </div>
            </div>

            {/* Warehouse Details */}
            <div className="p-6">
              {/* Address */}
              <div className="mb-4">
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                  LOCATION
                </div>
                <div className="text-sm text-black/80 font-medium">
                  {warehouse.address}
                </div>
                <div className="text-xs text-black/50 font-medium mt-1">
                  {warehouse.city}, {warehouse.state} {warehouse.zipCode}
                </div>
                {warehouse.country && (
                  <div className="text-xs text-black/40 font-medium mt-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {warehouse.country}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {(warehouse.contactPerson || warehouse.phone || warehouse.email) && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    CONTACT
                  </div>
                  <div className="space-y-1">
                    {warehouse.contactPerson && (
                      <div className="text-sm text-black font-medium">
                        {warehouse.contactPerson}
                      </div>
                    )}
                    {warehouse.phone && (
                      <div className="flex items-center gap-2 text-sm text-black/70">
                        <Phone className="w-3 h-3" />
                        {warehouse.phone}
                      </div>
                    )}
                    {warehouse.email && (
                      <div className="flex items-center gap-2 text-sm text-black/70">
                        <Mail className="w-3 h-3" />
                        {warehouse.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warehouse Metrics */}
              <div className="mb-6">
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                  FACILITY METRICS
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-black/10 p-2">
                    <div className="text-xs font-bold text-black/50">CAPACITY</div>
                    <div className="font-bold text-black">
                      {warehouse.capacity || 'N/A'}
                    </div>
                  </div>
                  <div className="border border-black/10 p-2">
                    <div className="text-xs font-bold text-black/50">UTILIZATION</div>
                    <div className="font-bold text-black">
                      {warehouse.utilization ? `${warehouse.utilization}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-black/10 pt-4">
                <button 
                  onClick={() => setSelectedWarehouse(warehouse)}
                  className="flex items-center gap-1 text-xs font-bold text-black/70 hover:text-black transition-colors group"
                >
                  VIEW DETAILS
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => console.log('Edit', warehouse.id)}
                    className="p-1 hover:bg-black/10 transition-colors"
                    title="Edit Warehouse"
                  >
                    <Edit className="w-4 h-4 text-black/70" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this warehouse?')) {
                        console.log('Delete', warehouse.id);
                      }
                    }}
                    className="p-1 hover:bg-black/10 transition-colors"
                    title="Delete Warehouse"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Warehouse Card */}
        <div className="border border-black/20 border-dashed hover:border-solid hover:border-black/40 transition-all duration-200 group">
          <div className="p-12 text-center">
            <div className="w-16 h-16 border border-black/20 mx-auto mb-4 flex items-center justify-center group-hover:border-black/40 transition-colors">
              <Plus className="w-8 h-8 text-black/40 group-hover:text-black/60 transition-colors" />
            </div>
            <h3 className="font-black text-black text-lg tracking-tight mb-2">ADD NEW WAREHOUSE</h3>
            <p className="text-sm text-black/60 mb-4">
              Expand your logistics network
            </p>
            <button className="border border-black bg-black text-white px-6 py-2 font-bold hover:bg-black/90 transition-colors">
              CREATE FACILITY
            </button>
          </div>
        </div>

        {warehouses.length === 0 && (
          <div className="col-span-full">
            <div className="border border-black/20 p-12 text-center">
              <Building className="w-16 h-16 mx-auto text-black/20 mb-4" />
              <h3 className="font-black text-black text-lg tracking-tight mb-2">NO WAREHOUSES FOUND</h3>
              <p className="text-sm text-black/60 mb-6">
                Add your first warehouse to start managing your logistics network
              </p>
              <button className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors">
                CREATE FIRST WAREHOUSE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">WAREHOUSE MANAGEMENT SYSTEM</div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Last sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
              Version 3.2.1
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">NETWORK: ONLINE</span>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-black/70 hover:text-black transition-colors group">
              EXPORT NETWORK DATA
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Warehouse Detail Modal */}
      {selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black/20 max-w-4xl w-full">
            <div className="border-b border-black/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-black mr-3"></div>
                  <div>
                    <h3 className="text-xl font-black text-black tracking-tight">{selectedWarehouse.name}</h3>
                    <div className="text-sm text-black/60 font-medium">{selectedWarehouse.code}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWarehouse(null)}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div className="mb-6">
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      FACILITY INFORMATION
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-bold text-black">Address</div>
                        <div className="text-sm text-black/80">{selectedWarehouse.address}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-bold text-black">City</div>
                          <div className="text-sm text-black/80">{selectedWarehouse.city}</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-black">State</div>
                          <div className="text-sm text-black/80">{selectedWarehouse.state}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      OPERATIONAL STATUS
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Current Status</span>
                        <div className={`text-xs font-bold px-2 py-1 ${
                          selectedWarehouse.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                          selectedWarehouse.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 
                          'bg-black/10 text-black/60'
                        }`}>
                          {selectedWarehouse.status?.toUpperCase() || 'ACTIVE'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Capacity</span>
                        <span className="font-bold text-black">{selectedWarehouse.capacity || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Utilization</span>
                        <span className="font-bold text-black">{selectedWarehouse.utilization ? `${selectedWarehouse.utilization}%` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-6">
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      CONTACT DETAILS
                    </div>
                    <div className="space-y-3">
                      {selectedWarehouse.contactPerson && (
                        <div>
                          <div className="text-sm font-bold text-black">Contact Person</div>
                          <div className="text-sm text-black/80">{selectedWarehouse.contactPerson}</div>
                        </div>
                      )}
                      {selectedWarehouse.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-black/60" />
                          <span className="text-sm text-black/80">{selectedWarehouse.phone}</span>
                        </div>
                      )}
                      {selectedWarehouse.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-black/60" />
                          <span className="text-sm text-black/80">{selectedWarehouse.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      FACILITY NOTES
                    </div>
                    <div className="text-sm text-black/80 bg-black/5 p-4">
                      {selectedWarehouse.notes || 'No additional notes for this facility.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-black/20 p-6">
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedWarehouse(null)}
                  className="border border-black/20 px-6 py-3 text-black font-bold hover:border-black/30 transition-colors"
                >
                  CLOSE
                </button>
                <button 
                  onClick={() => console.log('Edit', selectedWarehouse.id)}
                  className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors"
                >
                  EDIT WAREHOUSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}