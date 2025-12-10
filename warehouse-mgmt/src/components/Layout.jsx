import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
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
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-[16px] md:text-[17px] text-slate-900">
      {/* Fixed header */}
      <header className="fixed top-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center gap-4">
          {/* Logo placeholder – swap with <img> when you have a logo */}
          <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white font-semibold text-base shadow-md shadow-slate-400/40">
            GT
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-[26px] font-semibold text-slate-900 leading-tight">
              Global Tech Reach Warehouse- MGMT
            </h1>
            <p className="text-sm text-slate-500">
              Central console for inventory, movements and RFID activity
            </p>
          </div>
        </div>
      </header>

      {/* Main shell under header */}
      <div className="pt-[82px] h-full flex">
        {/* Fixed hover‑expand sidebar, black background */}
        <aside className="group/sidebar relative z-20">
          <div
            className="
              h-[calc(100vh-82px)]
              bg-black text-slate-100
              w-16 group-hover/sidebar:w-68
              transition-[width] duration-300 ease-in-out
              fixed top-[82px] left-0
              overflow-hidden border-r border-slate-800
            "
          >
            <div className="relative flex flex-col h-full">
              {/* Nav items */}
              <nav className="mt-4 flex-1 space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`
                        relative flex items-center gap-3 px-3 py-2.5
                        text-sm md:text-[15px] font-medium
                        transition-all duration-200
                        ${
                          active
                            ? 'bg-neutral-900 text-white'
                            : 'text-slate-300 hover:bg-neutral-900 hover:text-white hover:translate-x-[3px]'
                        }
                      `}
                    >
                      {/* Left accent bar */}
                      <span
                        className={`
                          absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full
                          transition-all duration-200
                          ${
                            active
                              ? 'h-9 bg-slate-50'
                              : 'h-0 group-hover/sidebar:h-7 group-hover/sidebar:bg-slate-500'
                          }
                        `}
                      />

                      {/* Icon – larger, transparent background */}
                      <Icon
                        className={`
                          w-6 h-6 md:w-7 md:h-7 flex-shrink-0
                          transition-transform duration-200
                          ${
                            active
                              ? 'text-white scale-110'
                              : 'group-hover/sidebar:scale-105'
                          }
                        `}
                      />

                      {/* Label only when expanded */}
                      <span
                        className="
                          pointer-events-none
                          absolute left-12
                          opacity-0 -translate-x-1
                          group-hover/sidebar:static
                          group-hover/sidebar:opacity-100
                          group-hover/sidebar:translate-x-0
                          transition-all duration-200 ease-in-out
                          whitespace-nowrap text-[15px]
                        "
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom profile / logout (future auth) */}
              <div className="border-t border-slate-800 px-3 py-3 flex items-center gap-3 bg-black">
                <div className="w-9 h-9 rounded-2xl bg-neutral-900 flex items-center justify-center border border-slate-700">
                  <User className="w-6 h-6 text-slate-200" />
                </div>
                <div className="hidden group/sidebar:flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate text-slate-50">
                    Warehouse Admin
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100 mt-0.5"
                    // later: onClick={logout}
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content area – light background, white boxes via SectionCard on pages */}
        <main className="flex-1 ml-16 group-hover/sidebar:ml-[17rem] transition-[margin] duration-300 ease-in-out overflow-hidden">
          <div className="h-[calc(100vh-82px)] overflow-auto px-5 md:px-8 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
