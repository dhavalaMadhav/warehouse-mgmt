import { useState, useEffect } from 'react';
import { Shield, Search, Download, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/audit-logs', {
        params: dateRange.start ? dateRange : {},
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Details', 'IP Address'],
      ...logs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.userName,
        log.action,
        JSON.stringify(log.details),
        log.ipAddress,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString()}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.userName.toLowerCase().includes(filter.toLowerCase())
  );

  const columns = [
    {
      label: 'Timestamp',
      field: 'timestamp',
      width: '180px',
      render: (row) => format(new Date(row.timestamp), 'MMM dd, yyyy HH:mm'),
    },
    {
      label: 'User',
      field: 'userName',
      width: '150px',
    },
    {
      label: 'Action',
      field: 'action',
      width: '200px',
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold tracking-wide">
          {row.action}
        </span>
      ),
    },
    {
      label: 'Details',
      field: 'details',
      width: '300px',
      render: (row) => (
        <span className="text-xs text-black/80 font-medium truncate">
          {JSON.stringify(row.details)}
        </span>
      ),
    },
    {
      label: 'IP Address',
      field: 'ipAddress',
      width: '120px',
    },
  ];

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
                AUDIT TRAIL
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Complete history of all system actions
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
                SECURITY STATUS: ACTIVE
              </span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            TOTAL LOGS: {logs.length}
          </div>
        </div>
      </div>

      {/* Operations Header */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-black mr-3"></div>
          <h2 className="text-2xl font-black text-black tracking-tight">FILTER CONTROLS</h2>
        </div>
        
        {/* Filter Section */}
        <div className="border border-black/20 p-6 relative overflow-hidden mb-8">
          {/* Clipped background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 to-transparent opacity-20" 
               style={{
                 clipPath: `polygon(0 0, 100% 0, 100% 50%, 0 100%)`
               }}>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4 mb-6 relative z-10">
            {/* Search Input */}
            <div className="relative md:col-span-2 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/60 group-hover:text-black transition-colors" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="SEARCH BY ACTION OR USER..."
                className="w-full pl-12 pr-4 py-3 border border-black/20 bg-white text-sm font-medium tracking-wide text-black focus:outline-none focus:border-black/40 transition-all duration-200"
              />
            </div>

            {/* Date Inputs */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-xs font-bold text-black/60">FROM</span>
              </div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-16 pr-4 py-3 border border-black/20 bg-white text-sm font-medium tracking-wide text-black focus:outline-none focus:border-black/40 transition-all duration-200"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-xs font-bold text-black/60">TO</span>
              </div>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-16 pr-4 py-3 border border-black/20 bg-white text-sm font-medium tracking-wide text-black focus:outline-none focus:border-black/40 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <button
              onClick={loadLogs}
              className="group border border-black/20 px-6 py-3 hover:border-black/40 hover:bg-black/2 transition-all duration-200 text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <span className="font-bold text-black text-sm tracking-wide relative z-10">
                APPLY FILTERS
              </span>
            </button>

            <button
              onClick={exportLogs}
              className="group flex items-center gap-3 border border-black bg-black px-6 py-3 hover:bg-black/90 transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <Download className="w-4 h-4 text-white relative z-10" />
              <span className="font-bold text-white text-sm tracking-wide relative z-10">
                EXPORT CSV
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-black mr-3"></div>
            <h2 className="text-2xl font-black text-black tracking-tight">AUDIT LOGS</h2>
          </div>
          <div className="text-sm font-medium text-black/70">
            SHOWING {filteredLogs.length} OF {logs.length} RECORDS
          </div>
        </div>

        <div className="border border-black/20 relative overflow-hidden">
          {/* Table with clipped background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/5 to-transparent opacity-10" 
               style={{
                 clipPath: `polygon(0 0, 100% 0, 100% 30%, 0 100%)`
               }}>
          </div>
          
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/20 bg-black/2">
                  <th className="text-left py-5 px-4 text-xs font-black text-black/80 tracking-widest uppercase">
                    TIMESTAMP
                  </th>
                  <th className="text-left py-5 px-4 text-xs font-black text-black/80 tracking-widest uppercase">
                    USER
                  </th>
                  <th className="text-left py-5 px-4 text-xs font-black text-black/80 tracking-widest uppercase">
                    ACTION
                  </th>
                  <th className="text-left py-5 px-4 text-xs font-black text-black/80 tracking-widest uppercase">
                    DETAILS
                  </th>
                  <th className="text-left py-5 px-4 text-xs font-black text-black/80 tracking-widest uppercase">
                    IP ADDRESS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-black/10 hover:bg-black/2 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-black text-sm tracking-wide">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-black/60 font-medium">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-black text-sm tracking-wide">
                        {log.userName}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold tracking-wide inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-[300px]">
                      <div className="text-xs text-black/80 font-medium truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-w-none">
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm text-black font-bold tracking-tight">
                        {log.ipAddress}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer - Swiss Precision */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-black" />
              <div className="text-sm font-bold text-black tracking-widest">AUDIT & COMPLIANCE MODULE</div>
            </div>
            <div className="text-xs text-black/70 font-medium mt-1">
              Version 3.2.1 • Real-time logging enabled
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">SECURITY: ACTIVE</span>
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