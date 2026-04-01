import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Investments } from './components/Investments';
import { Projections } from './components/Projections';
import { Opportunities } from './components/Opportunities';
import { DataInput } from './components/DataInput';
import { useFinanceData } from './hooks/useFinanceData';
import { Auth, User } from './components/Auth';
import { AdminUsers } from './components/AdminUsers';

export type View = 'dashboard' | 'investments' | 'projections' | 'opportunities' | 'input' | 'users';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [greeting, setGreeting] = useState('');

  const financeData = useFinanceData(user?.id);

  useEffect(() => {
    // Determine greeting based on current time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Bom dia');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Boa tarde');
    } else {
      setGreeting('Boa noite');
    }

    // Set initial dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={financeData} />;
      case 'investments':
        return <Investments
          investments={financeData.investments}
          onAdd={financeData.addInvestment}
          onRemove={financeData.removeInvestment}
          onUpdate={financeData.updateInvestment}
        />;
      case 'users':
        if (user?.role === 'admin') {
          return <AdminUsers />;
        }
        return <Dashboard data={financeData} />;
      case 'projections':
        return <Projections
          totalInvested={financeData.summary.totalInvested}
          monthlyContribution={financeData.summary.balance > 0 ? financeData.summary.balance * 0.7 : 500}
        />;
      case 'opportunities':
        return <Opportunities />;
      case 'input':
        return (
          <DataInput
            incomes={financeData.incomes}
            expenses={financeData.expenses}
            onAddIncome={financeData.addIncome}
            onAddExpense={financeData.addExpense}
            onRemoveIncome={financeData.removeIncome}
            onRemoveExpense={financeData.removeExpense}
          />
        );
      default:
        return <Dashboard data={financeData} />;
    }
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  if (financeData.isLoading) {
    return (
      <div className="min-h-screen bg-terminal-bg text-terminal-primary flex items-center justify-center font-mono p-4 text-center flex-col gap-4 text-sm sm:text-base">
        <div className="animate-pulse">_ carregando matriz financeira do servidor...</div>
        <div className="opacity-50 text-xs">Aguarde sincronização com database.json</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text transition-colors duration-300 font-mono">
      <div className="flex h-screen overflow-hidden">
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
        
        <main className={`flex-1 transition-all duration-300 overflow-y-auto ${sidebarOpen ? 'ml-64' : 'ml-16'} p-8`}>
          {currentView === 'dashboard' && (
            <div className="mb-8 border-b border-terminal-secondary pb-4">
              <h1 className="text-xl text-terminal-primary">
                {greeting}, {user.name}
              </h1>
              <p className="text-sm opacity-70">Logado no FINANCE_DASHBOARD Terminal. Status: Online.</p>
            </div>
          )}
          
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
