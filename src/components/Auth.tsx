import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Sun, Moon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthProps {
  onLogin: (user: User) => void;
  initialDarkMode?: boolean;
  onDarkModeChange?: (dark: boolean) => void;
}

export function Auth({ onLogin, initialDarkMode, onDarkModeChange }: AuthProps) {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(() => initialDarkMode ?? localStorage.getItem('darkMode') === 'true');

  const attemptLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Falha no login.');
      }
    } catch (err) {
      setError('Conexão recusada. Servidor offline?');
    } finally {
      setLoading(false);
    }
  };

  const attemptRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Falha no registro.');
      }
    } catch (err) {
      setError('Conexão recusada. Servidor offline?');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'LOGIN' ? 'REGISTER' : 'LOGIN');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center font-sans bg-cover bg-center transition-all duration-700 ${isDark
      ? 'bg-[url("/dark_gradient.jpg")]'
      : 'bg-[url("/white_gradient.jpg")]'
      }`}>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full px-5 pt-0 flex items-center">
        <img src={isDark ? "/logo_white.png" : "/logo.png"} alt="Logo" className="h-[50px] w-auto drop-shadow-lg -mt-[-5px] -ml-[5px]" />
      </header>

      {/* Dark/Light Mode Toggle */}
      <button
        type="button"
        onClick={() => {
          const newValue = !isDark;
          setIsDark(newValue);
          localStorage.setItem('darkMode', String(newValue));
          onDarkModeChange?.(newValue);
        }}
        className={`absolute bottom-8 left-8 p-3 rounded-full backdrop-blur-md shadow-lg transition-all duration-500 hover:scale-110 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
          }`}
      >
        {isDark ? (
          <Sun className="w-6 h-6 text-yellow-300 drop-shadow-md transition-transform duration-500 rotate-0" />
        ) : (
          <Moon className="w-6 h-6 text-[#1a2542] drop-shadow-md transition-transform duration-500 rotate-360" />
        )}
      </button>

      {/* Footer Status */}
      <div className={`absolute bottom-6 right-6 flex items-center text-xs tracking-wider transition-colors duration-500 cursor-default select-none ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`}>
        <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isDark ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-green-500'}`}></div>
        <span className="mr-3">TERMINAL_ONLINE</span>
        <span className="opacity-50 mr-3">|</span>
        <span>BY: NICOLAS REITZ</span>
      </div>

      <div className={`w-full max-w-[310px] p-6 flex flex-col items-center rounded-[28px] backdrop-blur-lg shadow-2xl transition-all duration-500 ${isDark ? 'bg-zinc-900/80 text-white' : 'bg-white/90 text-[#2d3748]'
        }`}>

        <h1 className="text-2xl font-bold mb-6 tracking-wide">
          {mode === 'LOGIN' ? 'Login' : 'Sign Up'}
        </h1>

        <form className="w-full" onSubmit={mode === 'LOGIN' ? attemptLogin : attemptRegister}>

          {mode === 'REGISTER' && (
            <div className={`flex items-center px-4 py-3 rounded-none mb-4 transition-colors duration-500 ${isDark ? 'bg-zinc-800' : 'bg-[#f1f5f9]'
              }`}>
              <UserIcon className={`w-5 h-5 mr-3 ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`} />
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                className={`bg-transparent border-none outline-none w-full font-medium placeholder:font-normal ${isDark ? 'text-white placeholder-zinc-500' : 'text-[#334155] placeholder-[#94a3b8]'
                  }`}
              />
            </div>
          )}

          <div className={`flex items-center px-4 py-3 rounded-none mb-4 transition-colors duration-500 ${isDark ? 'bg-zinc-800' : 'bg-[#f1f5f9]'
            }`}>
            <Mail className={`w-5 h-5 mr-3 ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`} />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              className={`bg-transparent border-none outline-none w-full font-medium placeholder:font-normal ${isDark ? 'text-white placeholder-zinc-500' : 'text-[#334155] placeholder-[#94a3b8]'
                }`}
            />
          </div>

          <div className={`flex items-center px-4 py-3 rounded-none mb-6 transition-colors duration-500 ${isDark ? 'bg-zinc-800' : 'bg-[#f1f5f9]'
            }`}>
            <Lock className={`w-5 h-5 mr-3 ${isDark ? 'text-zinc-400' : 'text-[#64748b]'}`} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              className={`bg-transparent border-none outline-none w-full font-medium placeholder:font-normal ${isDark ? 'text-white placeholder-zinc-500' : 'text-[#334155] placeholder-[#94a3b8]'
                }`}
            />
          </div>

          {error && <div className="text-red-400 text-sm mb-4 text-center font-medium bg-red-500/10 py-2 rounded-none">{error}</div>}

          {mode === 'LOGIN' && (
            <div className={`flex justify-between items-center text-sm mb-6 font-medium ${isDark ? 'text-zinc-300' : 'text-[#64748b]'
              }`}>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className={`mr-2 ${isDark ? 'accent-zinc-500' : 'accent-[#4f86f7]'}`} />
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-none font-bold tracking-wider transition-all duration-300 disabled:opacity-50 shadow-lg text-white ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 shadow-zinc-900/50' : 'bg-[#4f86f7] hover:bg-[#3b6ecc] shadow-blue-500/30'
              }`}
          >
            {loading ? 'WAIT...' : (mode === 'LOGIN' ? 'LOGIN' : 'REGISTER')}
          </button>

          {mode === 'LOGIN' && (
            <div className="mt-4 text-center">
              <a href="#" className={`text-sm hover:underline transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-[#64748b] hover:text-[#1a2542]'}`}>Forgot your password?</a>
            </div>
          )}
        </form>

        <div className={`mt-8 text-sm transition-colors ${isDark ? 'text-zinc-300' : 'text-[#64748b]'}`}>
          {mode === 'LOGIN' ? (
            <p>New to site? <button onClick={toggleMode} className={`font-bold hover:underline ml-1 ${isDark ? 'text-white' : 'text-[#4f86f7]'}`}>Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={toggleMode} className={`font-bold hover:underline ml-1 ${isDark ? 'text-white' : 'text-[#4f86f7]'}`}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
