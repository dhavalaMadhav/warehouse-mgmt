import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { MapPin, ChevronRight, Calendar, Clock, Building, Layers, Grid3x3, Box, AlertCircle, Filter, Search, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/locations`);
        setLocations(data || []);
      } catch (err) {
        console.error('Failed to load locations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Build tree in memory based on parentLocationId
  const tree = useMemo(() => {
    const byId = new Map();
    locations.forEach((l) => {
      byId.set(l.id, { 
        ...l, 
        children: [],
        filtered: true 
      });
    });
    const roots = [];
    byId.forEach((node) => {
      if (node.parentLocationId) {
        const parent = byId.get(node.parentLocationId);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    
    // Filter based on search and type
    const filterNode = (node) => {
      const matchesSearch = search === '' || 
        node.code?.toLowerCase().includes(search.toLowerCase()) ||
        node.name?.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === 'all' || 
        node.locationType?.toLowerCase() === selectedType.toLowerCase();
      
      node.filtered = matchesSearch && matchesType;
      
      // Filter children recursively
      node.children.forEach(child => filterNode(child));
      
      // If this node doesn't match but has children that do, show it anyway
      if (!node.filtered && node.children.some(child => child.filtered)) {
        node.filtered = true;
      }
    };
    
    roots.forEach(root => filterNode(root));
    return roots.filter(root => root.filtered);
  }, [locations, search, selectedType]);

  // Count location types
  const locationStats = useMemo(() => {
    const stats = {
      warehouse: 0,
      zone: 0,
      floor: 0,
      rack: 0,
      bin: 0,
      total: locations.length
    };
    
    locations.forEach(loc => {
      const type = loc.locationType?.toLowerCase();
      if (type in stats) {
        stats[type]++;
      }
    });
    
    return stats;
  }, [locations]);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
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

  const renderNode = (node, depth = 0) => {
    const hasChildren = node.children.filter(child => child.filtered).length > 0;
    const isExpanded = expandedNodes.has(node.id);
    
    const typeConfig = {
      warehouse: { color: 'blue', icon: Building },
      zone: { color: 'emerald', icon: Grid3x3 },
      floor: { color: 'amber', icon: Layers },
      rack: { color: 'purple', icon: Box },
      bin: { color: 'gray', icon: MapPin }
    };
    
    const config = typeConfig[node.locationType?.toLowerCase()] || { color: 'black', icon: MapPin };
    const Icon = config.icon;
    
    return (
      <div key={node.id} className="border-b border-black/10 last:border-b-0">
        <div 
          className="group flex items-center py-3 px-4 hover:bg-black/2 transition-colors cursor-pointer"
          style={{ marginLeft: depth * 24 }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {/* Indentation lines */}
          {depth > 0 && (
            <div className="absolute left-0 w-6 h-px bg-black/20" style={{ marginLeft: (depth - 1) * 24 + 12 }}></div>
          )}
          
          {/* Icon */}
          <div className={`w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 bg-${config.color}-50`}>
            <Icon className={`w-4 h-4 text-${config.color}-600`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-bold text-black text-sm tracking-wide truncate">
                {node.code}
              </div>
              <div className={`text-xs font-bold px-2 py-0.5 bg-${config.color}-100 text-${config.color}-700`}>
                {node.locationType?.toUpperCase()}
              </div>
            </div>
            <div className="text-sm text-black/80 font-medium truncate">
              {node.name}
            </div>
            {node.description && (
              <div className="text-xs text-black/50 font-medium mt-1 truncate">
                {node.description}
              </div>
            )}
          </div>
          
          {/* Expand/Collapse & Status */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {node.capacity && (
              <div className="text-xs font-bold text-black/60">
                CAP: {node.capacity}
              </div>
            )}
            <div className={`w-2 h-2 rounded-full ${node.active === false ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            {hasChildren && (
              <ChevronRight className={`w-4 h-4 text-black/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            )}
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-black/10 ml-12">
            {node.children
              .filter(child => child.filtered)
              .map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                LOCATION HIERARCHY
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Storage location network across warehouse facilities
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
              <span className="font-bold text-emerald-800 tracking-widest text-sm">LOCATION SYSTEM: OPERATIONAL</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            {locations.length} TOTAL LOCATIONS
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">LOCATION STRUCTURE</h2>
          </div>
          <button className="group border border-black bg-black text-white px-4 md:px-6 py-3 hover:bg-black/90 transition-all duration-200 flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide">ADD LOCATION</span>
          </button>
        </div>

        {/* Stats and Filters */}
        <div className="border border-black/20 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-black/60" />
                <span className="text-sm font-bold text-black/80 tracking-wide">SEARCH LOCATIONS</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code, name, or type..."
                  className="w-full border border-black/20 p-3 focus:outline-none focus:border-black/40 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-black/50">
                  {tree.length} FOUND
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-black/60" />
                <span className="text-sm font-bold text-black/80 tracking-wide">FILTER BY TYPE</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'ALL TYPES', count: locations.length },
                  { key: 'warehouse', label: 'WAREHOUSE', count: locationStats.warehouse, color: 'blue' },
                  { key: 'zone', label: 'ZONE', count: locationStats.zone, color: 'emerald' },
                  { key: 'floor', label: 'FLOOR', count: locationStats.floor, color: 'amber' },
                  { key: 'rack', label: 'RACK', count: locationStats.rack, color: 'purple' },
                  { key: 'bin', label: 'BIN', count: locationStats.bin, color: 'gray' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedType(filter.key)}
                    className={`px-3 py-2 text-sm font-bold transition-colors ${
                      selectedType === filter.key 
                        ? `bg-${filter.color || 'black'} text-white` 
                        : `bg-white text-black border border-black/20 hover:border-black/40`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {filter.label}
                      <div className="text-xs opacity-70">({filter.count})</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Tree */}
      <div className="border border-black/20 mb-6">
        {/* Tree Header */}
        <div className="border-b border-black/20 bg-black/2">
          <div className="grid grid-cols-12 p-4">
            <div className="col-span-6 text-xs font-black text-black/80 tracking-widest uppercase">
              LOCATION DETAILS
            </div>
            <div className="col-span-4 text-xs font-black text-black/80 tracking-widest uppercase">
              HIERARCHY PATH
            </div>
            <div className="col-span-2 text-xs font-black text-black/80 tracking-widest uppercase">
              STATUS
            </div>
          </div>
        </div>

        {/* Tree Body */}
        <div>
          {tree.length > 0 ? (
            tree.map((root) => renderNode(root))
          ) : (
            <div className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto text-black/20 mb-4" />
              <h3 className="font-black text-black text-lg tracking-tight mb-2">NO LOCATIONS FOUND</h3>
              <p className="text-sm text-black/60 mb-4">
                {search || selectedType !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add your first location to start building your hierarchy'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Location Stats */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-2 h-6 bg-black mr-3"></div>
          <h3 className="font-black text-black tracking-tight">HIERARCHY STATISTICS</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'WAREHOUSES', value: locationStats.warehouse, color: 'blue', icon: Building },
            { label: 'ZONES', value: locationStats.zone, color: 'emerald', icon: Grid3x3 },
            { label: 'FLOORS', value: locationStats.floor, color: 'amber', icon: Layers },
            { label: 'RACKS', value: locationStats.rack, color: 'purple', icon: Box },
            { label: 'BINS', value: locationStats.bin, color: 'gray', icon: MapPin },
            { label: 'TOTAL', value: locationStats.total, color: 'black', icon: AlertCircle },
          ].map((stat, idx) => (
            <div key={idx} className="border border-black/20 p-4 hover:border-black/30 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 flex items-center justify-center bg-${stat.color}-50`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                </div>
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
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">LOCATION MANAGEMENT SYSTEM</div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Hierarchy depth: {Math.max(...locations.map(l => (l.path || '').split('/').length))} • 
              Version 3.2.1
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">SYSTEM: ONLINE</span>
            </div>
            <button className="flex items-center gap-1 text-xs font-bold text-black/70 hover:text-black transition-colors group">
              EXPORT HIERARCHY
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}