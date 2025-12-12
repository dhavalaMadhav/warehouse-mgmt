import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Sparkles, Send, Bot, ChevronRight, Brain, Mic, MapPin, Warehouse, X, Eye, TrendingUp, Cpu } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function SearchAssistant() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/locations`).then(res => setLocations(res.data));
  }, []);

  // AI-powered suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const matches = locations.filter(l => 
        l.code?.toLowerCase().includes(q) || 
        l.name?.toLowerCase().includes(q) ||
        l.locationType?.toLowerCase().includes(q)
      ).slice(0, 5);

      const aiSuggestions = matches.map(l => ({
        type: l.locationType,
        code: l.code,
        name: l.name,
        suggestion: `${l.locationType}: ${l.code} – ${l.name}`
      }));

      setSuggestions(aiSuggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, locations]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    const matches = locations.filter(l => 
      l.code?.toLowerCase().includes(query.toLowerCase()) || 
      l.name?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(matches);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', text: chatInput };
    setChat(prev => [...prev, userMsg]);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(chatInput);
      setChat(prev => [...prev, { role: 'bot', text: botResponse }]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 800);

    setChatInput('');
  };

  const generateBotResponse = (input) => {
    const lower = input.toLowerCase();
    
    if (lower.includes('bin') || lower.includes('rack')) {
      const bins = locations.filter(l => l.locationType === 'BIN');
      return bins.length 
        ? `Found ${bins.length} bins. Top: ${bins.slice(0, 3).map(b => b.code).join(', ')}`
        : 'No bins found in the system.';
    }
    
    if (lower.includes('zone')) {
      const zones = locations.filter(l => l.locationType === 'ZONE');
      return zones.length 
        ? `${zones.length} zones available: ${zones.map(z => z.code).join(', ')}`
        : 'No zones configured.';
    }

    if (lower.includes('inventory') || lower.includes('stock')) {
      return 'Check the Dashboard or Analytics page for real-time inventory levels.';
    }

    return `I understand you're asking about "${input}". Try searching for bins, racks, zones, or inventory levels.`;
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section - Swiss Design */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                SEARCH ASSISTANT
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                AI-powered location intelligence system
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600"></div>
                  <span className="font-bold text-black text-sm">SYSTEM: ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Status Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="border border-blue-300 bg-blue-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-600"></div>
              <span className="font-bold text-blue-800 tracking-widest text-sm">AI ASSISTANT: ACTIVE</span>
            </div>
          </div>
          <button
            onClick={() => setShowAISuggestions(!showAISuggestions)}
            className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
          >
            <Brain className="w-4 h-4" />
            {showAISuggestions ? 'Hide Tips' : 'Show Tips'}
          </button>
        </div>
      </div>

      {/* AI Tips Section */}
      {showAISuggestions && (
        <div className="mb-8 border border-black/10">
          <div className="flex items-center justify-between p-4 border-b border-black/10">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-black">QUICK TIPS</span>
            </div>
            <button
              onClick={() => setShowAISuggestions(false)}
              className="text-black/30 hover:text-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            <div className="border border-black/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-black">VOICE SEARCH</span>
              </div>
              <p className="text-xs text-black/70">Say "Find bin A3"</p>
            </div>
            <div className="border border-black/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-black">VISUAL SEARCH</span>
              </div>
              <p className="text-xs text-black/70">Upload location photos</p>
            </div>
            <div className="border border-black/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-black">PREDICTIVE</span>
              </div>
              <p className="text-xs text-black/70">Suggest frequently used</p>
            </div>
            <div className="border border-black/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-black">REAL-TIME</span>
              </div>
              <p className="text-xs text-black/70">Live inventory updates</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Search */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">INTELLIGENT SEARCH</h2>
          </div>

          <div className="border border-black/20 p-6 relative overflow-hidden">
            {/* Clipped background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
                 style={{
                   clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
                 }}>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-black text-lg">AI LOCATION FINDER</h3>
                  <p className="text-sm text-black/70 font-medium">Smart search with predictive suggestions</p>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative mb-6 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/50 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Type bin, rack, zone, or location code..."
                  className="w-full pl-12 pr-4 py-4 border border-black/20 bg-white text-black text-sm font-medium tracking-wide focus:outline-none focus:border-black/40 transition-colors placeholder:text-black/50"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-black text-white text-xs font-bold hover:bg-black/90 transition-colors"
                >
                  SEARCH
                </button>
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-black tracking-widest">AI PREDICTIONS</span>
                    </div>
                    <span className="text-xs font-bold text-black/60">{suggestions.length}</span>
                  </div>
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(s.code); handleSearch(); }}
                        className="w-full text-left p-3 border border-black/10 hover:border-black/30 bg-white group transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-black text-sm">{s.type}</span>
                          <ChevronRight className="w-4 h-4 text-black/30 group-hover:text-black transition-colors" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-black text-sm font-medium">{s.code}</div>
                            <div className="text-xs text-black/70 truncate">{s.name}</div>
                          </div>
                          <div className="text-xs font-bold text-black/60">→</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {results.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-black tracking-widest">SEARCH RESULTS</span>
                    <span className="text-xs font-bold text-black/60">{results.length} FOUND</span>
                  </div>
                  <div className="space-y-3">
                    {results.map((r, i) => (
                      <div key={i} className="border border-black/10 p-4 hover:bg-black/2 transition-colors group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              r.locationType === 'BIN' ? 'bg-emerald-50' :
                              r.locationType === 'ZONE' ? 'bg-blue-50' :
                              r.locationType === 'RACK' ? 'bg-amber-50' : 'bg-slate-50'
                            }`}>
                              <Warehouse className={`w-5 h-5 ${
                                r.locationType === 'BIN' ? 'text-emerald-600' :
                                r.locationType === 'ZONE' ? 'text-blue-600' :
                                r.locationType === 'RACK' ? 'text-amber-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div>
                              <div className="font-black text-black text-lg tracking-tight">{r.code}</div>
                              <div className="text-xs font-bold text-black/70 uppercase">{r.locationType}</div>
                            </div>
                          </div>
                          <MapPin className="w-5 h-5 text-black/30 group-hover:text-black/60 transition-colors" />
                        </div>
                        <div className="text-sm text-black/80 font-medium">{r.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Chat Assistant */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">AI CHAT ASSISTANT</h2>
          </div>

          <div className="border border-black/20 h-full flex flex-col relative overflow-hidden">
            {/* Clipped background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/10 to-transparent opacity-20" 
                 style={{
                   clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 80%)`
                 }}>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Chat Header */}
              <div className="border-b border-black/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-black text-lg">WAREHOUSE ASSISTANT</h3>
                    <p className="text-sm text-black/70 font-medium">Ask about locations, inventory, or operations</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chat.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-black/5 rounded-full mb-4">
                      <Brain className="w-8 h-8 text-black/50" />
                    </div>
                    <h4 className="font-bold text-black text-lg mb-2">START A CONVERSATION</h4>
                    <p className="text-sm text-black/60 font-medium mb-6">
                      Ask about warehouse locations, inventory status, or operational queries
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setChatInput('Find bin locations')}
                        className="border border-black/10 p-3 hover:border-black/30 transition-colors text-sm text-black/80 hover:text-black"
                      >
                        Find bin locations
                      </button>
                      <button
                        onClick={() => setChatInput('Show all zones')}
                        className="border border-black/10 p-3 hover:border-black/30 transition-colors text-sm text-black/80 hover:text-black"
                      >
                        Show all zones
                      </button>
                    </div>
                  </div>
                ) : (
                  chat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-black text-white' 
                          : 'bg-white border border-black/10'
                      } p-4`}>
                        {msg.role === 'bot' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-600"></div>
                            <span className="text-xs font-bold text-black/60">AI ASSISTANT</span>
                          </div>
                        )}
                        <div className={`${msg.role === 'user' ? 'text-white' : 'text-black'} text-sm font-medium`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-black/10 p-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Ask about bins, racks, inventory levels..."
                    className="flex-1 px-4 py-3 border border-black/20 bg-white text-black text-sm font-medium tracking-wide focus:outline-none focus:border-black/40 transition-colors placeholder:text-black/50"
                  />
                  <button
                    onClick={handleChatSend}
                    className="px-6 py-3 bg-black text-white text-sm font-bold hover:bg-black/90 transition-colors flex items-center gap-2"
                  >
                    SEND
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 text-xs text-black/50 font-medium">
                  Try: "Find bin A3" • "Show all racks" • "Inventory status" • "Zone layout"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">AI SEARCH ASSISTANT</div>
            <div className="text-xs text-black/70 font-medium mt-1">Version 2.1.0 • Updated: Today</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">AI: ACTIVE</span>
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