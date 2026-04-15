import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Investments } from './components/Investments';
import { Projections } from './components/Projections';
import { Opportunities } from './components/Opportunities';
import { DataInput } from './components/DataInput';
import { useFinanceData } from './hooks/useFinanceData';
import { useUserSettings } from './hooks/useUserSettings';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useGoals } from './hooks/useGoals';
import { Auth, User } from './components/Auth';
import { AdminUsers } from './components/AdminUsers';
import { Settings } from './components/Settings';

export type View = 'dashboard' | 'investments' | 'projections' | 'opportunities' | 'input' | 'users' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [settingTab, setSettingTab] = useState<string>('assinaturas');

  const handleNavigateToSetting = (tab: string) => {
    setSettingTab(tab);
    setCurrentView('settings');
  };

  const financeData = useFinanceData(user?.id);
  const userSettings = useUserSettings(user?.id);
  const subscriptions = useSubscriptions(user?.id);
  const userGoals = useGoals(user?.id);
  
  const localDarkMode = typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false;
  const darkMode = userSettings.settings.darkMode ?? localDarkMode;
  const metaMensal = userSettings.settings.metaMensal;
  
  const setDarkMode = (value: boolean) => {
    localStorage.setItem('darkMode', String(value));
    userSettings.saveSettings({ darkMode: value });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Bom dia');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    localStorage.setItem('darkMode', String(newValue));
    setDarkMode(newValue);
  };

  const handleMetaMensalChange = (value: number) => {
    userSettings.updateMetaMensal(value);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={financeData} darkMode={darkMode} metaMensal={metaMensal} subscriptions={subscriptions.subscriptions} goals={userGoals.goals} investments={financeData.investments} onNavigateToSetting={handleNavigateToSetting} onNavigate={setCurrentView} />;
      case 'investments':
        return <Investments
          investments={financeData.investments}
          onAdd={financeData.addInvestment}
          onRemove={financeData.removeInvestment}
          onUpdate={financeData.updateInvestment}
          darkMode={darkMode}
        />;
      case 'users':
        if (user?.role === 'admin') {
          return <AdminUsers />;
        }
        return <Dashboard data={financeData} darkMode={darkMode} onNavigateToSetting={handleNavigateToSetting} />;
      case 'projections':
        return <Projections
          totalInvested={financeData.summary.totalInvested}
          monthlyContribution={financeData.summary.balance > 0 ? financeData.summary.balance * 0.7 : 500}
          darkMode={darkMode}
        />;
      case 'opportunities':
        return <Opportunities darkMode={darkMode} />;
      case 'input':
        return (
          <DataInput
            incomes={financeData.incomes}
            expenses={financeData.expenses}
            onAddIncome={financeData.addIncome}
            onAddExpense={financeData.addExpense}
            onRemoveIncome={financeData.removeIncome}
            onRemoveExpense={financeData.removeExpense}
            darkMode={darkMode}
          />
        );
      case 'settings':
        return (
          <Settings 
            darkMode={darkMode} 
            activeTab={settingTab} 
            onTabChange={setSettingTab} 
            metaMensal={metaMensal} 
            onMetaMensalChange={handleMetaMensalChange} 
            isSaving={userSettings.isSaving} 
            isAdmin={user?.role === 'admin'}
            subscriptions={subscriptions.subscriptions}
            onAddSubscription={subscriptions.addSubscription}
            onRemoveSubscription={subscriptions.removeSubscription}
            goals={userGoals.goals}
            onAddGoal={userGoals.addGoal}
            onRemoveGoal={userGoals.removeGoal}
          />
        );
      default:
        return <Dashboard data={financeData} darkMode={darkMode} onNavigateToSetting={handleNavigateToSetting} />;
    }
  };

  if (!user) {
    return <Auth onLogin={setUser} initialDarkMode={darkMode} onDarkModeChange={setDarkMode} />;
  }

  if (userSettings.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-500">Carregando configurações...</div>
      </div>
    );
  }

  if (financeData.isLoading) {
    const loadingBg = darkMode ? 'url(/dark_gradient.jpg)' : 'url(/white_gradient.jpg)';
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center flex-col gap-4 bg-cover bg-center" style={{ backgroundImage: loadingBg }}>
        <div className="animate-pulse text-accent">Carregando dados...</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  const bgImage = darkMode ? 'url(/dark_gradient.jpg)' : 'url(/white_gradient.jpg)';
  const textColor = darkMode ? '#a1a1a1' : '#57534e';

  return (
    <div className="min-h-screen bg-cover bg-center transition-all duration-700" style={{ backgroundImage: bgImage, color: textColor }}>
      {/* Mobile Header - only visible on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50"
        style={{ backgroundColor: darkMode ? 'rgba(23,23,23,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold" style={{ color: textColor }}>Finance</h1>
        <button onClick={() => setUser(null)} className="p-2 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="flex h-screen overflow-hidden pt-14 md:pt-0">
        {/* Overlay para fechar sidebar no mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <Sidebar
          user={user}
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={() => setUser(null)}
        />
        
        <main className={`flex-1 transition-all duration-700 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          {currentView === 'dashboard' && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-heading font-semibold" style={{ color: darkMode ? '#fff' : '#1c1917' }}>
                    {greeting}, {user.name}
                  </h1>
                  <p className="text-sm opacity-70 mt-1">{today}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs opacity-70">Patrimônio Total</p>
                    <p className="text-xl font-mono font-bold" style={{ color: darkMode ? '#fff' : '#1c1917' }}>
                      {(() => {
                        const investmentsValue = financeData.investments.reduce((sum, i) => sum + (i.quantity * i.currentPrice), 0);
                        const total = financeData.summary.balance + investmentsValue;
                        return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                      })()}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;