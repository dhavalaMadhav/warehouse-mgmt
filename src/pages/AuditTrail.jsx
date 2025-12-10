import { useState, useEffect } from 'react';
import { Shield, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import api from '../utils/api';
import SectionCard from '../components/SectionCard.jsx';
import StockTable from '../components/StockTable.jsx';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);

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
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          {row.action}
        </span>
      ),
    },
    {
      label: 'Details',
      field: 'details',
      width: '300px',
      render: (row) => (
        <span className="text-xs text-black/70 truncate">
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-black" />
          <div>
            <h1 className="text-3xl font-semibold text-black">Audit Trail</h1>
            <p className="text-black/70">Complete history of all system actions</p>
          </div>
        </div>
        
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-[5px] hover:bg-black/80"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <SectionCard className="mb-6">
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by action or user..."
              className="w-full pl-10 pr-3 py-2 border border-black/20 rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
            />
          </div>

          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 border border-black/20 rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
          />

          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 border border-black/20 rounded-[5px] text-sm focus:outline-none focus:ring-2 focus:ring-black/30"
          />
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-[5px] text-sm hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </SectionCard>

      <SectionCard>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <StockTable
            data={filteredLogs}
            columns={columns}
            onRowClick={(log) => console.log('Audit log:', log)}
          />
        )}
      </SectionCard>
    </div>
  );
}
