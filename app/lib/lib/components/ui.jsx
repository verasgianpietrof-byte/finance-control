'use client';
// Componentes visuais reutilizáveis: cards, campos, modal, confirmação e notificações.
import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useFinance } from '@/lib/store';

const PALETTE = {
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
};

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

/** Cartão de indicador com ícone e cor próprios. */
export function StatCard({ label, value, icon: Icon, color = 'violet', sub }) {
  return (
    <Card className="animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${PALETTE[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Diálogo de confirmação antes de excluir registros. */
export function ConfirmDialog({ open, title = 'Confirmar exclusão', message, confirmLabel = 'Excluir', onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onCancel} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">Cancelar</button>
        <button onClick={onConfirm} className="btn bg-rose-600 text-white hover:bg-rose-700">{confirmLabel}</button>
      </div>
    </Modal>
  );
}

/** Notificação de sucesso, erro ou informação. */
export function Toast() {
  const { toast } = useFinance();
  if (!toast) return null;
  const styles = { success: 'bg-emerald-600', error: 'bg-rose-600', info: 'bg-slate-800' };
  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
  return (
    <div key={toast.id} className={`fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-lg animate-fadeIn ${styles[toast.type]}`}>
      <Icon size={18} />
      {toast.msg}
    </div>
  );
}