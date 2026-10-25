'use client';
// Tela inicial: cartões de resumo e gráficos que atualizam automaticamente.
import { ArrowDownCircle, ArrowUpCircle, Banknote, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useFinance } from '@/lib/store';
import { TYPES, balanceSeries, calcTotals, categoryTotals, formatBRL, monthlyEvolution } from '@/lib/finance';
import { Card, StatCard } from './ui';

export default function Dashboard() {
  const { transactions, theme } = useFinance();
  const t = calcTotals(transactions);
  const dark = theme === 'dark';
  const hasData = transactions.length > 0;

  // Estilos compartilhados pelos gráficos
  const tip = {
    borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,.15)',
    background: dark ? '#0f172a' : '#ffffff', color: dark ? '#e2e8f0' : '#334155',
  };
  const grid = dark ? '#1e293b' : '#e2e8f0';
  const tick = { fill: '#94a3b8', fontSize: 12 };
  const compact = (v) => `R$ ${Number(v).toLocaleString('pt-BR', { notation: 'compact' })}`;

  const pie = ['entrada', 'saida', 'guardado', 'investido'].map((k) => ({ name: TYPES[k].label, value: t[k], color: TYPES[k].color }));
  const gastos = categoryTotals(transactions, 'saida');
  const balance = balanceSeries(transactions);
  const evo = monthlyEvolution(transactions);

  const cards = [
    { label: 'Saldo Atual', value: formatBRL(t.saldo), icon: Wallet, color: 'violet' },
    { label: 'Total de Entradas', value: formatBRL(t.entrada), icon: ArrowDownCircle, color: 'emerald' },
    { label: 'Total de Saídas', value: formatBRL(t.saida), icon: ArrowUpCircle, color: 'rose' },
    { label: 'Dinheiro Guardado', value: formatBRL(t.guardado), icon: PiggyBank, color: 'amber' },
    { label: 'Dinheiro Investido', value: formatBRL(t.investido), icon: TrendingUp, color: 'sky' },
    { label: 'Dinheiro Restante', value: formatBRL(t.restante), icon: Banknote, color: 'emerald', sub: 'Entradas menos saídas' },
  ];

  const Empty = () => <p className="grid h-full place-items-center text-sm text-slate-400">Sem dados ainda</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Distribuição financeira</h3>
          <div className="h-72">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} formatter={(v) => formatBRL(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Gastos por categoria</h3>
          <div className="h-72">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gastos}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="name" tick={tick} />
                  <YAxis tick={tick} tickFormatter={compact} />
                  <Tooltip contentStyle={tip} formatter={(v) => formatBRL(v)} />
                  <Bar dataKey="value" name="Gasto" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Evolução do saldo</h3>
          <div className="h-72">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="date" tick={tick} />
                  <YAxis tick={tick} tickFormatter={compact} />
                  <Tooltip contentStyle={tip} formatter={(v) => formatBRL(v)} />
                  <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#7c3aed" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Entradas x Saídas</h3>
          <div className="h-72">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={evo}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                  <XAxis dataKey="mes" tick={tick} />
                  <YAxis tick={tick} tickFormatter={compact} />
                  <Tooltip contentStyle={tip} formatter={(v) => formatBRL(v)} />
                  <Legend />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="saidas" name="Saídas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </Card>
      </div>
    </div>
  );
}