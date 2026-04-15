import { useState } from 'react';
import { Target, PiggyBank, Zap, Save, Users, Plus, Trash2, TrendingUp } from 'lucide-react';
import { AdminUsers } from './AdminUsers';
import type { Subscription, Goal } from '../types';

interface SettingsProps {
  darkMode: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  metaMensal?: number;
  onMetaMensalChange?: (value: number) => void;
  isSaving?: boolean;
  isAdmin?: boolean;
  subscriptions?: Subscription[];
  onAddSubscription?: (sub: Omit<Subscription, 'id'>) => void;
  onRemoveSubscription?: (id: string) => void;
  goals?: Goal[];
  onAddGoal?: (goal: Omit<Goal, 'id'>) => void;
  onRemoveGoal?: (id: string) => void;
}

export function Settings({
  darkMode,
  activeTab,
  onTabChange,
  metaMensal = 0,
  onMetaMensalChange,
  isSaving = false,
  isAdmin = false,
  subscriptions = [],
  onAddSubscription,
  onRemoveSubscription,
  goals = [],
  onAddGoal,
  onRemoveGoal,
}: SettingsProps) {
  const textColor = darkMode ? '#a1a1a1' : '#57534e';
  const textPrimary = darkMode ? '#ffffff' : '#1c1917';
  const bgColor = darkMode ? '#171717' : '#ffffff';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const accent = darkMode ? '#c6f135' : '#65a30d';
  const accentGlow = darkMode ? 'rgba(198, 241, 53, 0.3)' : 'rgba(101, 163, 13, 0.3)';
  
  const [localMetaMensal, setLocalMetaMensal] = useState(metaMensal);
  const [salvo, setSalvo] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [newSubDueDay, setNewSubDueDay] = useState('1');
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');

  const tabs = [
    { id: 'assinaturas', label: 'Assinaturas', icon: Zap },
    { id: 'meta_mensal', label: 'Meta Mensal', icon: PiggyBank },
    { id: 'minhas_metas', label: 'Minhas Metas', icon: Target },
    ...(isAdmin ? [{ id: 'cadastros', label: 'Cadastros', icon: Users }] : []),
  ];

  const formatMeta = (value: number) => value.toLocaleString('pt-BR');

  const handleSalvar = () => {
    setSalvo(true);
    onMetaMensalChange?.(localMetaMensal);
    setTimeout(() => setSalvo(false), 2000);
  };

  const handleAddGoal = () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    
    onAddGoal?.({
      name: newGoalName.trim(),
      targetAmount: Number(newGoalTarget),
      currentAmount: Number(newGoalCurrent) || 0,
      deadline: newGoalDeadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
    });
    
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setNewGoalDeadline('');
    setShowAddGoalForm(false);
  };

  const renderMetas = () => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm" style={{ color: textColor }}>Total guardado</p>
            <p className="text-3xl font-mono font-bold" style={{ color: accent }}>
              R$ {totalCurrent.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm" style={{ color: textColor }}>de R$ {totalTarget.toLocaleString('pt-BR')}</p>
          </div>
          <button
            onClick={() => setShowAddGoalForm(!showAddGoalForm)}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: showAddGoalForm ? '#ef4444' : accent, 
              color: darkMode ? '#000' : '#fff',
              boxShadow: `0 4px 15px ${accent}40`
            }}
          >
            {showAddGoalForm ? (
              <>Cancelar</>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Adicionar
              </>
            )}
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAddGoalForm ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 rounded-2xl space-y-4" style={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${borderColor}`
          }}>
            <div>
              <label className="text-sm block mb-2" style={{ color: textColor }}>Nome da meta</label>
              <input
                type="text"
                placeholder="Viagem, Carro, Casa..."
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm block mb-2" style={{ color: textColor }}>Valor alvo (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  style={{
                    backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                    borderColor: borderColor,
                    color: textPrimary,
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm block mb-2" style={{ color: textColor }}>Já guardado (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={newGoalCurrent}
                  onChange={(e) => setNewGoalCurrent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  style={{
                    backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                    borderColor: borderColor,
                    color: textPrimary,
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
            <div>
              <label className="text-sm block mb-2" style={{ color: textColor }}>Prazo (opcional)</label>
              <input
                type="date"
                value={newGoalDeadline}
                onChange={(e) => setNewGoalDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
              />
            </div>
            <button
              onClick={handleAddGoal}
              className="w-full py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                backgroundColor: accent, 
                color: darkMode ? '#000' : '#fff',
                boxShadow: `0 4px 15px ${accent}40`
              }}
            >
              Adicionar Meta
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {goals.map((goal, index) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isComplete = progress >= 100;
            
            return (
              <div
                key={goal.id}
                className="group relative p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#fff',
                  border: `1px solid ${isComplete ? (darkMode ? '#22c55e' : '#22c55e') : borderColor}`,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                      style={{ 
                        backgroundColor: isComplete ? 'rgba(34,197,94,0.2)' : `${accent}20`,
                        color: isComplete ? '#22c55e' : accent
                      }}
                    >
                      {isComplete ? <TrendingUp className="w-6 h-6" /> : goal.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg" style={{ color: textPrimary }}>{goal.name}</p>
                      <p className="text-sm" style={{ color: textColor }}>
                        {goal.deadline && `Prazo: ${new Date(goal.deadline).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveGoal?.(goal.id)}
                    className="p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: textColor }}>Progresso</span>
                    <span className="font-mono font-medium" style={{ color: isComplete ? '#22c55e' : accent }}>
                      R$ {goal.currentAmount.toLocaleString('pt-BR')} / R$ {goal.targetAmount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-700" 
                      style={{ 
                        width: `${Math.min(progress, 100)}%`, 
                        backgroundColor: isComplete ? '#22c55e' : accent 
                      }} 
                    />
                  </div>
                  <p className="text-xs text-right" style={{ color: textColor }}>
                    {Math.round(progress)}% concluído
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {goals.length === 0 && !showAddGoalForm && (
          <div className="text-center py-12 rounded-2xl" style={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: `1px dashed ${borderColor}`
          }}>
            <Target className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: textColor }} />
            <p className="font-medium" style={{ color: textColor }}>Nenhuma meta cadastrada</p>
            <p className="text-sm mt-2 opacity-70">Clique em "Adicionar" para começar</p>
          </div>
        )}
      </div>
    );
  };

  const handleAddSubscription = () => {
    if (!newSubName.trim() || !newSubAmount || !newSubDueDay) return;
    
    onAddSubscription?.({
      name: newSubName.trim(),
      amount: Number(newSubAmount),
      dueDay: Number(newSubDueDay),
      active: true,
    });
    
    setNewSubName('');
    setNewSubAmount('');
    setNewSubDueDay('1');
    setShowAddForm(false);
  };

  const renderAssinaturas = () => {
    const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm" style={{ color: textColor }}>Total mensal</p>
            <p className="text-3xl font-mono font-bold" style={{ color: accent }}>
              R$ {total.toLocaleString('pt-BR')}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: showAddForm ? '#ef4444' : accent, 
              color: darkMode ? '#000' : '#fff',
              boxShadow: `0 4px 15px ${accent}40`
            }}
          >
            {showAddForm ? (
              <>Cancelar</>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Adicionar
              </>
            )}
          </button>
        </div>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAddForm ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 rounded-2xl space-y-4" style={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${borderColor}`
          }}>
            <div>
              <label className="text-sm block mb-2" style={{ color: textColor }}>Nome da assinatura</label>
              <input
                type="text"
                placeholder="Netflix, Disney+, Spotify..."
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                style={{
                  backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                  borderColor: borderColor,
                  color: textPrimary,
                }}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm block mb-2" style={{ color: textColor }}>Valor (R$)</label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={newSubAmount}
                  onChange={(e) => setNewSubAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  style={{
                    backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                    borderColor: borderColor,
                    color: textPrimary,
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <div className="w-28">
                <label className="text-sm block mb-2" style={{ color: textColor }}>Dia</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="15"
                  value={newSubDueDay}
                  onChange={(e) => setNewSubDueDay(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-base transition-all focus:outline-none focus:ring-2 focus:ring-accent/50"
                  style={{
                    backgroundColor: darkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                    borderColor: borderColor,
                    color: textPrimary,
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleAddSubscription}
              className="w-full py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                backgroundColor: accent, 
                color: darkMode ? '#000' : '#fff',
                boxShadow: `0 4px 15px ${accent}40`
              }}
            >
              Adicionar Assinatura
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {subscriptions.map((sub, index) => (
            <div
              key={sub.id}
              className="group relative p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
              style={{ 
                backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#fff',
                border: `1px solid ${borderColor}`,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{ 
                      backgroundColor: `${accent}20`,
                      color: accent
                    }}
                  >
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-lg" style={{ color: textPrimary }}>{sub.name}</p>
                    <p className="text-sm" style={{ color: textColor }}>
                      Vencimento: dia <span className="font-medium">{sub.dueDay}</span> de cada mês
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xl font-mono font-bold" style={{ color: accent }}>
                    R$ {sub.amount.toLocaleString('pt-BR')}
                  </p>
                  <button
                    onClick={() => onRemoveSubscription?.(sub.id)}
                    className="p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subscriptions.length === 0 && !showAddForm && (
          <div className="text-center py-12 rounded-2xl" style={{ 
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: `1px dashed ${borderColor}`
          }}>
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: textColor }} />
            <p className="font-medium" style={{ color: textColor }}>Nenhuma assinatura cadastrada</p>
            <p className="text-sm mt-2 opacity-70">Clique em "Adicionar" para começar</p>
          </div>
        )}
      </div>
    );
  };

  const renderMetaMensal = () => (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-sm mb-2" style={{ color: textColor }}>Defina sua meta mensal de economia</p>
        <div className="text-4xl font-mono font-bold" style={{ color: accent }}>
          R$ {formatMeta(localMetaMensal)}
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1000000"
            step="100"
            value={localMetaMensal}
            onChange={(e) => setLocalMetaMensal(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accent} 0%, ${accent} ${(localMetaMensal / 1000000) * 100}%, ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${(localMetaMensal / 1000000) * 100}%, ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-sm" style={{ color: textColor }}>
          <span>R$ 0</span>
          <span>R$ 1.000.000</span>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="number"
          value={localMetaMensal}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= 1000000) setLocalMetaMensal(val);
          }}
          className="flex-1 px-4 py-3 rounded-xl border font-mono text-lg text-center"
          style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderColor: borderColor,
            color: textPrimary,
          }}
        />
        <button
          onClick={handleSalvar}
          className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
          disabled={isSaving}
          style={{
            backgroundColor: salvo ? '#22c55e' : (isSaving ? '#94a3b8' : accent),
            color: darkMode ? '#000' : '#fff',
          }}
        >
          <Save className="w-5 h-5" />
          {salvo ? 'Salvo!' : isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'meta_mensal') return renderMetaMensal();
    if (activeTab === 'assinaturas') return renderAssinaturas();
    if (activeTab === 'minhas_metas') return renderMetas();
    if (activeTab === 'cadastros' && isAdmin) return <AdminUsers />;
    
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-12 text-center" style={{ color: textColor }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          {(() => {
            const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon;
            return ActiveIcon ? <ActiveIcon className="w-8 h-8 opacity-50" /> : null;
          })()}
        </div>
        <p>Funcionalidade em desenvolvimento...</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: textPrimary }}>
          Configurações
        </h2>
        <p className="text-sm mt-1" style={{ color: textColor }}>
          Gerencie assinaturas, metas e contas
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
                style={{ 
                  backgroundColor: isActive ? accentGlow : 'transparent',
                  color: isActive ? accent : textColor,
                  border: `1px solid ${isActive ? accent : 'transparent'}`,
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
        
        <div className="flex-1 rounded-2xl p-6" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
           <h3 className="text-xl font-semibold mb-6" style={{ color: textPrimary }}>
             {tabs.find(t => t.id === activeTab)?.label}
           </h3>
           {renderContent()}
        </div>
      </div>
    </div>
  );
}