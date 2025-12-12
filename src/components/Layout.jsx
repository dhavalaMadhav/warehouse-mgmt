import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BarChart2,
  Search,
  Package,
  Warehouse,
  MapPin,
  RadioTower,
  ArrowDownToLine,
  ArrowUpToLine,
  ArrowLeftRight,
  Archive,
  FileText,
  User,
  LogOut,
  Bell,
  Settings,
} from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/search', label: 'Smart Search', icon: Search },
  { to: '/items', label: 'Items', icon: Package },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/rfid-tags', label: 'RFID Tags', icon: RadioTower },
  { to: '/supplier-gate-in', label: 'Supplier Gate In', icon: ArrowDownToLine },
  { to: '/customer-gate-out', label: 'Customer Gate Out', icon: ArrowUpToLine },
  { to: '/internal-transfer', label: 'Internal Transfer', icon: ArrowLeftRight },
  { to: '/bin-management', label: 'Bin Management', icon: Archive },
  { to: '/audit-trail', label: 'Audit Trail', icon: FileText },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-[16px] md:text-[17px]">
      {/* Fixed header - Swiss minimalism from second code */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white border-b border-black/10">
        <div className="h-16 flex items-center justify-between px-6">
          {/* Left side: Logo and Title */}
          <div className="flex items-center gap-6">
            {/* Logo - Functional square */}
            <div className="w-12 h-12 border-2 border-black grid place-items-center font-bold text-lg leading-none">
              GT
            </div>
            
            {/* Title - Clean typography */}
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-none text-black">
                Warehouse Management
              </h1>
            </div>
          </div>

          {/* Right side: User actions from second code */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black/5 transition-colors relative">
              <Bell className="w-5 h-5 text-black/70" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500"></div>
            </button>
            <button className="p-2 hover:bg-black/5 transition-colors">
              <Settings className="w-5 h-5 text-black/70" />
            </button>
            
            {/* User profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-black/10">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold text-black leading-none">
                  ADMIN
                </div>
                <div className="text-xs text-black/60 font-medium">
                  SYSTEM OPERATOR
                </div>
              </div>
              <button className="p-2 hover:bg-black/5 transition-colors">
                <LogOut className="w-5 h-5 text-black/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main container */}
      <div className="pt-16 h-full flex">
        
        {/* Hover-expand sidebar - Exactly from your first code */}
        <aside className="group/sidebar relative z-20">
          <div className="
            h-[calc(100vh-64px)] bg-black border-r border-white/20
            w-16 group-hover/sidebar:w-64
            transition-[width] duration-300 ease-in-out
            fixed top-16 left-0 overflow-hidden
          ">
            <div className="relative flex flex-col h-full">
              
              {/* Navigation - Strict vertical rhythm */}
              <nav className="flex-1 py-6 space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = item.to === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`
                        relative flex items-center gap-4 px-4 py-3
                        border-l-4 transition-all duration-200
                        ${active 
                          ? 'border-white bg-white/10 text-white' 
                          : 'border-transparent text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white'
                        }
                      `}
                    >
                      {/* Icon - always visible */}
                      <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'opacity-100' : 'opacity-70'}`} />

                      {/* Label - only visible on hover */}
                      <span className={`
                        whitespace-nowrap text-sm font-medium uppercase tracking-wider
                        pointer-events-none absolute left-16 opacity-0 -translate-x-2
                        group-hover/sidebar:static group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
                        transition-all duration-300 ease-out
                      `}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom info - Minimalist */}
              <div className="px-4 py-6 border-t border-white/10">
                <div className="
                  text-xs text-white/50 opacity-0 -translate-x-2
                  group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
                  transition-all duration-300 ease-out delay-100
                ">
                  <div className="font-medium mb-1">SYSTEM STATUS</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>All systems operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content area - Clean white space */}
        <main className="flex-1 ml-16 group-hover/sidebar:ml-64 transition-[margin] duration-300 ease-in-out overflow-hidden">
          <div className="h-[calc(100vh-64px)] overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="space-y-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}