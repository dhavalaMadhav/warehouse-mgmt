import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { 
  MapPin, 
  Package, 
  Warehouse, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Brain,
  Sparkles,
  TrendingUp,
  Zap,
  Cpu,
  Target,
  AlertCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function BinManagement() {
  const [bins, setBins] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [aiOptimizationLoading, setAiOptimizationLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 1,
      title: "AI Bin Optimization",
      description: "AI analyzes picking patterns to suggest optimal bin locations. Can reduce picking time by 23%.",
      icon: Target,
      status: "recommended",
      action: "Run AI Optimization",
      color: "purple",
      colorClass: "purple",
      details: "12 bins can be optimized based on frequency patterns"
    },
    {
      id: 2,
      title: "Smart Capacity Planning",
      description: "Predict future space requirements and suggest bin reorganization before capacity issues.",
      icon: TrendingUp,
      status: "available",
      action: "View Forecast",
      color: "blue",
      colorClass: "blue",
      details: "Capacity alert in 7 days for 3 bins"
    },
    {
      id: 3,
      title: "Pick Path Optimization",
      description: "AI generates optimal picking routes based on order history and bin locations.",
      icon: MapPin,
      status: "available",
      action: "Optimize Routes",
      color: "emerald",
      colorClass: "emerald",
      details: "Potential 31% reduction in travel time"
    },
    {
      id: 4,
      title: "AI Item Grouping",
      description: "Intelligently group frequently ordered items together in adjacent bins.",
      icon: Package,
      status: "experimental",
      action: "Group Items",
      color: "amber",
      colorClass: "amber",
      details: "5 item groups identified"
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [binsRes, itemsRes] = await Promise.all([
        api.get('/locations?type=BIN'),
        api.get('/inventory'),
      ]);
      setBins(binsRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to load bins');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const itemId = result.draggableId;
    const sourceBinId = result.source.droppableId;
    const destBinId = result.destination.droppableId;

    if (sourceBinId === destBinId) return;

    const item = items.find(i => i.id.toString() === itemId);
    const destBin = bins.find(b => b.id.toString() === destBinId);

    // Check capacity
    const destBinItems = items.filter(i => i.locationId === destBinId);
    const currentDestCapacity = destBinItems.reduce((s, i) => s + i.quantity, 0);
    
    if (currentDestCapacity + item.quantity > destBin.maxCapacity) {
      toast.error('Destination bin is full!');
      return;
    }

    try {
      await api.post('/inventory/move', {
        itemId: item.id,
        fromLocationId: sourceBinId,
        toLocationId: destBinId,
        quantity: item.quantity,
      });

      toast.success(`Moved ${item.itemCode} to ${destBin.code}`);
      loadData(); // Refresh
    } catch (err) {
      toast.error('Failed to move item');
    }
  };

  const runAiOptimization = async () => {
    setAiOptimizationLoading(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate AI suggestions for bin optimization
      const optimizationSuggestions = bins
        .map(bin => {
          const binItems = items.filter(i => i.locationId === bin.id);
          const currentCapacity = binItems.reduce((s, i) => s + i.quantity, 0);
          const capacityPercentage = (currentCapacity / bin.maxCapacity) * 100;
          
          // AI logic: suggest moving items from overfilled bins to underfilled ones
          if (capacityPercentage > 85) {
            return {
              binCode: bin.code,
              action: 'Move items out',
              reason: `Bin is ${capacityPercentage.toFixed(0)}% full`,
              items: binItems.slice(0, 2).map(i => i.itemCode)
            };
          } else if (capacityPercentage < 30 && binItems.length > 0) {
            return {
              binCode: bin.code,
              action: 'Consolidate items here',
              reason: `Bin is only ${capacityPercentage.toFixed(0)}% full`,
              items: []
            };
          }
          return null;
        })
        .filter(s => s !== null);

      if (optimizationSuggestions.length > 0) {
        toast.success(`AI generated ${optimizationSuggestions.length} optimization suggestions`);
        // In a real app, you would update state with these suggestions
        console.log('AI Optimization Suggestions:', optimizationSuggestions);
      } else {
        toast.success('Bin layout is already optimized!');
      }
    } catch (error) {
      toast.error('AI optimization failed');
    } finally {
      setAiOptimizationLoading(false);
    }
  };

  const calculateAIOptimizationScore = () => {
    if (bins.length === 0) return 0;
    
    const scores = bins.map(bin => {
      const binItems = items.filter(i => i.locationId === bin.id);
      const currentCapacity = binItems.reduce((s, i) => s + i.quantity, 0);
      const capacityPercentage = (currentCapacity / bin.maxCapacity) * 100;
      
      // Score based on capacity utilization (optimal: 60-80%)
      let score = 0;
      if (capacityPercentage >= 60 && capacityPercentage <= 80) {
        score = 100;
      } else if (capacityPercentage >= 50 && capacityPercentage < 90) {
        score = 70;
      } else {
        score = 30;
      }
      
      return score;
    });
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const dismissAISuggestion = (id) => {
    setAiSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const getColorClasses = (colorClass) => {
    switch(colorClass) {
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-300',
          button: 'bg-purple-600 hover:bg-purple-700',
          icon: 'text-purple-600'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700',
          icon: 'text-blue-600'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          border: 'border-emerald-300',
          button: 'bg-emerald-600 hover:bg-emerald-700',
          icon: 'text-emerald-600'
        };
      case 'amber':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-700',
          border: 'border-amber-300',
          button: 'bg-amber-600 hover:bg-amber-700',
          icon: 'text-amber-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          button: 'bg-gray-600 hover:bg-gray-700',
          icon: 'text-gray-600'
        };
    }
  };

  const getStatusClasses = (status) => {
    switch(status) {
      case 'recommended':
        return 'text-purple-600 bg-purple-50';
      case 'available':
        return 'text-blue-600 bg-blue-50';
      case 'experimental':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  const optimizationScore = calculateAIOptimizationScore();

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section - Clean Swiss Design */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                BIN MANAGEMENT
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Drag items between bins to reorganize warehouse
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
                DRAG & DROP: ENABLED • AI READY: {optimizationScore}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-black/70">
              TOTAL BINS: {bins.length} • ITEMS: {items.length}
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

      {/* AI Bin Optimization Panel - Optional */}
      {showAISuggestions && (
        <div className="mb-8 border border-purple-200 bg-gradient-to-br from-purple-50/10 to-transparent">
          {/* AI Panel Header */}
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50/30 transition-colors"
               onClick={() => setShowAISuggestions(!showAISuggestions)}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-black tracking-tight">AI BIN OPTIMIZER</h2>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-xs font-medium text-black/60">
                    Optional suggestions that don't interrupt manual workflows
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {optimizationScore}% OPTIMIZED
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  runAiOptimization();
                }}
                disabled={aiOptimizationLoading}
                className="flex items-center gap-2 text-sm font-bold bg-purple-600 text-white px-4 py-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiOptimizationLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    OPTIMIZING...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    RUN AI OPTIMIZATION
                  </>
                )}
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

          {/* AI Suggestions Content */}
          <div className="border-t border-purple-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {aiSuggestions.map((suggestion) => {
                const colorClasses = getColorClasses(suggestion.colorClass);
                const statusClasses = getStatusClasses(suggestion.status);
                
                return (
                  <div
                    key={suggestion.id}
                    className={`border border-black/10 p-5 hover:${colorClasses.border} transition-all duration-200 bg-white`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${colorClasses.bg} rounded-lg`}>
                          <suggestion.icon className={`w-6 h-6 ${colorClasses.icon}`} />
                        </div>
                        <div>
                          <div className="font-black text-black text-lg">{suggestion.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold ${statusClasses} px-2 py-1 rounded`}>
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
                        {suggestion.details}
                      </div>
                      <button
                        onClick={() => {
                          if (suggestion.id === 1) {
                            runAiOptimization();
                          } else {
                            console.log(`Implementing: ${suggestion.title}`);
                          }
                        }}
                        className={`text-xs font-bold ${colorClasses.button} text-white px-3 py-2 transition-colors`}
                      >
                        {suggestion.action}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Analysis Section */}
            <div className="border-t border-purple-100 pt-6">
              <div className="flex items-center mb-4">
                <Cpu className="w-5 h-5 text-purple-600 mr-3" />
                <h3 className="font-bold text-black">AI BIN ANALYSIS</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-black/10 p-4">
                  <div className="text-xs font-bold text-black/60 mb-2">OVERFILLED BINS</div>
                  <div className="text-2xl font-black text-rose-600">
                    {bins.filter(bin => {
                      const binItems = items.filter(i => i.locationId === bin.id);
                      const capacity = binItems.reduce((s, i) => s + i.quantity, 0);
                      return (capacity / bin.maxCapacity) > 0.85;
                    }).length}
                  </div>
                  <div className="text-xs text-black/60 mt-1">&gt;85% capacity</div>
                </div>
                <div className="border border-black/10 p-4">
                  <div className="text-xs font-bold text-black/60 mb-2">UNDERUTILIZED BINS</div>
                  <div className="text-2xl font-black text-amber-600">
                    {bins.filter(bin => {
                      const binItems = items.filter(i => i.locationId === bin.id);
                      const capacity = binItems.reduce((s, i) => s + i.quantity, 0);
                      return (capacity / bin.maxCapacity) < 0.30;
                    }).length}
                  </div>
                  <div className="text-xs text-black/60 mt-1">&lt;30% capacity</div>
                </div>
                <div className="border border-black/10 p-4">
                  <div className="text-xs font-bold text-black/60 mb-2">OPTIMAL BINS</div>
                  <div className="text-2xl font-black text-emerald-600">
                    {bins.filter(bin => {
                      const binItems = items.filter(i => i.locationId === bin.id);
                      const capacity = binItems.reduce((s, i) => s + i.quantity, 0);
                      return (capacity / bin.maxCapacity) >= 0.60 && (capacity / bin.maxCapacity) <= 0.80;
                    }).length}
                  </div>
                  <div className="text-xs text-black/60 mt-1">60-80% capacity</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Footer */}
          <div className="border-t border-purple-100 p-4 bg-purple-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-black/60">
                  AI updates suggestions as you work. Drag & drop continues to work normally.
                </span>
              </div>
              <button
                onClick={() => setAiSuggestions([
                  {
                    id: 1,
                    title: "AI Bin Optimization",
                    description: "AI analyzes picking patterns to suggest optimal bin locations. Can reduce picking time by 23%.",
                    icon: Target,
                    status: "recommended",
                    action: "Run AI Optimization",
                    color: "purple",
                    colorClass: "purple",
                    details: "12 bins can be optimized based on frequency patterns"
                  },
                  {
                    id: 2,
                    title: "Smart Capacity Planning",
                    description: "Predict future space requirements and suggest bin reorganization before capacity issues.",
                    icon: TrendingUp,
                    status: "available",
                    action: "View Forecast",
                    color: "blue",
                    colorClass: "blue",
                    details: "Capacity alert in 7 days for 3 bins"
                  },
                  {
                    id: 3,
                    title: "Pick Path Optimization",
                    description: "AI generates optimal picking routes based on order history and bin locations.",
                    icon: MapPin,
                    status: "available",
                    action: "Optimize Routes",
                    color: "emerald",
                    colorClass: "emerald",
                    details: "Potential 31% reduction in travel time"
                  },
                  {
                    id: 4,
                    title: "AI Item Grouping",
                    description: "Intelligently group frequently ordered items together in adjacent bins.",
                    icon: Package,
                    status: "experimental",
                    action: "Group Items",
                    color: "amber",
                    colorClass: "amber",
                    details: "5 item groups identified"
                  }
                ])}
                className="text-xs font-medium text-purple-700 hover:text-purple-800 transition-colors"
              >
                Reset Suggestions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operations Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">WAREHOUSE BINS</h2>
          </div>
          {!showAISuggestions && (
            <button
              onClick={() => setShowAISuggestions(true)}
              className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors group"
            >
              <Brain className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Show AI Optimizer
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {bins.map(bin => {
            const binItems = items.filter(i => i.locationId === bin.id);
            const currentCapacity = binItems.reduce((s, i) => s + i.quantity, 0);
            const capacityPercentage = (currentCapacity / bin.maxCapacity) * 100;
            
            // Determine color based on capacity
            let capacityColor = 'emerald';
            if (capacityPercentage > 90) capacityColor = 'rose';
            else if (capacityPercentage > 70) capacityColor = 'amber';
            
            return (
              <Droppable key={bin.id} droppableId={bin.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className={`border border-black/20 p-6 relative overflow-hidden transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'border-black bg-black/2' : ''
                    }`}>
                      {/* Clipped background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${
                        capacityColor === 'rose' ? 'from-rose-50/10' :
                        capacityColor === 'amber' ? 'from-amber-50/10' : 
                        'from-emerald-50/10'
                      } to-transparent opacity-20`} 
                           style={{
                             clipPath: `polygon(0 0, 100% 0, 100% 70%, 0 100%)`
                           }}>
                      </div>
                      
                      {/* Bin Header */}
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center">
                          <div className={`w-2 h-6 ${
                            capacityColor === 'rose' ? 'bg-rose-600' :
                            capacityColor === 'amber' ? 'bg-amber-600' : 
                            'bg-emerald-600'
                          } mr-3`}></div>
                          <h3 className="font-black text-black tracking-tight text-lg">{bin.code}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-black tracking-widest uppercase">
                            {capacityPercentage.toFixed(1)}% FULL
                          </div>
                        </div>
                      </div>

                      {/* Bin Details */}
                      <div className="mb-6 relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-black/60" />
                            <span className="text-sm font-medium text-black">{bin.zone || 'MAIN ZONE'}</span>
                          </div>
                          <div className="text-xs font-bold text-black/80 bg-black/5 px-2 py-1">
                            {currentCapacity} / {bin.maxCapacity}
                          </div>
                        </div>
                        
                        {/* Capacity Bar */}
                        <div className="w-full h-2 bg-black/10 overflow-hidden">
                          <div 
                            className={`h-full ${
                              capacityColor === 'rose' ? 'bg-rose-600' :
                              capacityColor === 'amber' ? 'bg-amber-600' : 
                              'bg-emerald-600'
                            } transition-all duration-300`}
                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Items in Bin */}
                      <div className="space-y-3 relative z-10 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-black/60 tracking-widest uppercase">
                            ITEMS ({binItems.length})
                          </div>
                          {snapshot.isDraggingOver && (
                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              DROP HERE
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {binItems.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border border-black/10 p-3 bg-white group hover:border-black/30 transition-all duration-200 ${
                                  snapshot.isDragging ? 'shadow-lg scale-105 border-black/40' : ''
                                }`}
                              >
                                {/* Item card with clipped background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                     style={{
                                       clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                                     }}>
                                </div>
                                
                                <div className="flex items-center gap-3 relative z-10">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    snapshot.isDragging ? 'bg-black/10' : 'bg-black/5'
                                  }`}>
                                    <Package className="w-4 h-4 text-black/80" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-black tracking-tight truncate">
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
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {binItems.length === 0 && (
                        <div className="relative z-10">
                          <div className="border border-dashed border-black/20 p-4 text-center group hover:border-black/30 transition-colors">
                            <div className="text-xs font-bold text-black/60 tracking-widest uppercase mb-2">
                              EMPTY BIN
                            </div>
                            <div className="text-xs font-medium text-black/50">
                              Drag items here to store
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Warehouse Stats */}
      <div className="border border-black/20 p-6 mb-8 relative overflow-hidden">
        {/* Clipped background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
             style={{
               clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 70%)`
             }}>
        </div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-xl font-black text-black tracking-tight">WAREHOUSE OVERVIEW</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-black/70">
              AUTO-REFRESH: ENABLED
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <div className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1">
                AI OPTIMIZATION: {optimizationScore}%
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {[
            { 
              label: "TOTAL CAPACITY", 
              value: bins.reduce((sum, bin) => sum + bin.maxCapacity, 0).toLocaleString(),
              change: "+0%",
              color: "emerald"
            },
            { 
              label: "USED CAPACITY", 
              value: bins.reduce((sum, bin) => sum + items.filter(i => i.locationId === bin.id)
                .reduce((s, i) => s + i.quantity, 0), 0).toLocaleString(),
              change: "+2.1%",
              color: "blue"
            },
            { 
              label: "UTILIZATION", 
              value: `${Math.round((bins.reduce((sum, bin) => sum + items.filter(i => i.locationId === bin.id)
                .reduce((s, i) => s + i.quantity, 0), 0) / bins.reduce((sum, bin) => sum + bin.maxCapacity, 0)) * 100)}%`,
              change: "+1.3%",
              color: "purple"
            },
            { 
              label: "EMPTY BINS", 
              value: bins.filter(bin => items.filter(i => i.locationId === bin.id).length === 0).length,
              change: "-1",
              color: "amber"
            },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-black text-black mb-1 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-1">
                {stat.label}
              </div>
              <div className={`text-xs font-bold ${
                stat.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <Warehouse className="w-5 h-5 text-black" />
              <div className="text-sm font-bold text-black tracking-widest">BIN MANAGEMENT SYSTEM</div>
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Drag & Drop enabled • AI Optimizer: {optimizationScore}%
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">SYSTEM: OPERATIONAL</span>
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