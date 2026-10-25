'use client';
// Estrutura da aplicação: menu lateral (Sidebar) e cabeçalho com pesquisa rápida (Header).
import { ArrowLeftRight, BarChart3, LayoutDashboard, Moon, Search, Settings, Sun, Target, Wallet } from 'lucide-react';
import { useFinance } from '@/lib/store';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
  { id: 'objetivos', label: 'Objetivos', icon: Target },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const { tab, setTab } = useFinance();
  return (
    <aside className="z-40 border-b border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900 md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-b-0 md:border-r md:px-4 md:py-6">
      <div className="hidden items-center gap-2 px-2 pb-8 md:flex">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/30">
          <Wallet size={20} />
        </div>
        <span className="text-lg font-bold">Finance Control</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              tab === id
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function Header() {
  const { quickSearch, setQuickSearch, setTab, theme, setTheme } = useFinance();
  // Pesquisa rápida: ao digitar, leva para a tabela de movimentações já filtrada
  const onSearch = (v) => {
    setQuickSearch(v);
    if (v) setTab('movimentacoes');
  };
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-slate-100/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-8">
      <div className="relative min-w-0 max-w-md flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Pesquisa rápida..." value={quickSearch} onChange={(e) => onSearch(e.target.value)} />
      </div>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="rounded-xl bg-white p-2.5 shadow-sm transition hover:scale-105 dark:bg-slate-800"
        title="Alternar tema"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold">Olá!</p>
        <p className="text-xs capitalize text-slate-500">{today}</p>
      </div>
    </header>
  );
}