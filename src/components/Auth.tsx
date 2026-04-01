import React, { useState, useEffect, useRef } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthProps {
  onLogin: (user: User) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount and step change
    inputRef.current?.focus();
  }, [step, mode]);

  useEffect(() => {
    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        await fetch('http://localhost:3001/api/users').then(() => {
          if (mounted) setIsOnline(true);
        });
      } catch (e) {
        if (mounted) setIsOnline(false);
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const addLine = (line: string) => {
    setHistory(prev => [...prev, line]);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      e.currentTarget.value = '';

      if (error) setError('');

      if (mode === 'LOGIN') {
        if (step === 0) {
          addLine(`> Digite seu email: ${val}`);
          if (!val) { setError('Email obrigatório.'); return; }
          setEmail(val);
          setStep(1);
        } else if (step === 1) {
          // don't echo password
          addLine(`> Digite sua senha: ********`);
          if (!val) { setError('Senha obrigatória.'); return; }
          await attemptLogin(email, val);
        }
      } else {
        if (step === 0) {
          addLine(`> Digite seu nome: ${val}`);
          if (!val) { setError('Nome obrigatório.'); return; }
          setName(val);
          setStep(1);
        } else if (step === 1) {
          addLine(`> Digite seu email: ${val}`);
          if (!val) { setError('Email obrigatório.'); return; }
          setEmail(val);
          setStep(2);
        } else if (step === 2) {
          addLine(`> Digite sua senha: ********`);
          if (!val) { setError('Senha obrigatória.'); return; }
          await attemptRegister(name, email, val);
        }
      }
    }
  };

  const attemptLogin = async (e: string, p: string) => {
    setLoading(true);
    addLine(`> Autenticando...`);
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, password: p })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLine(`> Login efetuado com sucesso. Bem-vindo(a) ${data.user.name}.`);
        setTimeout(() => onLogin(data.user), 1000);
      } else if (data.notFound) {
        addLine(`> Usuário não encontrado. Redirecionando para cadastro...`);
        // Switch to register mode but keep the email
        setTimeout(() => {
          setMode('REGISTER');
          setStep(0); // Start the register flow (name)
          setHistory([]);
          setError('');
          setName('');
          // Email is already in state, so user won't need to type it again when it reaches step 1, 
          // wait, actually if step 0 is Name, they will type Name, then the next step asks for Email again 
          // but we can pre-fill or just let them re-type. For now, the user flow will just restart cleanly in REGISTER mode.
          inputRef.current?.focus();
        }, 1500);
      } else {
        setError(data.error || 'Falha no login.');
        setStep(0);
        setEmail('');
      }
    } catch (err) {
      setError('Conexão recusada. O servidor está rodando?');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const attemptRegister = async (n: string, e: string, p: string) => {
    setLoading(true);
    addLine(`> Registrando novo usuário...`);
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: e, password: p })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLine(`> Registro concluído. Efetuando login...`);
        setTimeout(() => onLogin(data.user), 1000);
      } else {
        setError(data.error || 'Falha no registro.');
        setStep(0);
        setName('');
        setEmail('');
      }
    } catch (err) {
      setError('Conexão recusada. O servidor está rodando?');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'LOGIN' ? 'REGISTER' : 'LOGIN');
    setStep(0);
    setHistory([]);
    setError('');
    setName('');
    inputRef.current?.focus();
  };

  const FinanceASCII = `███████╗██╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗███████╗
██╔════╝██║████╗  ██║██╔══██╗████╗  ██║██╔════╝██╔════╝
█████╗  ██║██╔██╗ ██║███████║██╔██╗ ██║██║     █████╗  
██╔══╝  ██║██║╚██╗██║██╔══██║██║╚██╗██║██║     ██╔══╝  
██║     ██║██║ ╚████║██║  ██║██║ ╚████║╚██████╗███████╗
╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝`;

  const DashboardASCII = `██████╗  █████╗ ███████╗██╗  ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗ 
██╔══██╗██╔══██╗██╔════╝██║  ██║██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
██║  ██║███████║███████╗███████║██████╔╝██║   ██║███████║██████╔╝██║  ██║
██║  ██║██╔══██║╚════██║██╔══██║██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
██████╔╝██║  ██║███████║██║  ██║██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝`;

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text font-mono p-4 sm:p-8 selection:bg-terminal-primary selection:text-terminal-bg flex flex-col cursor-text">
      <div className="max-w-5xl mx-auto w-full">
        <div className="overflow-x-auto no-scrollbar mb-8 w-full max-w-[100vw] -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-wrap gap-x-8 gap-y-4">
          <pre className="text-terminal-primary font-bold text-[8px] sm:text-[10px] md:text-xs leading-none whitespace-pre py-2">
            {FinanceASCII}
          </pre>
          <pre className="text-terminal-primary font-bold text-[8px] sm:text-[10px] md:text-xs leading-none whitespace-pre py-2">
            {DashboardASCII}
          </pre>
        </div>
        <div className="mb-6 opacity-80 text-sm sm:text-base">
          Bem-vindo(a) ao sistema <span className="text-terminal-primary">FINANCE DASHBOARD</span>.
          <p className="mt-1 opacity-70">
            {mode === 'LOGIN' ? '-> Insira os dados de login.' : '-> Insira os dados para registro.'}
          </p>
        </div>

        <div className="mb-8 space-y-2 text-sm sm:text-base break-all">
          {history.map((line, i) => (
            <div key={i} className="opacity-90">{line}</div>
          ))}
          {error && <div className="text-red-500 mt-2">! Erro: {error}</div>}
        </div>

        {!loading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-base sm:text-lg mt-4 w-full gap-2 sm:gap-0">
            <div className="flex items-center">
              <span className="text-terminal-primary font-bold mr-2">{'>'}</span>
              <span className="mr-2 opacity-90 whitespace-nowrap">
                {mode === 'LOGIN'
                  ? (step === 0 ? 'Digite seu email:' : 'Digite sua senha:')
                  : (step === 0 ? 'Digite seu nome:' : step === 1 ? 'Digite seu email:' : 'Digite sua senha:')
                }
              </span>
            </div>
            <input
              ref={inputRef}
              type={
                mode === 'LOGIN' ? (step === 1 ? 'password' : 'text')
                  : (step === 2 ? 'password' : 'text')
              }
              className="bg-transparent outline-none border-none flex-1 w-full text-terminal-text pl-4 sm:pl-0"
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoComplete="off"
            />
          </div>
        )}

        <div className="fixed bottom-4 left-4 right-4 sm:left-8 sm:right-8 text-[10px] sm:text-xs flex flex-col sm:flex-row justify-between items-center sm:items-end gap-2 bg-terminal-bg/80 p-2 sm:p-0 backdrop-blur-sm z-10 w-[calc(100%-32px)] sm:w-[calc(100%-64px)]">
          <button
            onClick={(e) => { e.stopPropagation(); toggleMode(); }}
            className="text-sm sm:text-base font-bold opacity-100 hover:text-terminal-primary hover:bg-terminal-primary/10 transition-colors p-2 -ml-2 rounded text-left mb-2 sm:mb-0"
          >
            [Mudar para {mode === 'LOGIN' ? 'REGISTRO' : 'LOGIN'}]
          </button>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center opacity-80">
            <div className="flex items-center gap-2">
              <span>Status do terminal:</span>
              <span className={isOnline ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'}`}></span>
            </div>
            <span className="text-terminal-primary">By: Nicolas Reitz</span>
          </div>
        </div>
      </div>
    </div>
  );
}
