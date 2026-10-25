'use client';
// Ponto de entrada: provedor de estado + alternância entre as telas pelo menu lateral.
import { FinanceProvider, useFinance } from '@/lib/store';
import { Header, Sidebar } from '@/components/Shell';
import { Toast } from '@/components/ui';
import Dashboard from '@/components/Dashboard';
import Transactions from '@/components/Transactions';
import Goals from '@/components/Goals';
import Stats from '@/components/Stats';
import Settings from '@/components/Settings';

// Mapa de telas: para adicionar uma nova, crie o componente e registre aqui e no NAV do Shell
const SCREENS = {
  dashboard: Dashboard,
  movimentacoes: Transactions,
  objetivos: Goals,
  estatisticas: Stats,
  configuracoes: Settings,
};

function App() {
  const { tab, loaded } = useFinance();
  if (!loaded) return <div className="grid min-h-screen place-items-center text-slate-400">Carregando...</div>;
  const Screen = SCREENS[tab];
  return (
    <div className="min-h-screen md:pl-60">
      <Sidebar />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main key={tab} className="flex-1 animate-fadeIn p-4 md:p-8">
          <Screen />
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function Page() {
  return (
    <FinanceProvider>
      <App />
    </FinanceProvider>
  );
}