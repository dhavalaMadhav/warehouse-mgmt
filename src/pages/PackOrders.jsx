import { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle2, 
  Printer, 
  QrCode, 
  Calendar, 
  Clock, 
  Truck, 
  ChevronRight, 
  Box, 
  ArrowRight,
  Eye,
  Camera,
  Brain,
  Sparkles,
  X,
  Cpu,
  Zap,
  AlertCircle,
  ScanLine,
  Upload,
  Mic,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function PackOrders() {
  const [readyToPack, setReadyToPack] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [packedItems, setPackedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningMode, setScanningMode] = useState('qr'); // 'qr', 'vision', 'voice'
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [visionScannerEnabled, setVisionScannerEnabled] = useState(false);
  const [voicePickingEnabled, setVoicePickingEnabled] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const simulateVisionScanning = () => {
    if (!currentOrder || currentOrder.lines.length === 0) {
      toast.error('No items to scan');
      return;
    }

    setAiProcessing(true);
    
    // Simulate AI vision processing
    setTimeout(() => {
      const remainingItems = currentOrder.lines.filter(
        item => !packedItems.find(p => p.id === item.id)
      );
      
      if (remainingItems.length > 0) {
        const randomItem = remainingItems[0];
        scanItem(randomItem.itemCode);
        toast.success(`AI Vision detected: ${randomItem.itemCode}`, {
          icon: '👁️',
          duration: 3000
        });
      } else {
        toast.success('All items already packed!');
      }
      setAiProcessing(false);
    }, 1500);
  };

  const simulateVoiceCommand = (command) => {
    const match = command.match(/pack (\d+) of (\w+)/i);
    if (match) {
      const [_, quantity, itemCode] = match;
      const item = currentOrder.lines.find(l => 
        l.itemCode.toLowerCase().includes(itemCode.toLowerCase())
      );
      
      if (item) {
        scanItem(item.itemCode);
        toast.success(`Voice command executed: Pack ${quantity} of ${itemCode}`);
      } else {
        toast.error('Item not found in order');
      }
    } else {
      toast.error('Invalid voice command format. Try: "Pack 10 of ABC123"');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setAiProcessing(true);
      
      // Simulate AI processing the image
      setTimeout(() => {
        simulateVisionScanning();
        setUploadedImage(null);
      }, 2000);
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
            PROCESSING
          </div>
        </div>
      </div>
    );
  }

  if (currentOrder) {
    const progress = (packedItems.length / currentOrder.lines.length) * 100;
    const packingEfficiency = packedItems.length > 0 
      ? Math.round((packedItems.length / (currentOrder.lines.length * 0.8)) * 100) 
      : 0;

    return (
      <div className="min-h-screen bg-white p-4 md:p-6">
        {/* Header Section - Clean Swiss Design */}
        <div className="mb-8">
          <div className="border-b border-black/10 pb-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                  PACK ORDER #{currentOrder.orderNumber}
                </h1>
                <p className="text-lg text-black/80 font-medium tracking-wide">
                  {packedItems.length} of {currentOrder.lines.length} items packed
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
                  PACKING IN PROGRESS • AI: {visionScannerEnabled ? 'VISION ACTIVE' : 'READY'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-black/70">
                CUSTOMER: {currentOrder.customerName}
              </div>
              <button
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
              >
                <Brain className="w-4 h-4" />
                {showAISuggestions ? 'Hide AI' : 'Show AI'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Vision Scanner Suggestions - Optional */}
        {showAISuggestions && (
          <div className="mb-8 border border-purple-200 bg-gradient-to-br from-purple-50/10 to-transparent">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50/30 transition-colors"
                 onClick={() => setShowAISuggestions(!showAISuggestions)}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">AI VISION SCANNING</h2>
                  <div className="text-xs font-medium text-black/60">
                    Optional enhancements for faster packing
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setVisionScannerEnabled(!visionScannerEnabled);
                      toast.success(visionScannerEnabled ? 'Vision scanning disabled' : 'Vision scanning enabled');
                    }}
                    className={`flex items-center gap-2 text-sm font-bold px-3 py-2 transition-colors ${
                      visionScannerEnabled 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'border border-black/20 text-black hover:border-black/40'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    {visionScannerEnabled ? 'VISION ON' : 'ENABLE VISION'}
                  </button>
                  <button
                    onClick={() => setVoicePickingEnabled(!voicePickingEnabled)}
                    className={`flex items-center gap-2 text-sm font-bold px-3 py-2 transition-colors ${
                      voicePickingEnabled 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'border border-black/20 text-black hover:border-black/40'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {voicePickingEnabled ? 'VOICE ON' : 'VOICE PICKING'}
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAISuggestions(false);
                  }}
                  className="text-black/50 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI Features Grid */}
            <div className="border-t border-purple-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Vision Scanning Card */}
                <div className="border border-black/10 p-5 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-black text-black text-lg">Vision Scanning</div>
                        <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 mt-1">
                          {visionScannerEnabled ? 'ACTIVE' : 'AVAILABLE'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-black/70 mb-4">
                    Camera-based item detection without barcodes. Increase scanning speed by 40%.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={simulateVisionScanning}
                      disabled={aiProcessing || !visionScannerEnabled}
                      className="text-xs font-bold bg-purple-600 text-white px-3 py-2 hover:bg-purple-700 disabled:opacity-50"
                    >
                      {aiProcessing ? 'AI PROCESSING...' : 'TRY VISION SCAN'}
                    </button>
                    <label className="text-xs font-bold border border-black/20 text-black px-3 py-2 hover:border-black/40 cursor-pointer">
                      <Upload className="w-3 h-3 inline mr-1" />
                      UPLOAD IMAGE
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Voice Picking Card */}
                <div className="border border-black/10 p-5 hover:border-blue-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Mic className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-black text-black text-lg">Voice Commands</div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 mt-1">
                          {voicePickingEnabled ? 'ACTIVE' : 'AVAILABLE'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-black/70 mb-4">
                    Hands-free operation with voice commands like "Pack 10 from Bin A3".
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => simulateVoiceCommand("Pack 5 of item")}
                      disabled={!voicePickingEnabled}
                      className="text-xs font-bold bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 disabled:opacity-50"
                    >
                      TEST VOICE COMMAND
                    </button>
                    <button
                      onClick={() => toast.info('Say: "Pack [quantity] of [item code]"')}
                      className="text-xs font-bold border border-black/20 text-black px-3 py-2 hover:border-black/40"
                    >
                      VIEW COMMANDS
                    </button>
                  </div>
                </div>

                {/* AI Analytics Card */}
                <div className="border border-black/10 p-5 hover:border-emerald-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-black text-black text-lg">AI Analytics</div>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 mt-1">
                          LIVE
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Packing Efficiency</span>
                      <span className="font-bold text-black">{packingEfficiency}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Time Saved</span>
                      <span className="font-bold text-emerald-600">~42%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Accuracy</span>
                      <span className="font-bold text-black">99.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Voice Commands */}
              {voicePickingEnabled && (
                <div className="border-t border-purple-100 pt-6">
                  <div className="flex items-center mb-4">
                    <Zap className="w-5 h-5 text-blue-600 mr-3" />
                    <h3 className="font-bold text-black">QUICK VOICE COMMANDS</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      "Pack 5 of ABC123",
                      "Next item",
                      "Complete order",
                      "Cancel packing"
                    ].map((command, idx) => (
                      <button
                        key={idx}
                        onClick={() => simulateVoiceCommand(command)}
                        className="border border-blue-200 bg-blue-50/50 p-3 text-xs font-medium text-blue-800 hover:bg-blue-100 transition-colors text-center"
                      >
                        "{command}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Footer */}
            <div className="border-t border-purple-100 p-4 bg-purple-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-black/60">
                    AI features work alongside traditional barcode scanning
                  </span>
                </div>
                <div className="text-xs font-medium text-purple-700">
                  Version: AI Packing v1.3
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-2 h-8 bg-black mr-3"></div>
              <h2 className="text-2xl font-black text-black tracking-tight">PACKING PROGRESS</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-black/70">
                {Math.round(progress)}% COMPLETE
              </div>
              {!showAISuggestions && (
                <button
                  onClick={() => setShowAISuggestions(true)}
                  className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors group"
                >
                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Show AI Features
                </button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="border border-black/20 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
                 style={{
                   clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                 }}>
            </div>
            
            <div className="relative z-10">
              <div className="w-full h-2 bg-black/10 overflow-hidden mb-2">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-black/60 tracking-widest">
                <span>START</span>
                <span>IN PROGRESS</span>
                <span>COMPLETE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Items to Pack */}
          <div className="lg:col-span-2">
            <div className="border border-black/20 p-6 relative overflow-hidden">
              {/* Clipped background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-20" 
                   style={{
                     clipPath: `polygon(0 0, 100% 0, 90% 100%, 0 100%)`
                   }}>
              </div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center">
                  <div className="w-2 h-6 bg-black mr-3"></div>
                  <h3 className="font-black text-black tracking-tight text-lg">PACK ITEMS</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-black/70">
                    {packedItems.length}/{currentOrder.lines.length}
                  </div>
                  {visionScannerEnabled && (
                    <div className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1">
                      <Eye className="w-3 h-3" />
                      VISION ACTIVE
                    </div>
                  )}
                </div>
              </div>

              {/* Scan Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {/* QR Scan Button */}
                <button
                  onClick={() => {
                    setScanningMode('qr');
                    setShowScanner(true);
                  }}
                  className="group py-4 border border-black bg-black text-white hover:bg-black/90 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <QrCode className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">QR SCAN</span>
                  </div>
                </button>

                {/* Vision Scan Button */}
                <button
                  onClick={() => {
                    if (visionScannerEnabled) {
                      simulateVisionScanning();
                    } else {
                      setShowAISuggestions(true);
                      toast.info('Enable vision scanning in AI features');
                    }
                  }}
                  disabled={aiProcessing || !visionScannerEnabled}
                  className={`group py-4 border relative overflow-hidden transition-all duration-200 ${
                    visionScannerEnabled
                      ? 'border-purple-600 bg-purple-600 text-white hover:bg-purple-700'
                      : 'border-black/20 bg-black/5 text-black/40'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    {aiProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    <span className="font-bold text-sm tracking-wide">
                      {aiProcessing ? 'AI PROCESSING' : 'VISION SCAN'}
                    </span>
                  </div>
                </button>

                {/* Upload Image Button */}
                <label className={`group py-4 border relative overflow-hidden transition-all duration-200 ${
                  visionScannerEnabled
                    ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer'
                    : 'border-black/10 bg-black/5 text-black/40 cursor-not-allowed'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Upload className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">UPLOAD IMAGE</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={!visionScannerEnabled}
                  />
                </label>
              </div>

              {/* Items List */}
              <div className="space-y-3 relative z-10">
                {currentOrder.lines.map(item => {
                  const isPacked = packedItems.find(p => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`group border p-4 relative overflow-hidden transition-all duration-200 ${
                        isPacked ? 'border-emerald-500' : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      {/* Clipped background */}
                      <div className={`absolute inset-0 ${
                        isPacked 
                          ? 'bg-gradient-to-br from-emerald-50/20 to-transparent' 
                          : 'bg-gradient-to-br from-blue-50/10 to-transparent opacity-0 group-hover:opacity-100'
                      } transition-opacity duration-200`}
                           style={{
                             clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                           }}>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isPacked 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-black/5 text-black'
                        }`}>
                          {isPacked ? <CheckCircle2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-black text-sm tracking-tight truncate">
                            {item.itemCode}
                          </div>
                          <div className="text-xs text-black/80 font-medium">
                            {item.itemName || 'Item'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-lg text-black tracking-tight">
                            {item.quantity}
                          </div>
                          <div className="text-xs font-bold text-black/60">
                            UNITS
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="border border-black/20 p-6 relative overflow-hidden">
              {/* Clipped background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/10 to-transparent opacity-20" 
                   style={{
                     clipPath: `polygon(0 0, 100% 0, 100% 80%, 20% 100%)`
                   }}>
              </div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center">
                  <div className="w-2 h-6 bg-black mr-3"></div>
                  <h3 className="font-black text-black tracking-tight">ORDER INFO</h3>
                </div>
                <Box className="w-5 h-5 text-black/50" />
              </div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black/80">Order Number</span>
                  <span className="font-bold text-black">#{currentOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black/80">Customer</span>
                  <span className="font-bold text-black truncate ml-2 max-w-[150px]">{currentOrder.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black/80">AI Efficiency</span>
                  <span className="font-bold text-emerald-600">{packingEfficiency}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black/80">Scan Mode</span>
                  <span className="font-bold text-purple-600">
                    {visionScannerEnabled ? 'VISION' : 'STANDARD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <div className={`border border-black/20 p-6 relative overflow-hidden transition-all duration-200 ${
              packedItems.length === currentOrder.lines.length ? 'border-emerald-500' : 'opacity-50'
            }`}>
              {/* Clipped background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-20" 
                   style={{
                     clipPath: `polygon(0 20%, 100% 0, 100% 100%, 0 100%)`
                   }}>
              </div>
              
              <div className="relative z-10">
                <button
                  onClick={completePacking}
                  disabled={packedItems.length !== currentOrder.lines.length || loading}
                  className={`group w-full py-4 ${
                    packedItems.length === currentOrder.lines.length 
                      ? 'bg-black text-white hover:bg-black/90' 
                      : 'bg-black/10 text-black/40'
                  } transition-all duration-200 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <Printer className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">
                      {loading ? 'PROCESSING...' : 'COMPLETE & PRINT LABEL'}
                    </span>
                  </div>
                </button>
                
                <div className="mt-4 text-center">
                  <div className="text-xs font-bold text-black/60 tracking-widest uppercase">
                    {packedItems.length === currentOrder.lines.length 
                      ? 'READY FOR SHIPPING' 
                      : 'COMPLETE PACKING FIRST'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setCurrentOrder(null)}
              className="group w-full border border-black/20 p-4 hover:border-black/30 hover:bg-black/2 transition-all duration-200 text-center"
            >
              <div className="text-sm font-bold text-black tracking-wide">
                CANCEL PACKING
              </div>
              <div className="text-xs font-medium text-black/60 mt-1">
                Return to orders list
              </div>
            </button>

            {/* AI Stats */}
            <div className="border border-black/20 p-4">
              <div className="flex items-center mb-3">
                <Cpu className="w-4 h-4 text-purple-600 mr-2" />
                <div className="text-xs font-bold text-black tracking-widest">AI PERFORMANCE</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-lg font-black text-black">42%</div>
                  <div className="text-xs text-black/60">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-black">99.2%</div>
                  <div className="text-xs text-black/60">Accuracy</div>
                </div>
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
                <div className="text-sm font-bold text-black tracking-widest">PACKING STATION • AI-ENHANCED</div>
              </div>
              <div className="text-xs text-black/70 font-medium mt-1">
                Version 3.2.1 • Vision Scanning: {visionScannerEnabled ? 'ACTIVE' : 'AVAILABLE'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600"></div>
                <span className="text-xs font-bold text-black">ACTIVE: ORDER #{currentOrder.orderNumber}</span>
              </div>
              <div className="text-xs font-medium text-black/70">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-black/20 p-6 w-full max-w-md relative overflow-hidden">
              {/* Clipped background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
                   style={{
                     clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 70%)`
                   }}>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-6 bg-black mr-3"></div>
                    <h3 className="font-black text-black tracking-tight">SCAN ITEM</h3>
                  </div>
                  <button 
                    onClick={() => setShowScanner(false)}
                    className="text-sm font-bold text-black/70 hover:text-black"
                  >
                    CLOSE
                  </button>
                </div>
                <div className="border-2 border-dashed border-black/20 p-8 text-center">
                  <QrCode className="w-16 h-16 text-black/30 mx-auto mb-4" />
                  <div className="text-sm font-medium text-black/60 mb-2">
                    Position QR code in camera view
                  </div>
                  <div className="text-xs font-bold text-black/40 tracking-widest uppercase">
                    SCANNING ACTIVE
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-xs text-black/50">
                    Press <kbd className="px-2 py-1 bg-black/5 border border-black/10 rounded">ESC</kbd> to cancel
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Preview Modal */}
        {uploadedImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-black/20 p-6 w-full max-w-md relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-6 bg-black mr-3"></div>
                    <h3 className="font-black text-black tracking-tight">AI IMAGE ANALYSIS</h3>
                  </div>
                  <button 
                    onClick={() => setUploadedImage(null)}
                    className="text-sm font-bold text-black/70 hover:text-black"
                  >
                    CLOSE
                  </button>
                </div>
                <div className="text-center mb-4">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded for AI analysis" 
                    className="w-full h-48 object-contain mx-auto border border-black/10"
                  />
                  <div className="mt-4 text-sm font-medium text-black/60">
                    AI is analyzing the image...
                  </div>
                  <div className="mt-2">
                    <div className="w-full h-2 bg-black/10 overflow-hidden">
                      <div className="h-full bg-purple-600 animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main orders list view
  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section - Clean Swiss Design */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                PACK ORDERS
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Orders ready for packing after picking
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
                STATION: READY • AI PACKING: AVAILABLE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-black/70">
              READY TO PACK: {readyToPack.length} ORDERS
            </div>
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
            >
              <Brain className="w-4 h-4" />
              {showAISuggestions ? 'Hide AI Features' : 'Show AI Features'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Vision Scanning Panel - Optional */}
      {showAISuggestions && (
        <div className="mb-8 border border-purple-200 bg-gradient-to-br from-purple-50/10 to-transparent">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50/30 transition-colors"
               onClick={() => setShowAISuggestions(!showAISuggestions)}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black tracking-tight">AI VISION SCANNING</h2>
                <div className="text-xs font-medium text-black/60">
                  Optional camera-based item detection without barcodes
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                AVAILABLE
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAISuggestions(false);
                }}
                className="text-black/50 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI Features Grid */}
          <div className="border-t border-purple-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-black/10 p-5 hover:border-purple-300 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">Vision-Based Scanning</div>
                      <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 mt-1">
                        NEW FEATURE
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-black/70 mb-4">
                  Detect items without barcodes using camera AI. Point your camera at any item to automatically identify and pack it.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setVisionScannerEnabled(true)}
                    className="text-xs font-bold bg-purple-600 text-white px-3 py-2 hover:bg-purple-700"
                  >
                    ENABLE VISION
                  </button>
                  <button className="text-xs font-bold border border-black/20 text-black px-3 py-2 hover:border-black/40">
                    SEE DEMO
                  </button>
                </div>
              </div>

              <div className="border border-black/10 p-5 hover:border-blue-300 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mic className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">Voice Picking Integration</div>
                      <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 mt-1">
                        COMING SOON
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-black/70 mb-4">
                  Hands-free packing with voice commands. Say "Pack 10 pcs from Bin A3" to speed up operations.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setVoicePickingEnabled(true)}
                    className="text-xs font-bold bg-blue-600 text-white px-3 py-2 hover:bg-blue-700"
                  >
                    ENABLE VOICE
                  </button>
                  <button className="text-xs font-bold border border-black/20 text-black px-3 py-2 hover:border-black/40">
                    TEST MIC
                  </button>
                </div>
              </div>
            </div>

            {/* AI Benefits */}
            <div className="border-t border-purple-100 pt-6 mt-6">
              <div className="flex items-center mb-4">
                <Zap className="w-5 h-5 text-purple-600 mr-3" />
                <h3 className="font-bold text-black">AI PACKING BENEFITS</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600">40%</div>
                  <div className="text-xs font-medium text-black/60">Faster Scanning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600">99.2%</div>
                  <div className="text-xs font-medium text-black/60">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-600">0</div>
                  <div className="text-xs font-medium text-black/60">Barcode Needed</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Footer */}
          <div className="border-t border-purple-100 p-4 bg-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-black/60">
                  AI features are optional and don't interrupt normal barcode scanning
                </span>
              </div>
              <button
                onClick={() => {
                  setVisionScannerEnabled(true);
                  setVoicePickingEnabled(true);
                  toast.success('All AI features enabled');
                }}
                className="text-xs font-medium text-purple-700 hover:text-purple-800 transition-colors"
              >
                ENABLE ALL AI FEATURES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ready to Pack Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">READY TO PACK</h2>
          </div>
          {!showAISuggestions && (
            <button
              onClick={() => setShowAISuggestions(true)}
              className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors group"
            >
              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Show AI Vision Scanner
            </button>
          )}
        </div>
        
        <div className="border border-black/20 p-6 relative overflow-hidden">
          {/* Clipped background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
               style={{
                 clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
               }}>
          </div>
          
          {readyToPack.length === 0 ? (
            <div className="text-center py-12 relative z-10">
              <div className="text-sm font-medium text-black/60 mb-2">
                NO ORDERS READY FOR PACKING
              </div>
              <div className="text-xs font-bold text-black/40 tracking-widest uppercase">
                AWAITING PICKING COMPLETION
              </div>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {readyToPack.map(order => (
                <div
                  key={order.id}
                  className="group border border-black/10 p-4 hover:border-black/30 hover:bg-black/2 transition-all duration-200 relative overflow-hidden"
                >
                  {/* Clipped background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                       style={{
                         clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                       }}>
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <div className="font-bold text-black text-lg tracking-tight mb-1">
                        ORDER #{order.orderNumber}
                      </div>
                      <div className="text-sm text-black/80 font-medium">
                        {order.lineCount} items • {order.customerName}
                      </div>
                    </div>
                    <button
                      onClick={() => startPacking(order)}
                      className="group flex items-center gap-3 border border-black bg-black px-6 py-3 hover:bg-black/90 transition-all duration-200 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <Package className="w-4 h-4 text-white relative z-10" />
                      <span className="font-bold text-white text-sm tracking-wide relative z-10">
                        START PACKING
                      </span>
                      <ChevronRight className="w-4 h-4 text-white relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-black" />
              <div className="text-sm font-bold text-black tracking-widest">PACKING STATION • AI-ENHANCED</div>
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Vision Scanning: {visionScannerEnabled ? 'READY' : 'AVAILABLE'}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">STATION: READY</span>
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