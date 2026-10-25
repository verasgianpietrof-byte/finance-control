'use client';
// Estado global (Context API) com persistência automática no LocalStorage.
import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_CATEGORIES, sampleData, uid } from './finance';

const STORAGE_KEY = 'finance-control:v1';
const FinanceContext = createContext(null);

const initialState = () => ({
  transactions: sampleData(),
  categories: DEFAULT_CATEGORIES,
  goals: [{ id: uid(), name: 'Comprar notebook', target: 6000, saved: 1200 }],
  theme: 'light',
});

export function FinanceProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [quickSearch, setQuickSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Carrega os dados salvos somente no navegador
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) setState({ ...initialState(), ...saved });
    } catch { /* dados inválidos: mantém o estado inicial */ }
    setLoaded(true);
  }, []);

  // Salva a cada alteração e aplica o tema
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state, loaded]);

  // Notificações somem sozinhas após 3 segundos
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (msg, type = 'success') => setToast({ id: Date.now(), msg, type });
  const patch = (partial) =>
    setState((s) => ({ ...s, ...(typeof partial === 'function' ? partial(s) : partial) }));

  // ---- Movimentações ----
  const addTransaction = (t) => {
    patch((s) => ({ transactions: [{ ...t, id: uid() }, ...s.transactions] }));
    notify('Movimentação adicionada');
  };
  const updateTransaction = (t) => {
    patch((s) => ({ transactions: s.transactions.map((x) => (x.id === t.id ? t : x)) }));
    notify('Movimentação atualizada');
  };
  const deleteTransaction = (id) => {
    patch((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) }));
    notify('Movimentação excluída', 'info');
  };
  const importTransactions = (list) => {
    patch((s) => ({ transactions: [...list.map((t) => ({ ...t, id: uid() })), ...s.transactions] }));
    notify(`${list.length} movimentações importadas`);
  };

  // ---- Categorias ----
  const addCategory = (name) => {
    const n = name.trim();
    if (!n) return notify('Digite o nome da categoria', 'error');
    if (state.categories.some((c) => c.toLowerCase() === n.toLowerCase()))
      return notify('Essa categoria já existe', 'error');
    patch((s) => ({ categories: [...s.categories, n] }));
    notify('Categoria criada');
  };
  const removeCategory = (name) => {
    patch((s) => ({ categories: s.categories.filter((c) => c !== name) }));
    notify('Categoria removida', 'info');
  };

  // ---- Objetivos ----
  const addGoal = ({ name, target }) => {
    patch((s) => ({ goals: [...s.goals, { id: uid(), name, target, saved: 0 }] }));
    notify('Meta criada');
  };
  const deleteGoal = (id) => {
    patch((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    notify('Meta excluída', 'info');
  };
  const contributeGoal = (id, value) => {
    patch((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, saved: g.saved + value } : g)) }));
    notify('Valor adicionado à meta');
  };

  // ---- Configurações e dados ----
  const setTheme = (theme) => patch({ theme });
  const restoreBackup = (data) => {
    patch({
      transactions: data.transactions,
      categories: data.categories ?? DEFAULT_CATEGORIES,
      goals: data.goals ?? [],
    });
    notify('Backup restaurado');
  };
  const clearAll = () => {
    patch({ transactions: [], goals: [], categories: DEFAULT_CATEGORIES });
    notify('Todos os dados foram apagados', 'info');
  };

  const value = {
    ...state, loaded, tab, setTab, quickSearch, setQuickSearch, toast, notify,
    addTransaction, updateTransaction, deleteTransaction, importTransactions,
    addCategory, removeCategory, addGoal, deleteGoal, contributeGoal,
    setTheme, restoreBackup, clearAll,
  };
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => useContext(FinanceContext);