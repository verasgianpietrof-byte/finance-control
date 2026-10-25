'use client';
// Objetivos financeiros: metas com valor guardado, valor restante, barra de progresso e percentual.
import { useState } from 'react';
import { CheckCircle2, PlusCircle, Target, Trash2 } from 'lucide-react';
import { useFinance } from '@/lib/store';
import { formatBRL } from '@/lib/finance';
import { Card, ConfirmDialog, Field } from './ui';

export default function Goals() {
  const { goals, addGoal, deleteGoal, contributeGoal, notify } = useFinance();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [amounts, setAmounts] = useState({});
  const [pending, setPending] = useState(null);

  const create = (e) => {
    e.preventDefault();
    const value = Number(String(target).replace(',', '.'));
    if (!name.trim() || !(value > 0)) return notify('Informe nome e valor de meta válidos', 'error');
    addGoal({ name: name.trim(), target: value });
    setName('');
    setTarget('');
  };

  const contribute = (goal) => {
    const v = Number(String(amounts[goal.id] || '').replace(',', '.'));
    if (!(v > 0)) return notify('Informe um valor válido', 'error');
    contributeGoal(goal.id, v);
    setAmounts((a) => ({ ...a, [goal.id]: '' }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">Nova meta</h2>
        <form onSubmit={create} className="grid gap-4 md:grid-cols-3 md:items-end">
          <Field label="Nome da meta">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Comprar notebook" />
          </Field>
          <Field label="Valor da meta (R$)">
            <input className="input" type="number" step="0.01" min="0" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <button className="btn justify-center bg-violet-600 text-white hover:bg-violet-700">
            <PlusCircle size={16} /> Criar meta
          </button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
          const falta = Math.max(0, g.target - g.saved);
          return (
            <Card key={g.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><Target size={20} /></div>
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-xs text-slate-400">Meta: {formatBRL(g.target)}</p>
                  </div>
                </div>
                <button onClick={() => setPending(g)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Excluir meta">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-5 flex justify-between text-sm">
                <span>Guardado: <b>{formatBRL(g.saved)}</b></span>
                <span>Falta: <b>{formatBRL(falta)}</b></span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{pct.toFixed(1)}% concluído</span>
                {pct >= 100 && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 size={14} /> Meta atingida!</span>}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  className="input"
                  placeholder="Valor a guardar"
                  value={amounts[g.id] || ''}
                  onChange={(e) => setAmounts((a) => ({ ...a, [g.id]: e.target.value }))}
                />
                <button onClick={() => contribute(g)} className="btn shrink-0 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">
                  Adicionar
                </button>
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && <p className="text-slate-400">Nenhuma meta cadastrada ainda.</p>}
      </div>

      <ConfirmDialog
        open={!!pending}
        message={`Excluir a meta "${pending?.name}"?`}
        onCancel={() => setPending(null)}
        onConfirm={() => { deleteGoal(pending.id); setPending(null); }}
      />
    </div>
  );
}