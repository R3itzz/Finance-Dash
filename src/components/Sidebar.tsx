import {
  LayoutDashboard,
  LineChart,
  Lightbulb,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Wallet,
  Sun,
  Moon,
  Users,
  LogOut,
} from 'lucide-react';
import { User } from './Auth';

interface SidebarProps {
  user: User;
  currentView: string;
  onNavigate: (view: 'dashboard' | 'investments' | 'projections' | 'opportunities' | 'input') => void;
  isOpen: boolean;
  onToggle: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'input', label: 'Lançamentos', icon: PlusCircle },
  { id: 'investments', label: 'Carteira', icon: Wallet },
  { id: 'opportunities', label: 'Oportunidades', icon: Lightbulb },
  { id: 'projections', label: 'Projeções', icon: LineChart },
] as const;

export function Sidebar({ user, currentView, onNavigate, isOpen, onToggle, darkMode, onToggleDarkMode, onLogout }: SidebarProps) {
  
  // Clone menu items and add 'users' if admin
  const visibleItems = [...menuItems];
  if (user?.role === 'admin') {
    visibleItems.push({ id: 'users', label: 'Cadastros', icon: Users } as any);
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-terminal-bg border-r border-terminal-secondary flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
      style={{ zIndex: 50 }}
    >
      <div className="p-4 border-b border-terminal-secondary flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'hidden'}`}>
          <Terminal className="text-terminal-primary w-6 h-6 flex-shrink-0" />
          <div className="whitespace-nowrap overflow-hidden">
            <h1 className="font-bold text-sm text-terminal-primary">FINANCE_DASHBOARD</h1>
            <p className="text-xs text-terminal-text opacity-70">Finance CLI</p>
          </div>
        </div>
        
        <button 
          onClick={onToggle}
          className="p-1 hover:bg-terminal-highlight hover:text-terminal-primary transition-colors focus:outline-none"
          title="Toggle Sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5 opacity-70" />
          ) : (
            <ChevronRight className="w-5 h-5 opacity-70" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 mt-4 overflow-hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-sm transition-all duration-200 group
                ${isActive
                  ? 'bg-terminal-highlight border-l-2 border-terminal-primary text-terminal-primary'
                  : 'text-terminal-text hover:bg-terminal-highlight border-l-2 border-transparent hover:border-terminal-secondary'
                }
              `}
              title={item.label}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-terminal-primary' : 'opacity-70 group-hover:opacity-100'}`} />
              {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-terminal-secondary text-xs opacity-50 whitespace-nowrap overflow-hidden flex flex-col gap-4">
        <button 
          onClick={onToggleDarkMode}
          className={`flex items-center gap-3 w-full hover:text-terminal-primary transition-colors ${!isOpen && 'justify-center'}`}
          title="Toggle Light/Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {isOpen && <span>{darkMode ? 'White Mode' : 'Dark Mode'}</span>}
        </button>

        <button 
          onClick={onLogout}
          className={`flex items-center gap-3 w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1 -ml-1 rounded transition-colors ${!isOpen && 'justify-center'}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="font-bold">[LOGOUT]</span>}
        </button>
        {isOpen ? (
          <div>
            <p className="mb-1 text-terminal-secondary">[System]</p>
            <p className="mb-1">v1.0.0-cli</p>
            <p className="text-terminal-primary">By: Nicolas Reitz</p>
          </div>
        ) : (
          <div className="text-center mt-2 flex flex-col gap-2">
            <span>CLI</span>
            <span className="text-[8px] text-terminal-primary leading-tight">NR</span>
          </div>
        )}
      </div>
    </aside>
  );
}
