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
  ArrowLeftRight,
  User,
  LogOut,
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
  { to: '/internal-transfer', label: 'Internal Transfer', icon: ArrowLeftRight },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-[16px] md:text-[17px]">
      {/* Fixed header - Swiss minimalism */}
      <header className="fixed top-0 inset-x-0 z-30 bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-6">
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
      </header>

      {/* Main container */}
      <div className="pt-[88px] h-full flex">
        
        {/* Hover-expand sidebar - Swiss precision */}
        <aside className="group/sidebar relative z-20">
          <div className="
            h-[calc(100vh-88px)] bg-white border-r border-black
            w-16 group-hover/sidebar:w-64
            transition-[width] duration-300 ease-in-out
            fixed top-[88px] left-0 overflow-hidden
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
                          ? 'border-black bg-black/10 text-black' 
                          : 'border-transparent text-black/70 hover:border-black/30 hover:bg-black/5 hover:text-black'
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

              {/* Profile - Bottom section */}
              <div className="border-t border-black/10 py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-black rounded-sm grid place-items-center flex-shrink-0">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  
                  <div className="
                    min-w-0 flex-1 opacity-0 -translate-x-2
                    group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
                    transition-all duration-300 ease-out delay-100
                  ">
                    <div className="text-xs font-medium text-black truncate leading-tight">
                      Warehouse Admin
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-black/70 hover:text-black mt-1 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content area - Clean white space */}
        <main className="flex-1 ml-16 group-hover/sidebar:ml-64 transition-[margin] duration-300 ease-in-out overflow-hidden">
          <div className="h-[calc(100vh-88px)] overflow-auto">
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
