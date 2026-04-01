import { useState, useEffect } from 'react';
import { User } from './Auth';
import { Users, Shield, Mail, CheckCircle } from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
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

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-terminal-primary flex items-center gap-3">
          <Shield className="w-6 h-6" />
          [SUDO] Cadastros no Sistema
        </h2>
        <p className="text-terminal-text opacity-70 mt-1">
          Histórico consolidado do banco de dados (users.json)
        </p>
      </div>

      {error && (
        <div className="card border-red-500 bg-red-500/10 text-red-500 p-4">
          [!] {error}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
