import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, User, Phone, Plus, Calendar, Clock, ChevronRight, ArrowRight, Box, CheckCircle, X, Edit, Trash2, Save, Search, Filter, Printer, ExternalLink, Upload, FileText } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function CustomerGateOut() {
  const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  const [time, setTime] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showShipmentDetail, setShowShipmentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    shipmentType: 'standard',
    priority: 'normal',
    totalWeight: '',
    totalVolume: '',
    numberOfPackages: '',
    packageDescription: '',
    deliveryInstructions: '',
    estimatedDeliveryDate: '',
    carrier: 'ups',
    trackingNumber: '',
    shippingCost: '',
    insuranceValue: '',
    status: 'pending'
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    filterShipments();
  }, [shipments, searchTerm, filterStatus]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/shipments`);
      setShipments(data || []);
    } catch (err) {
      console.error('Failed to load shipments:', err);
      // For demo purposes, use sample data if API fails
      setShipments(sampleShipments);
    } finally {
      setLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = shipments;
    
    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destinationCity?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === filterStatus);
    }
    
    setFilteredShipments(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      // Generate tracking number if not provided
      const trackingNum = formData.trackingNumber || generateTrackingNumber();
      
      const shipmentData = {
        ...formData,
        trackingNumber: trackingNum,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin User',
        lastUpdated: new Date().toISOString()
      };

      await axios.post(`${API_BASE_URL}/shipments`, shipmentData);
      setShowCreateForm(false);
      resetForm();
      fetchShipments();
    } catch (err) {
      console.error('Failed to create shipment:', err);
      alert('Failed to create shipment. Please try again.');
    }
  };

  const handleUpdateShipment = async (shipmentId, updates) => {
    try {
      await axios.put(`${API_BASE_URL}/shipments/${shipmentId}`, updates);
      fetchShipments();
    } catch (err) {
      console.error('Failed to update shipment:', err);
      alert('Failed to update shipment. Please try again.');
    }
  };

  const handleDeleteShipment = async (shipmentId) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        await axios.delete(`${API_BASE_URL}/shipments/${shipmentId}`);
        fetchShipments();
      } catch (err) {
        console.error('Failed to delete shipment:', err);
        alert('Failed to delete shipment. Please try again.');
      }
    }
  };

  const generateTrackingNumber = () => {
    const prefix = 'TRK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      destinationCity: '',
      destinationState: '',
      destinationZip: '',
      shipmentType: 'standard',
      priority: 'normal',
      totalWeight: '',
      totalVolume: '',
      numberOfPackages: '',
      packageDescription: '',
      deliveryInstructions: '',
      estimatedDeliveryDate: '',
      carrier: 'ups',
      trackingNumber: '',
      shippingCost: '',
      insuranceValue: '',
      status: 'pending'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      processing: 'bg-blue-100 text-blue-700',
      packed: 'bg-indigo-100 text-indigo-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-rose-100 text-rose-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'packed': return '📦';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  const printShippingLabel = (shipment) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - ${shipment.trackingNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
            .header { text-align: center; margin-bottom: 20px; }
            .tracking { font-size: 24px; font-weight: bold; }
            .section { margin: 15px 0; }
            .barcode { text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <h2>SHIPPING LABEL</h2>
              <div class="tracking">${shipment.trackingNumber}</div>
            </div>
            <div class="section">
              <strong>TO:</strong><br>
              ${shipment.customerName}<br>
              ${shipment.customerAddress}<br>
              ${shipment.destinationCity}, ${shipment.destinationState} ${shipment.destinationZip}
            </div>
            <div class="section">
              <strong>FROM:</strong><br>
              Warehouse Facility<br>
              123 Logistics Drive<br>
              City, State 12345
            </div>
            <div class="section">
              <strong>WEIGHT:</strong> ${shipment.totalWeight || 'N/A'} lbs<br>
              <strong>PACKAGES:</strong> ${shipment.numberOfPackages || '1'}<br>
              <strong>CARRIER:</strong> ${shipment.carrier?.toUpperCase() || 'UPS'}
            </div>
            <div class="barcode">
              <div style="font-family: 'Libre Barcode 128', cursive; font-size: 48px;">
                ${shipment.trackingNumber}
              </div>
            </div>
          </div>
          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const pendingShipments = shipments.filter(s => s.status === 'pending');
  const processingShipments = shipments.filter(s => s.status === 'processing');

  const sampleShipments = [
    {
      id: 1,
      orderId: 'ORD-2024-001',
      customerName: 'John Smith',
      customerAddress: '123 Main St, Apt 4B',
      destinationCity: 'New York',
      destinationState: 'NY',
      trackingNumber: 'TRK7890123456',
      status: 'pending',
      shipmentType: 'standard',
      priority: 'normal',
      totalWeight: '15.5',
      numberOfPackages: 3,
      estimatedDeliveryDate: '2024-01-15',
      carrier: 'ups',
      createdAt: '2024-01-10T10:30:00Z'
    },
    {
      id: 2,
      orderId: 'ORD-2024-002',
      customerName: 'Sarah Johnson',
      customerAddress: '456 Oak Avenue',
      destinationCity: 'Los Angeles',
      destinationState: 'CA',
      trackingNumber: 'TRK7890123457',
      status: 'processing',
      shipmentType: 'express',
      priority: 'high',
      totalWeight: '8.2',
      numberOfPackages: 2,
      estimatedDeliveryDate: '2024-01-12',
      carrier: 'fedex',
      createdAt: '2024-01-11T14:20:00Z'
    },
    {
      id: 3,
      orderId: 'ORD-2024-003',
      customerName: 'Mike Wilson',
      customerAddress: '789 Pine Road',
      destinationCity: 'Chicago',
      destinationState: 'IL',
      trackingNumber: 'TRK7890123458',
      status: 'packed',
      shipmentType: 'standard',
      priority: 'normal',
      totalWeight: '22.0',
      numberOfPackages: 5,
      estimatedDeliveryDate: '2024-01-14',
      carrier: 'usps',
      createdAt: '2024-01-11T09:15:00Z'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="h-24 w-24">
            <div className="absolute inset-0 border-2 border-black/10"></div>
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
            PENDING SHIPMENTS: {pendingShipments.length} • IN PROCESS: {processingShipments.length}
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
          <button 
            onClick={() => setShowCreateForm(true)}
            className="group border border-black/10 p-6 hover:border-black/30 transition-all duration-200 text-left relative overflow-hidden"
          >
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

      {/* Search and Filter Bar */}
      <div className="mb-6 border border-black/20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/50" />
            <input
              type="text"
              placeholder="Search by order ID, customer, tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-black/20 focus:outline-none focus:border-black/40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-black/50" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-black/20 py-2 px-3 focus:outline-none focus:border-black/40"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <button className="border border-black/20 px-3 py-2 text-sm font-bold hover:border-black/40 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              BULK UPLOAD
            </button>
            <button className="border border-black/20 px-3 py-2 text-sm font-bold hover:border-black/40 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              EXPORT
            </button>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      {filteredShipments.length > 0 ? (
        <div className="mb-8 border border-black/20">
          <div className="border-b border-black/20 p-4 bg-black/2">
            <div className="grid grid-cols-12 text-xs font-bold text-black/80 tracking-widest uppercase">
              <div className="col-span-2">ORDER ID</div>
              <div className="col-span-3">CUSTOMER</div>
              <div className="col-span-2">DESTINATION</div>
              <div className="col-span-2">TRACKING</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-1">ACTIONS</div>
            </div>
          </div>
          
          <div className="divide-y divide-black/10">
            {filteredShipments.map((shipment) => (
              <div key={shipment.id} className="p-4 hover:bg-black/2 transition-colors group">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-2">
                    <div className="font-bold text-black text-sm">{shipment.orderId}</div>
                    <div className="text-xs text-black/50">{new Date(shipment.createdAt).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="font-medium text-black text-sm">{shipment.customerName}</div>
                    <div className="text-xs text-black/50 truncate">{shipment.customerAddress}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-sm text-black font-medium">
                      {shipment.destinationCity}, {shipment.destinationState}
                    </div>
                    <div className="text-xs text-black/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {shipment.shipmentType?.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="font-mono text-sm text-black font-bold">{shipment.trackingNumber}</div>
                    <div className="text-xs text-black/50">{shipment.carrier?.toUpperCase()}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className={`text-xs font-bold px-2 py-1 inline-block ${getStatusColor(shipment.status)}`}>
                      {getStatusIcon(shipment.status)} {shipment.status?.toUpperCase()}
                    </div>
                    <div className="text-xs text-black/50 mt-1">
                      Est: {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowShipmentDetail(shipment)}
                        className="p-1 hover:bg-black/10 transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4 text-black/70" />
                      </button>
                      <button
                        onClick={() => printShippingLabel(shipment)}
                        className="p-1 hover:bg-black/10 transition-colors"
                        title="Print Label"
                      >
                        <Printer className="w-4 h-4 text-black/70" />
                      </button>
                      <button
                        onClick={() => handleDeleteShipment(shipment.id)}
                        className="p-1 hover:bg-black/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Main Content Area - Empty State */
        <div className="border border-black/20 p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
               style={{ clipPath: `polygon(0 0, 100% 0, 100% 70%, 0 100%)` }}>
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
            
            <button 
              onClick={() => setShowCreateForm(true)}
              className="group flex items-center gap-3 border border-black bg-black px-8 py-4 hover:bg-black/90 transition-all duration-200 relative overflow-hidden mx-auto"
            >
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
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL SHIPMENTS', value: shipments.length, icon: Package, color: 'black' },
          { label: 'PENDING', value: pendingShipments.length, icon: Clock, color: 'amber' },
          { label: 'IN TRANSIT', value: shipments.filter(s => s.status === 'shipped').length, icon: Truck, color: 'blue' },
          { label: 'DELIVERED', value: shipments.filter(s => s.status === 'delivered').length, icon: CheckCircle, color: 'emerald' },
        ].map((stat, idx) => (
          <div key={idx} className="border border-black/20 p-4 hover:border-black/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              <div className={`text-xs font-bold px-2 py-1 bg-${stat.color}-100 text-${stat.color}-700`}>
                LIVE
              </div>
            </div>
            <div className="text-2xl font-black text-black tracking-tight mb-1">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-black/80 tracking-widest uppercase">
              {stat.label}
            </div>
          </div>
        ))}
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

      {/* Create Shipment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-black/20 p-6 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-black mr-3"></div>
                  <div>
                    <h3 className="text-xl font-black text-black tracking-tight">CREATE NEW SHIPMENT</h3>
                    <div className="text-sm text-black/60 font-medium">Ship order to customer</div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateShipment}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    <div className="mb-6">
                      <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-4">
                        ORDER INFORMATION
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Order ID *</label>
                          <input
                            type="text"
                            name="orderId"
                            value={formData.orderId}
                            onChange={handleInputChange}
                            className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            required
                            placeholder="ORD-XXXX-XXXX"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Shipment Type</label>
                            <select
                              name="shipmentType"
                              value={formData.shipmentType}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            >
                              <option value="standard">Standard</option>
                              <option value="express">Express</option>
                              <option value="overnight">Overnight</option>
                              <option value="international">International</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Priority</label>
                            <select
                              name="priority"
                              value={formData.priority}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            >
                              <option value="normal">Normal</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-4">
                        PACKAGE DETAILS
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Total Weight (lbs)</label>
                            <input
                              type="number"
                              name="totalWeight"
                              value={formData.totalWeight}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                              step="0.1"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Number of Packages</label>
                            <input
                              type="number"
                              name="numberOfPackages"
                              value={formData.numberOfPackages}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                              min="1"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Package Description</label>
                          <textarea
                            name="packageDescription"
                            value={formData.packageDescription}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            placeholder="Describe package contents..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="mb-6">
                      <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-4">
                        CUSTOMER DETAILS
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Customer Name *</label>
                          <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
                            className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Phone</label>
                            <input
                              type="tel"
                              name="customerPhone"
                              value={formData.customerPhone}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Email</label>
                            <input
                              type="email"
                              name="customerEmail"
                              value={formData.customerEmail}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Delivery Address *</label>
                          <textarea
                            name="customerAddress"
                            value={formData.customerAddress}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">City</label>
                            <input
                              type="text"
                              name="destinationCity"
                              value={formData.destinationCity}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">State</label>
                            <input
                              type="text"
                              name="destinationState"
                              value={formData.destinationState}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">ZIP</label>
                            <input
                              type="text"
                              name="destinationZip"
                              value={formData.destinationZip}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-4">
                        SHIPPING OPTIONS
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Carrier</label>
                            <select
                              name="carrier"
                              value={formData.carrier}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            >
                              <option value="ups">UPS</option>
                              <option value="fedex">FedEx</option>
                              <option value="usps">USPS</option>
                              <option value="dhl">DHL</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-black mb-2">Est. Delivery Date</label>
                            <input
                              type="date"
                              name="estimatedDeliveryDate"
                              value={formData.estimatedDeliveryDate}
                              onChange={handleInputChange}
                              className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">Tracking Number</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="trackingNumber"
                              value={formData.trackingNumber}
                              onChange={handleInputChange}
                              className="flex-1 border border-black/20 p-3 focus:outline-none focus:border-black/40"
                              placeholder="Leave blank to auto-generate"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, trackingNumber: generateTrackingNumber() }))}
                              className="border border-black/20 px-4 py-2 hover:border-black/40 transition-colors"
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-black/20 p-6 sticky bottom-0 bg-white">
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="border border-black/20 px-6 py-3 text-black font-bold hover:border-black/30 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    CREATE SHIPMENT
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Detail Modal */}
      {showShipmentDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-black/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-black mr-3"></div>
                  <div>
                    <h3 className="text-xl font-black text-black tracking-tight">{showShipmentDetail.orderId}</h3>
                    <div className="text-sm text-black/60 font-medium">Shipment Details</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShipmentDetail(null)}
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
                      CUSTOMER INFORMATION
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-bold text-black">Customer</div>
                        <div className="text-sm text-black/80">{showShipmentDetail.customerName}</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">Address</div>
                        <div className="text-sm text-black/80">{showShipmentDetail.customerAddress}</div>
                        <div className="text-xs text-black/50">
                          {showShipmentDetail.destinationCity}, {showShipmentDetail.destinationState} {showShipmentDetail.destinationZip}
                        </div>
                      </div>
                      {(showShipmentDetail.customerPhone || showShipmentDetail.customerEmail) && (
                        <div className="space-y-1">
                          {showShipmentDetail.customerPhone && (
                            <div className="flex items-center gap-2 text-sm text-black/70">
                              <Phone className="w-3 h-3" />
                              {showShipmentDetail.customerPhone}
                            </div>
                          )}
                          {showShipmentDetail.customerEmail && (
                            <div className="flex items-center gap-2 text-sm text-black/70">
                              <User className="w-3 h-3" />
                              {showShipmentDetail.customerEmail}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      SHIPPING INFORMATION
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Tracking Number</span>
                        <span className="font-bold text-black">{showShipmentDetail.trackingNumber}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Carrier</span>
                        <span className="font-bold text-black">{showShipmentDetail.carrier?.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Service Type</span>
                        <span className="font-bold text-black">{showShipmentDetail.shipmentType?.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">Status</span>
                        <div className={`text-xs font-bold px-2 py-1 ${getStatusColor(showShipmentDetail.status)}`}>
                          {showShipmentDetail.status?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-6">
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      PACKAGE DETAILS
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-bold text-black">Total Weight</div>
                          <div className="text-sm text-black/80">{showShipmentDetail.totalWeight || 'N/A'} lbs</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-black">Packages</div>
                          <div className="text-sm text-black/80">{showShipmentDetail.numberOfPackages || '1'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">Estimated Delivery</div>
                        <div className="text-sm text-black/80">
                          {showShipmentDetail.estimatedDeliveryDate 
                            ? new Date(showShipmentDetail.estimatedDeliveryDate).toLocaleDateString()
                            : 'Not specified'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">Created</div>
                        <div className="text-sm text-black/80">
                          {new Date(showShipmentDetail.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                      ACTIONS
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => printShippingLabel(showShipmentDetail)}
                        className="border border-black/20 px-4 py-2 text-sm font-bold hover:border-black/40 transition-colors flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        PRINT LABEL
                      </button>
                      <button 
                        onClick={() => {
                          // Logic to update shipment status
                          const newStatus = showShipmentDetail.status === 'pending' ? 'processing' : 
                                          showShipmentDetail.status === 'processing' ? 'packed' :
                                          showShipmentDetail.status === 'packed' ? 'shipped' : 'delivered';
                          handleUpdateShipment(showShipmentDetail.id, { status: newStatus });
                          setShowShipmentDetail({ ...showShipmentDetail, status: newStatus });
                        }}
                        className="border border-black bg-black text-white px-4 py-2 text-sm font-bold hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
                        disabled={showShipmentDetail.status === 'delivered' || showShipmentDetail.status === 'cancelled'}
                      >
                        <CheckCircle className="w-4 h-4" />
                        UPDATE STATUS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-black/20 p-6">
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowShipmentDetail(null)}
                  className="border border-black/20 px-6 py-3 text-black font-bold hover:border-black/30 transition-colors"
                >
                  CLOSE
                </button>
                <button 
                  onClick={() => {
                    setShowShipmentDetail(null);
                    // Navigate to edit would go here
                  }}
                  className="border border-black bg-black text-white px-6 py-3 font-bold hover:bg-black/90 transition-colors"
                >
                  EDIT SHIPMENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}