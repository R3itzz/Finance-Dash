import {
  LayoutDashboard,
  LineChart,
  Lightbulb,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Wallet,
  LogOut,
  Sun,
  Moon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { User } from './Auth';

interface SidebarProps {
  user: User;
  currentView: string;
  onNavigate: (view: 'dashboard' | 'investments' | 'projections' | 'opportunities' | 'input' | 'users' | 'settings') => void;
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
  { id: 'settings', label: 'Configurações', icon: SettingsIcon },
] as const;

export function Sidebar({ user, currentView, onNavigate, isOpen, onToggle, darkMode, onToggleDarkMode, onLogout }: SidebarProps) {
  const visibleItems = [...menuItems];

  const bgColor = darkMode ? '#171717' : '#f5f5f4';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textColor = darkMode ? '#a1a1a1' : '#57534e';

  return (
    <aside 
      className={`fixed left-0 top-0 h-full flex flex-col transition-all duration-700 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
      style={{ 
        zIndex: 50,
        backgroundColor: bgColor,
        borderRight: borderColor
      }}
    >
      <div className="p-4 flex items-center justify-between -mt-6 ml-[1px]" style={{ borderBottom: borderColor }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src={darkMode ? '/logo_white.png' : '/logo.png'} 
            alt="Logo" 
            className="h-[100px] w-auto object-contain cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          />
        </div>
        
        <button 
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
          title="Toggle Sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" style={{ color: textColor }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: textColor }} />
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 -mt-6 overflow-hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive
                  ? 'text-accent bg-accent/10'
                  : ''
                }
              `}
              style={{ color: isActive ? (darkMode ? '#c6f135' : '#65a30d') : textColor }}
              title={item.label}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} style={{ color: isActive ? (darkMode ? '#c6f135' : '#65a30d') : undefined }} />
              {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor }}>
        {isOpen ? (
          <div className="space-y-3">
            <button 
              onClick={onToggleDarkMode}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors"
              style={{ color: textColor }}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
            <div className="pt-2 border-t" style={{ borderColor }}>
              <p className="text-xs" style={{ color: textColor }}>{user.name}</p>
              <p className="text-xs text-accent capitalize">{user.role}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={onToggleDarkMode}
              className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: textColor }}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-full p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}