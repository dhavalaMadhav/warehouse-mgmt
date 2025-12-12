import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  QrCode, 
  Calendar, 
  Clock, 
  Truck, 
  ChevronRight, 
  ArrowRight, 
  Box,
  Mic,
  Brain,
  Sparkles,
  X,
  Cpu,
  Zap,
  Volume2,
  VolumeX,
  Ear,
  MessageSquare,
  Headphones,
  Target,
  Route,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useStore } from '../store/useStore';

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
  const [time, setTime] = useState(new Date());
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [voicePickingEnabled, setVoicePickingEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [routeOptimizationLevel, setRouteOptimizationLevel] = useState('standard'); // standard, advanced, ai

  // Voice recognition simulation
  const commands = [
    { pattern: /pick\s+(\d+)\s+from\s+(\w+)/i, action: (qty, bin) => handleVoicePick(qty, bin) },
    { pattern: /next\s+item/i, action: () => goToNextStep() },
    { pattern: /previous\s+item/i, action: () => goToPreviousStep() },
    { pattern: /complete\s+pick/i, action: () => completeMultiPick() },
    { pattern: /scan\s+bin/i, action: () => setShowScanner(true) },
    { pattern: /show\s+route/i, action: () => toast.info('Route displayed') },
    { pattern: /what\s+is\s+next/i, action: () => speakNextItem() },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
        : [...prev, id]
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

      // Optimize picking route based on selected optimization level
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
      setAiProcessing(true);
      
      // Different optimization levels
      let optimizedSequence = [];
      
      if (routeOptimizationLevel === 'ai') {
        // AI-based optimization with machine learning
        const { data } = await api.post('/warehouse/ai-optimize-route', {
          locations: items.map(i => ({
            binCode: i.location?.code,
            coordinates: i.location?.coordinates,
            frequency: i.pickFrequency || 1,
            weight: i.weight || 1
          })),
        });
        optimizedSequence = data.optimizedSequence;
        toast.success('AI optimized route generated!');
      } else if (routeOptimizationLevel === 'advanced') {
        // Advanced TSP algorithm
        const { data } = await api.post('/warehouse/optimize-route', {
          locations: items.map(i => ({
            binCode: i.location?.code,
            coordinates: i.location?.coordinates,
          })),
        });
        optimizedSequence = data.optimizedSequence;
        toast.success('Advanced route optimized');
      } else {
        // Standard optimization (by zone then aisle)
        optimizedSequence = items
          .map((_, idx) => idx)
          .sort((a, b) => {
            const itemA = items[a];
            const itemB = items[b];
            return (itemA.location?.code || '').localeCompare(itemB.location?.code || '');
          });
      }

      // Re-order pick list by optimized sequence
      const optimized = optimizedSequence.map(idx => items[idx]);
      setAiProcessing(false);
      return optimized;
    } catch (err) {
      console.warn('Route optimization failed, using default order');
      setAiProcessing(false);
      return items.sort((a, b) => 
        (a.location?.code || '').localeCompare(b.location?.code || '')
      );
    }
  };

  const confirmPick = (item) => {
    addToPickCart({ ...item, pickedAt: new Date() });
    toast.success(`✓ Picked ${item.itemCode}`);
    
    // Voice feedback if enabled
    if (voicePickingEnabled) {
      speakText(`Picked ${item.quantity} of ${item.itemCode} from ${item.location?.code}`);
    }
    
    if (currentStep < optimizedRoute.length - 1) {
      setCurrentStep(prev => prev + 1);
      speakNextItem();
    } else {
      toast.success('All items picked! Ready to pack.', { duration: 5000 });
      if (voicePickingEnabled) {
        speakText('All items picked! Ready for packing.');
      }
    }
  };

  const handleVoicePick = (quantity, binCode) => {
    const currentItem = optimizedRoute[currentStep];
    if (currentItem && currentItem.location?.code === binCode.toUpperCase()) {
      confirmPick(currentItem);
    } else {
      toast.error(`Item not at bin ${binCode}`);
      speakText(`Item not found at bin ${binCode}. Please check location.`);
    }
  };

  const goToNextStep = () => {
    if (currentStep < optimizedRoute.length - 1) {
      setCurrentStep(prev => prev + 1);
      speakNextItem();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      speakPreviousItem();
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window && voicePickingEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakNextItem = () => {
    if (currentStep < optimizedRoute.length - 1) {
      const nextItem = optimizedRoute[currentStep + 1];
      speakText(`Next: Pick ${nextItem.quantity} of ${nextItem.itemCode} from ${nextItem.location?.code}`);
    }
  };

  const speakPreviousItem = () => {
    if (currentStep > 0) {
      const prevItem = optimizedRoute[currentStep - 1];
      speakText(`Previous: Pick ${prevItem.quantity} of ${prevItem.itemCode} from ${prevItem.location?.code}`);
    }
  };

  const simulateVoiceRecognition = () => {
    if (!voicePickingEnabled) {
      toast.info('Enable voice picking first');
      return;
    }

    setIsListening(true);
    setVoiceCommand('');
    
    // Simulate voice recognition
    setTimeout(() => {
      const sampleCommands = [
        `Pick ${optimizedRoute[currentStep]?.quantity} from ${optimizedRoute[currentStep]?.location?.code}`,
        'Next item',
        'Complete pick',
        'Show route',
        'What is next?'
      ];
      
      const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
      setVoiceCommand(randomCommand);
      
      // Process the command
      setTimeout(() => {
        processVoiceCommand(randomCommand);
        setIsListening(false);
      }, 1000);
    }, 2000);
  };

  const processVoiceCommand = (command) => {
    setVoiceCommand(command);
    
    for (const cmd of commands) {
      const match = command.match(cmd.pattern);
      if (match) {
        cmd.action(...match.slice(1));
        toast.success(`Voice command: ${command}`);
        return;
      }
    }
    
    toast.error('Command not recognized');
    speakText('Command not recognized. Please try again.');
  };

  const handleQRScan = (code) => {
    const currentItem = optimizedRoute[currentStep];
    if (currentItem && currentItem.location?.code === code) {
      confirmPick(currentItem);
    } else {
      toast.error('Wrong bin scanned!');
      speakText('Incorrect bin. Please check the location.');
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
      
      if (voicePickingEnabled) {
        speakText('Multi-pick completed. Orders are ready for packing.');
      }
      
      clearPickCart();
      navigate('/pack-orders');
    } catch (err) {
      toast.error('Failed to complete pick');
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

  if (optimizedRoute.length > 0) {
    const currentItem = optimizedRoute[currentStep];
    const progress = ((currentStep + 1) / optimizedRoute.length) * 100;
    const estimatedTime = Math.round((optimizedRoute.length - currentStep) * 1.5); // minutes per pick

    return (
      <div className="min-h-screen bg-white p-4 md:p-6">
        {/* Header Section - Clean Swiss Design */}
        <div className="mb-8">
          <div className="border-b border-black/10 pb-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                  PICKING IN PROGRESS
                </h1>
                <p className="text-lg text-black/80 font-medium tracking-wide">
                  Step {currentStep + 1} of {optimizedRoute.length} • {voicePickingEnabled ? 'VOICE ACTIVE' : 'MANUAL'}
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
                  PICKING: ACTIVE • {voicePickingEnabled ? 'VOICE ENABLED' : 'MANUAL MODE'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600">{Math.round(progress)}%</div>
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase">COMPLETED</div>
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

        {/* AI Voice Picking Panel - Optional */}
        {showAISuggestions && (
          <div className="mb-8 border border-purple-200 bg-gradient-to-br from-purple-50/10 to-transparent">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50/30 transition-colors"
                 onClick={() => setShowAISuggestions(!showAISuggestions)}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-black tracking-tight">AI VOICE PICKING</h2>
                  <div className="text-xs font-medium text-black/60">
                    Hands-free operation with voice commands
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setVoicePickingEnabled(!voicePickingEnabled);
                    toast.success(voicePickingEnabled ? 'Voice picking disabled' : 'Voice picking enabled');
                  }}
                  className={`flex items-center gap-2 text-sm font-bold px-3 py-2 transition-colors ${
                    voicePickingEnabled 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : 'border border-black/20 text-black hover:border-black/40'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  {voicePickingEnabled ? 'VOICE ON' : 'ENABLE VOICE'}
                </button>
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

            {/* Voice Controls */}
            <div className="border-t border-purple-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Voice Command Card */}
                <div className="border border-black/10 p-5 hover:border-purple-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-black text-black text-lg">Voice Commands</div>
                        <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 mt-1">
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm font-medium text-black/60">Try saying:</div>
                    <div className="text-xs font-mono bg-black/5 p-2 rounded">
                      "Pick {currentItem?.quantity || 5} from {currentItem?.location?.code || 'A3'}"
                    </div>
                    <div className="text-xs font-mono bg-black/5 p-2 rounded">
                      "Next item"
                    </div>
                    <div className="text-xs font-mono bg-black/5 p-2 rounded">
                      "Complete pick"
                    </div>
                  </div>
                  <button
                    onClick={simulateVoiceRecognition}
                    disabled={isListening || !voicePickingEnabled}
                    className="text-xs font-bold bg-purple-600 text-white px-3 py-2 hover:bg-purple-700 disabled:opacity-50 w-full"
                  >
                    {isListening ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        LISTENING...
                      </span>
                    ) : (
                      'TRY VOICE COMMAND'
                    )}
                  </button>
                </div>

                {/* Route Optimization Card */}
                <div className="border border-black/10 p-5 hover:border-blue-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Route className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-black text-black text-lg">AI Route Optimization</div>
                        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 mt-1">
                          {routeOptimizationLevel.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/70">Optimization Level</span>
                      <select 
                        value={routeOptimizationLevel}
                        onChange={(e) => setRouteOptimizationLevel(e.target.value)}
                        className="text-xs border border-black/20 px-2 py-1 bg-white"
                      >
                        <option value="standard">Standard</option>
                        <option value="advanced">Advanced</option>
                        <option value="ai">AI Optimized</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/70">Time Savings</span>
                      <span className="font-bold text-emerald-600">
                        {routeOptimizationLevel === 'ai' ? '45%' : 
                         routeOptimizationLevel === 'advanced' ? '30%' : '15%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/70">Distance</span>
                      <span className="font-bold text-black">
                        {optimizedRoute.length} bins
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Analytics Card */}
                <div className="border border-black/10 p-5 hover:border-emerald-300 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Cpu className="w-6 h-6 text-emerald-600" />
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
                      <span className="text-black/70">Picking Efficiency</span>
                      <span className="font-bold text-black">
                        {Math.round((currentStep + 1) / (optimizedRoute.length * 0.8) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Est. Time Left</span>
                      <span className="font-bold text-amber-600">{estimatedTime} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/70">Voice Accuracy</span>
                      <span className="font-bold text-black">94.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Command Status */}
              {voiceCommand && (
                <div className="border-t border-purple-100 pt-6">
                  <div className="flex items-center mb-4">
                    <Headphones className="w-5 h-5 text-purple-600 mr-3" />
                    <h3 className="font-bold text-black">VOICE COMMAND DETECTED</h3>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-800 mb-2">
                      You said:
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      "{voiceCommand}"
                    </div>
                    <div className="text-xs text-purple-600 mt-2">
                      Processing voice command...
                    </div>
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
                    AI features work alongside traditional scanning and manual picking
                  </span>
                </div>
                <div className="text-xs font-medium text-purple-700">
                  Version: Voice Picker v1.2
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
              <h2 className="text-2xl font-black text-black tracking-tight">PICKING PROGRESS</h2>
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
                  <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Show Voice Picking
                </button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="border border-black/20 p-6 relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-20" 
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
          {/* Left Column - Current Pick Instruction */}
          <div className="lg:col-span-2">
            <div className="border border-black/20 p-6 relative overflow-hidden">
              {/* Clipped background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
                   style={{
                     clipPath: `polygon(0 0, 100% 0, 90% 100%, 0 100%)`
                   }}>
              </div>
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-20 h-20 border border-black bg-white flex items-center justify-center text-black text-3xl font-black tracking-tight">
                  {currentStep + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h2 className="text-2xl font-black text-black tracking-tight">
                      GO TO: {currentItem.location?.code}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-black/70" />
                    <p className="text-lg text-black/80 font-medium">
                      PICK <span className="font-black text-black">{currentItem.quantity}</span> x {currentItem.itemCode}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-black/60">
                      {currentItem.itemName || 'Item Description'}
                    </p>
                    <p className="text-xs font-bold text-black/40 tracking-widest uppercase mt-1">
                      FOR {currentItem.orderIds.length} ORDERS
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setShowScanner(true)}
                      className="group flex items-center gap-3 border border-black bg-black px-6 py-3 hover:bg-black/90 transition-all duration-200 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <QrCode className="w-4 h-4 text-white relative z-10" />
                      <span className="font-bold text-white text-sm tracking-wide relative z-10">
                        SCAN BIN
                      </span>
                    </button>
                    
                    <button
                      onClick={() => confirmPick(currentItem)}
                      className="group flex items-center gap-3 border border-emerald-600 bg-emerald-600 px-6 py-3 hover:bg-emerald-700 transition-all duration-200 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <CheckCircle2 className="w-4 h-4 text-white relative z-10" />
                      <span className="font-bold text-white text-sm tracking-wide relative z-10">
                        CONFIRM PICK
                      </span>
                    </button>

                    {voicePickingEnabled && (
                      <button
                        onClick={simulateVoiceRecognition}
                        disabled={isListening}
                        className={`group flex items-center gap-3 px-6 py-3 relative overflow-hidden transition-all duration-200 ${
                          isListening 
                            ? 'border-purple-600 bg-purple-600 text-white' 
                            : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        {isListening ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                        ) : (
                          <Mic className="w-4 h-4 relative z-10" />
                        )}
                        <span className="font-bold text-sm tracking-wide relative z-10">
                          {isListening ? 'LISTENING...' : 'VOICE PICK'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Voice Command Prompt */}
                  {voicePickingEnabled && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Mic className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Try saying:</span>
                      </div>
                      <div className="text-sm font-mono text-blue-800">
                        "Pick {currentItem.quantity} from {currentItem.location?.code}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Route & Stats */}
          <div className="space-y-6">
            {/* Optimized Route */}
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
                  <h3 className="font-black text-black tracking-tight">OPTIMIZED ROUTE</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-black/50" />
                  <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1">
                    {routeOptimizationLevel.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 relative z-10">
                {optimizedRoute.map((item, idx) => (
                  <div
                    key={idx}
                    className={`group border p-3 relative overflow-hidden transition-all duration-200 ${
                      idx === currentStep
                        ? 'border-blue-500'
                        : idx < currentStep
                        ? 'border-emerald-500'
                        : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    {/* Clipped background */}
                    <div className={`absolute inset-0 ${
                      idx === currentStep ? 'bg-blue-50/20' :
                      idx < currentStep ? 'bg-emerald-50/20' :
                      'bg-black/5 opacity-0 group-hover:opacity-100'
                    } transition-opacity duration-200`}
                         style={{
                           clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                         }}>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-8 h-8 border flex items-center justify-center text-sm font-black ${
                        idx < currentStep 
                          ? 'border-emerald-600 bg-emerald-600 text-white' 
                          : idx === currentStep
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-black/20 bg-white text-black'
                      }`}>
                        {idx < currentStep ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-black text-sm tracking-tight truncate">
                          {item.location?.code || 'Unknown'}
                        </div>
                        <div className="text-xs text-black/60 font-medium truncate">
                          {item.quantity} x {item.itemCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Button */}
            <div className={`border border-black/20 p-6 relative overflow-hidden transition-all duration-200 ${
              currentStep === optimizedRoute.length - 1 ? 'border-emerald-500' : 'opacity-50'
            }`}>
              {/* Clipped background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent opacity-20" 
                   style={{
                     clipPath: `polygon(0 20%, 100% 0, 100% 100%, 0 100%)`
                   }}>
              </div>
              
              <div className="relative z-10">
                <button
                  onClick={completeMultiPick}
                  disabled={currentStep !== optimizedRoute.length - 1 || loading}
                  className={`group w-full py-4 ${
                    currentStep === optimizedRoute.length - 1 
                      ? 'bg-black text-white hover:bg-black/90' 
                      : 'bg-black/10 text-black/40'
                  } transition-all duration-200 relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">
                      {loading ? 'PROCESSING...' : 'COMPLETE MULTI-PICK'}
                    </span>
                  </div>
                </button>
                
                <div className="mt-4 text-center">
                  <div className="text-xs font-bold text-black/60 tracking-widest uppercase">
                    {currentStep === optimizedRoute.length - 1 
                      ? 'READY FOR COMPLETION' 
                      : `PICK ${optimizedRoute.length - currentStep - 1} MORE ITEMS`}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Stats */}
            <div className="border border-black/20 p-4">
              <div className="flex items-center mb-3">
                <Cpu className="w-4 h-4 text-purple-600 mr-2" />
                <div className="text-xs font-bold text-black tracking-widest">AI PERFORMANCE</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-lg font-black text-black">
                    {routeOptimizationLevel === 'ai' ? '45%' : 
                     routeOptimizationLevel === 'advanced' ? '30%' : '15%'}
                  </div>
                  <div className="text-xs text-black/60">Time Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-black">94.5%</div>
                  <div className="text-xs text-black/60">Voice Accuracy</div>
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
                <ShoppingCart className="w-5 h-5 text-black" />
                <div className="text-sm font-bold text-black tracking-widest">PICKING STATION • AI-ENHANCED</div>
              </div>
              <div className="text-xs text-black/70 font-medium mt-1">
                Version 3.2.1 • Voice Picking: {voicePickingEnabled ? 'ACTIVE' : 'AVAILABLE'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600"></div>
                <span className="text-xs font-bold text-black">ACTIVE: {selectedOrders.length} ORDERS</span>
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
                    <h3 className="font-black text-black tracking-tight">SCAN BIN QR</h3>
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
                    SCANNING FOR: {currentItem.location?.code}
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
                PICK ORDERS
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Select multiple orders for batch picking (multi-pick)
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
                STATION: READY • VOICE PICKING: AVAILABLE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-black/70">
              PENDING ORDERS: {orders.length}
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

      {/* AI Voice Picking Panel - Optional */}
      {showAISuggestions && (
        <div className="mb-8 border border-purple-200 bg-gradient-to-br from-purple-50/10 to-transparent">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50/30 transition-colors"
               onClick={() => setShowAISuggestions(!showAISuggestions)}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black tracking-tight">AI VOICE PICKING</h2>
                <div className="text-xs font-medium text-black/60">
                  Hands-free operation with voice commands like "Pick 10 pcs from Bin A3"
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                NEW FEATURE
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
                      <Mic className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">Voice Picking</div>
                      <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 mt-1">
                        AVAILABLE
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-black/70 mb-4">
                  Use voice commands for hands-free picking. Say commands like "Pick 10 pcs from Bin A3" to speed up operations.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setVoicePickingEnabled(true)}
                    className="text-xs font-bold bg-purple-600 text-white px-3 py-2 hover:bg-purple-700"
                  >
                    ENABLE VOICE
                  </button>
                  <button className="text-xs font-bold border border-black/20 text-black px-3 py-2 hover:border-black/40">
                    TEST MICROPHONE
                  </button>
                </div>
              </div>

              <div className="border border-black/10 p-5 hover:border-blue-300 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Route className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-black text-black text-lg">AI Route Optimization</div>
                      <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 mt-1">
                        SMART
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-black/70 mb-4">
                  AI calculates optimal picking routes based on bin locations, item weight, and frequency patterns.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRouteOptimizationLevel('ai')}
                    className="text-xs font-bold bg-blue-600 text-white px-3 py-2 hover:bg-blue-700"
                  >
                    ENABLE AI ROUTING
                  </button>
                  <button className="text-xs font-bold border border-black/20 text-black px-3 py-2 hover:border-black/40">
                    VIEW EXAMPLE
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Command Examples */}
            <div className="border-t border-purple-100 pt-6 mt-6">
              <div className="flex items-center mb-4">
                <Headphones className="w-5 h-5 text-purple-600 mr-3" />
                <h3 className="font-bold text-black">VOICE COMMAND EXAMPLES</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Pick 5 from A3",
                  "Next item",
                  "Complete pick",
                  "Show route",
                  "What is next?",
                  "Previous item",
                  "Scan bin",
                  "Help"
                ].map((cmd, idx) => (
                  <div key={idx} className="border border-purple-100 bg-purple-50/50 p-3 text-center">
                    <div className="text-sm font-medium text-purple-800">"{cmd}"</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Footer */}
          <div className="border-t border-purple-100 p-4 bg-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-black/60">
                  AI features are optional and don't interrupt manual picking
                </span>
              </div>
              <button
                onClick={() => {
                  setVoicePickingEnabled(true);
                  setRouteOptimizationLevel('ai');
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

      {/* Pending Orders Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">PENDING ORDERS</h2>
          </div>
          {!showAISuggestions && (
            <button
              onClick={() => setShowAISuggestions(true)}
              className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors group"
            >
              <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Show Voice Picking
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
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-black/70" />
              <h3 className="font-bold text-black text-lg">SELECT ORDERS FOR MULTI-PICK</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-black/70 bg-black/5 px-3 py-1">
                {selectedOrders.length} SELECTED
              </div>
              {voicePickingEnabled && (
                <div className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1">
                  <Mic className="w-3 h-3" />
                  VOICE READY
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6 relative z-10">
            {orders.map(order => (
              <div
                key={order.id}
                className={`group border p-4 cursor-pointer transition-all duration-200 relative overflow-hidden ${
                  selectedOrders.includes(order.id)
                    ? 'border-blue-500'
                    : 'border-black/10 hover:border-black/30'
                }`}
                onClick={() => toggleOrderSelection(order.id)}
              >
                {/* Clipped background on hover */}
                <div className={`absolute inset-0 ${
                  selectedOrders.includes(order.id)
                    ? 'bg-blue-50/20'
                    : 'bg-black/5 opacity-0 group-hover:opacity-100'
                } transition-opacity duration-200`}
                     style={{
                       clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                     }}>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                    selectedOrders.includes(order.id)
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-black/20'
                  }`}>
                    {selectedOrders.includes(order.id) && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-black text-lg tracking-tight mb-1">
                      ORDER #{order.orderNumber}
                    </div>
                    <div className="text-sm text-black/80 font-medium">
                      {order.lineCount} items • {order.customerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-black/60">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      }).toUpperCase()}
                    </div>
                    <div className="text-xs font-medium text-black/40">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <button
              onClick={generatePickList}
              disabled={selectedOrders.length === 0 || loading}
              className={`group w-full py-4 ${
                selectedOrders.length > 0
                  ? 'bg-black text-white hover:bg-black/90' 
                  : 'bg-black/10 text-black/40'
              } transition-all duration-200 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="flex items-center justify-center gap-3 relative z-10">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">
                  {loading ? 'GENERATING...' : `GENERATE PICK LIST (${selectedOrders.length} ORDERS)`}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-black" />
              <div className="text-sm font-bold text-black tracking-widest">PICKING STATION • AI-ENHANCED</div>
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Voice Picking: {voicePickingEnabled ? 'READY' : 'AVAILABLE'}
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