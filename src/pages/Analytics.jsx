import { BarChart3, TrendingUp, Package, AlertTriangle, Calendar, Clock, ChevronRight, Users, DollarSign, Target, Zap, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Analytics() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-10">
        <div className="border-b border-black/10 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-black mb-2 tracking-tight">
                ANALYTICS
              </h1>
              <p className="text-lg text-black/80 font-medium tracking-wide">
                Warehouse performance insights & metrics
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
              <span className="font-bold text-emerald-800 tracking-widest text-sm">REAL-TIME ANALYTICS: ACTIVE</span>
            </div>
          </div>
          <div className="text-sm font-medium text-black/70">
            LAST UPDATE: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-black mr-3"></div>
          <h2 className="text-2xl font-black text-black tracking-tight">KEY PERFORMANCE INDICATORS</h2>
        </div>
        
        {/* Metrics Container */}
        <div className="border border-black/20">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10">
            {[
              { 
                icon: Package, 
                label: "AVG PICK TIME", 
                value: "4.2", 
                unit: "min", 
                change: "-0.3", 
                color: "blue" 
              },
              { 
                icon: TrendingUp, 
                label: "ORDER ACCURACY", 
                value: "98.5", 
                unit: "%", 
                change: "+0.2", 
                color: "emerald" 
              },
              { 
                icon: Users, 
                label: "DAILY ORDERS", 
                value: "127", 
                unit: "", 
                change: "+14", 
                color: "amber" 
              },
              { 
                icon: AlertTriangle, 
                label: "LOW STOCK ITEMS", 
                value: "12", 
                unit: "", 
                change: "-2", 
                color: "rose" 
              },
            ].map((metric, index) => (
              <div key={index} className="relative group overflow-hidden">
                {/* Custom divider */}
                {index > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-px">
                    <div className="absolute left-0 top-0 w-px h-1/4 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
                    <div className="absolute left-0 top-1/4 h-1/2 w-px bg-black/30"></div>
                    <div className="absolute left-0 bottom-0 w-px h-1/4 bg-gradient-to-t from-transparent via-black/10 to-black/30"></div>
                  </div>
                )}
                
                {/* Clipped background */}
                <div className="absolute inset-0 opacity-10" 
                     style={{
                       backgroundImage: `linear-gradient(45deg, transparent 30%, var(--color-${metric.color}-100) 30%, var(--color-${metric.color}-100) 70%, transparent 70%)`,
                     }}>
                </div>
                
                <div className="p-6 text-center hover:bg-black/2 transition-colors relative z-10">
                  <div className="flex justify-center mb-4">
                    <metric.icon className={`w-8 h-8 text-${metric.color}-600`} />
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <div className="text-3xl font-black text-black tracking-tight">
                      {metric.value}
                    </div>
                    {metric.unit && (
                      <div className="text-sm font-bold text-black/60">
                        {metric.unit}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-bold text-black/80 tracking-widest uppercase mb-2">
                    {metric.label}
                  </div>
                  <div className={`text-xs font-bold ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metric.change.startsWith('+') ? '↑' : '↓'} {metric.change.replace('+', '').replace('-', '')} 
                    {index === 0 && 'min'} 
                    {index === 1 && '%'} 
                    {index === 2 && ' orders'}
                    {index === 3 && ' items'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-2 h-8 bg-black mr-3"></div>
          <h2 className="text-2xl font-black text-black tracking-tight">OPERATIONAL METRICS</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              icon: DollarSign, 
              label: "REVENUE TODAY", 
              value: "$12,450", 
              sublabel: "+2.8% vs yesterday", 
              color: "emerald" 
            },
            { 
              icon: Target, 
              label: "FULFILLMENT RATE", 
              value: "96.3%", 
              sublabel: "On target ✓", 
              color: "blue" 
            },
            { 
              icon: Zap, 
              label: "PEAK EFFICIENCY", 
              value: "2.8", 
              sublabel: "Avg items/min", 
              color: "amber" 
            },
            { 
              icon: CheckCircle, 
              label: "QUALITY SCORE", 
              value: "99.1%", 
              sublabel: "Within standard", 
              color: "purple" 
            },
          ].map((metric, idx) => (
            <div key={idx} className="border border-black/20 p-6 hover:border-black/30 transition-all duration-200 relative overflow-hidden group">
              {/* Clipped background */}
              <div className="absolute inset-0 opacity-5" 
                   style={{
                     clipPath: `polygon(0 0, 100% 0, 100% 70%, 0 100%)`,
                     background: `linear-gradient(135deg, var(--color-${metric.color}-100) 0%, transparent 70%)`
                   }}>
              </div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                <div className={`text-xs font-bold px-2 py-1 ${metric.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : metric.color === 'blue' ? 'bg-blue-100 text-blue-700' : metric.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                  LIVE
                </div>
              </div>
              
              <div className="mb-2 relative z-10">
                <div className="text-2xl font-black text-black tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs font-bold text-black/80 tracking-widest uppercase mt-1">
                  {metric.label}
                </div>
              </div>
              
              <div className="text-sm text-black/70 font-medium relative z-10">
                {metric.sublabel}
              </div>
              
              <div className="mt-4 pt-4 border-t border-black/10">
                <div className="flex items-center gap-1 text-xs font-bold text-black/60 group-hover:text-black transition-colors">
                  DETAILS
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <div className="border border-black/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-2 h-8 bg-black mr-3"></div>
                <h2 className="text-xl font-black text-black tracking-tight">PERFORMANCE OVERVIEW</h2>
              </div>
              <div className="flex items-center gap-2">
                <select className="border border-black/20 px-3 py-1 text-sm font-medium text-black bg-white">
                  <option>LAST 7 DAYS</option>
                  <option>LAST 30 DAYS</option>
                  <option>LAST QUARTER</option>
                </select>
                <button className="border border-black/20 px-3 py-1 text-sm font-bold text-black hover:border-black/30 transition-colors">
                  EXPORT
                </button>
              </div>
            </div>
            
            {/* Chart Placeholder with Swiss-style grid */}
            <div className="border border-black/10 p-6 bg-white">
              <div className="relative h-64">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 right-0 h-px bg-black"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-px bg-black"></div>
                  <div className="absolute top-2/4 left-0 right-0 h-px bg-black"></div>
                  <div className="absolute top-3/4 left-0 right-0 h-px bg-black"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-black"></div>
                  
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-black"></div>
                  <div className="absolute top-0 bottom-0 left-1/4 w-px bg-black"></div>
                  <div className="absolute top-0 bottom-0 left-2/4 w-px bg-black"></div>
                  <div className="absolute top-0 bottom-0 left-3/4 w-px bg-black"></div>
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-black"></div>
                </div>
                
                {/* Chart bars - Swiss-style minimal */}
                <div className="absolute bottom-0 left-1/6 w-8 bg-gradient-to-t from-blue-500 to-blue-300" style={{ height: '60%' }}></div>
                <div className="absolute bottom-0 left-2/6 w-8 bg-gradient-to-t from-emerald-500 to-emerald-300" style={{ height: '75%' }}></div>
                <div className="absolute bottom-0 left-3/6 w-8 bg-gradient-to-t from-amber-500 to-amber-300" style={{ height: '45%' }}></div>
                <div className="absolute bottom-0 left-4/6 w-8 bg-gradient-to-t from-rose-500 to-rose-300" style={{ height: '85%' }}></div>
                <div className="absolute bottom-0 left-5/6 w-8 bg-gradient-to-t from-purple-500 to-purple-300" style={{ height: '65%' }}></div>
                
                {/* Axis labels */}
                <div className="absolute -bottom-6 left-1/6 transform -translate-x-1/2 text-xs font-bold text-black/60">MON</div>
                <div className="absolute -bottom-6 left-2/6 transform -translate-x-1/2 text-xs font-bold text-black/60">TUE</div>
                <div className="absolute -bottom-6 left-3/6 transform -translate-x-1/2 text-xs font-bold text-black/60">WED</div>
                <div className="absolute -bottom-6 left-4/6 transform -translate-x-1/2 text-xs font-bold text-black/60">THU</div>
                <div className="absolute -bottom-6 left-5/6 transform -translate-x-1/2 text-xs font-bold text-black/60">FRI</div>
                
                <div className="absolute -left-8 top-0 transform -translate-y-1/2 text-xs font-bold text-black/60">100%</div>
                <div className="absolute -left-8 top-1/4 transform -translate-y-1/2 text-xs font-bold text-black/60">75%</div>
                <div className="absolute -left-8 top-2/4 transform -translate-y-1/2 text-xs font-bold text-black/60">50%</div>
                <div className="absolute -left-8 top-3/4 transform -translate-y-1/2 text-xs font-bold text-black/60">25%</div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-black/10">
                {[
                  { color: 'blue', label: 'Order Processing' },
                  { color: 'emerald', label: 'Picking Accuracy' },
                  { color: 'amber', label: 'Shipping Time' },
                  { color: 'rose', label: 'Returns Rate' },
                  { color: 'purple', label: 'Customer Satisfaction' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-3 h-3 bg-${item.color}-500`}></div>
                    <span className="text-xs font-medium text-black/70">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="space-y-4">
          {/* Efficiency Score */}
          <div className="border border-black/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-2 h-6 bg-black mr-3"></div>
                <h3 className="font-black text-black tracking-tight">EFFICIENCY SCORE</h3>
              </div>
              <span className="text-xs font-bold text-black/60">TODAY</span>
            </div>
            
            <div className="relative h-4 bg-black/10 mb-2">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: '87%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-black text-black">87%</div>
              <div className="text-xs font-bold text-emerald-600">+2% vs avg</div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="border border-black/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-2 h-6 bg-black mr-3"></div>
                <h3 className="font-black text-black tracking-tight">TOP PERFORMERS</h3>
              </div>
              <span className="text-xs font-bold text-black/60">LAST 24H</span>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Picking Team A', score: '98.7%', change: '+1.2' },
                { name: 'Sorting Team B', score: '97.4%', change: '+0.8' },
                { name: 'Shipping Team C', score: '96.2%', change: '+0.5' },
                { name: 'Quality Team D', score: '95.8%', change: '+0.3' },
              ].map((team, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-black/2 transition-colors">
                  <div className="font-medium text-sm text-black">{team.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-black">{team.score}</div>
                    <div className="text-xs font-bold text-emerald-600">+{team.change}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="border border-black p-6 bg-black">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 mr-3" />
              <h3 className="font-black text-white tracking-tight">RECOMMENDATIONS</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-amber-400 mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-white/80">Optimize pick path in Zone 3</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-white/80">Restock fast-moving items in A1-A5</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-cyan-400 mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-white/80">Schedule maintenance for conveyor B</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="text-xs font-bold text-white/50 tracking-widest">
                AUTO-GENERATED • UPDATED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm font-bold text-black tracking-widest">ANALYTICS DASHBOARD</div>
            <div className="text-xs text-black/70 font-medium mt-1">Real-time data processing • Updated every 5 minutes</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600"></div>
              <span className="text-xs font-bold text-black">DATA: LIVE</span>
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