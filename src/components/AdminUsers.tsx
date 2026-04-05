import { useState, useEffect } from 'react';
import { User } from './Auth';
import { Users, Shield, Mail, CheckCircle, Trash2, UserPlus, X } from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addStatus, setAddStatus] = useState({ loading: false, error: '', success: '' });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}` }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Erro ao buscar usuários do sistema.');
      }
    } catch (err) {
      setError('Erro de conexão com o banco de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (userId === 'admin') return;
    if (!window.confirm('Tem certeza que deseja apagar este usuário permanentemente?')) return;
    
    try {
      const res = await fetch(`/api/users/${userId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;
    
    setAddStatus({ loading: true, error: '', success: '' });
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAddStatus({ loading: false, error: '', success: 'Usuário cadastrado com sucesso!' });
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        fetchUsers(); // Refresh the list
        setTimeout(() => setShowAddForm(false), 2000);
      } else {
        setAddStatus({ loading: false, error: data.error || 'Falha ao registrar', success: '' });
      }
    } catch (err) {
      setAddStatus({ loading: false, error: 'Erro de conexão.', success: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-terminal-primary flex items-center gap-3">
            <Shield className="w-6 h-6" />
            [SUDO] Cadastros no Sistema
          </h2>
          <p className="text-terminal-text opacity-70 mt-1">
            Gestão consolidada do banco de dados de usuários
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn flex items-center gap-2 text-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showAddForm ? 'CANCELAR' : 'NOVO USUÁRIO'}
        </button>
      </div>

      {error && (
        <div className="card border-red-500 bg-red-500/10 text-red-500 p-4">
          [!] {error}
        </div>
      )}

      {/* Formulário de Adição */}
      {showAddForm && (
        <div className="card border-terminal-primary/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-terminal-primary"></div>
          <h3 className="font-bold text-terminal-primary mb-4">&gt; INSERIR NOVO REGISTRO_</h3>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase opacity-70 mb-1">Nome</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input w-full" 
                  placeholder="Nome de acesso"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase opacity-70 mb-1">E-mail</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="input w-full" 
                  placeholder="contato@exemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase opacity-70 mb-1">Senha (Temporária)</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input w-full" 
                  placeholder="********"
                  required
                />
              </div>
            </div>
            
            {addStatus.error && <div className="text-red-500 text-sm">! {addStatus.error}</div>}
            {addStatus.success && <div className="text-green-500 text-sm">{addStatus.success}</div>}
            
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                className="btn bg-terminal-primary text-terminal-bg hover:bg-terminal-primary/80 disabled:opacity-50"
                disabled={addStatus.loading}
              >
                {addStatus.loading ? 'PROCESSANDO...' : '[ ADICIONAR AO BANCO ]'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center opacity-70">Carregando root logs...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2 opacity-70">
            <Users className="w-8 h-8 opacity-50" />
            Nenhum usuário catalogado.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-terminal-secondary text-terminal-primary text-sm uppercase">
                <th className="p-4 font-bold">ID / Token</th>
                <th className="p-4 font-bold">Nome de Acesso</th>
                <th className="p-4 font-bold">Contato (E-mail)</th>
                <th className="p-4 font-bold">Privilégio</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr 
                  key={u.id || index} 
                  className="border-b border-terminal-secondary/30 hover:bg-terminal-highlight/20 transition-colors"
                >
                  <td className="p-4 font-mono text-xs opacity-70">{u.id}</td>
                  <td className="p-4 font-bold text-terminal-text">{u.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 opacity-50" />
                      {u.email}
                    </div>
                  </td>
                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <span className="flex items-center gap-1 text-terminal-primary font-bold">
                        <CheckCircle className="w-4 h-4" /> ROOT
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 opacity-70">
                         USER
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                        title="Remover Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
