import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Sparkles, Send, Bot } from 'lucide-react';
import SectionCard from '../components/SectionCard.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8585/api';

export default function SearchAssistant() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [locations, setLocations] = useState([]);
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
    <div>
      <h1 className="text-3xl md:text-[32px] font-semibold text-slate-900 mb-2">
        Smart Search Assistant
      </h1>
      <p className="text-base text-slate-600 mb-6">
        AI-powered location finder with intelligent suggestions
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Smart Search */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">AI Location Search</h2>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Type bin, rack, zone..."
              className="w-full pl-10 pr-3 py-3 border border-black/15 rounded-[5px] text-[15px] focus:outline-none focus:ring-2 focus:ring-black/30"
            />
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">AI Suggestions</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(s.code); handleSearch(); }}
                  className="w-full text-left px-3 py-2 rounded-[5px] border border-black/10 hover:bg-slate-50 text-sm text-slate-700"
                >
                  <span className="font-medium">{s.type}</span>: {s.code} – {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Results ({results.length})</p>
              {results.map((r, i) => (
                <div key={i} className="p-3 border border-black/10 rounded-[5px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{r.code}</span>
                    <span className="text-xs uppercase text-slate-500">{r.locationType}</span>
                  </div>
                  <p className="text-sm text-slate-600">{r.name}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Chatbot */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Assistant Chatbot</h2>
          </div>

          <div className="h-[400px] border border-black/10 rounded-[5px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-black/10 p-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask about bins, racks, inventory..."
                className="flex-1 px-3 py-2 border border-black/15 rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
              />
              <button
                onClick={handleChatSend}
                className="px-4 py-2 bg-black text-white rounded-[5px] hover:bg-slate-800"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
