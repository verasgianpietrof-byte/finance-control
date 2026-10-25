'use client';
// Configurações: tema, categorias, backup/restauração JSON, importação e exportação, limpeza de dados.
import { useState } from 'react';
import { Download, FileDown, FileSpreadsheet, Moon, Plus, Sun, Tags, Trash2, Upload, X } from 'lucide-react';
import { useFinance } from '@/lib/store';
import { downloadJSON, exportExcel, exportPDF, parseSpreadsheet, todayLocal } from '@/lib/finance';
import { Card, ConfirmDialog } from './ui';

export default function Settings() {
  const {
    theme, setTheme, categories, addCategory, removeCategory, transactions, goals,
    importTransactions, restoreBackup, clearAll, notify,
  } = useFinance();
  const [newCat, setNewCat] = useState('');
  const [pendingBackup, setPendingBackup] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Gera backup completo em arquivo JSON
  const exportBackup = () => {
    downloadJSON(
      { app: 'finance-control', version: 1, exportedAt: new Date().toISOString(), transactions, categories, goals },
      `finance-control-backup-${todayLocal()}.json`
    );
    notify('Backup gerado com sucesso');
  };

  // Lê o arquivo escolhido e pede confirmação antes de substituir os dados
  const pickBackup = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.transactions)) throw new Error('invalid');
      setPendingBackup(data);
    } catch {
      notify('Arquivo de backup inválido', 'error');
    }
  };

  const pickSheet = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const list = await parseSpreadsheet(file);
      if (!list.length) return notify('Nenhuma linha válida encontrada na planilha', 'error');
      importTransactions(list);
    } catch {
      notify('Não foi possível ler a planilha', 'error');
    }
  };

  const section = (title, children) => (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </Card>
  );

  const fileBtn = 'btn cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {section('Aparência',
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
        </button>
      )}

      {section('Categorias',
        <>
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); addCategory(newCat); setNewCat(''); }}
          >
            <input className="input" placeholder="Nova categoria" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <button className="btn shrink-0 bg-violet-600 text-white hover:bg-violet-700"><Plus size={16} />Adicionar</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                <Tags size={12} />{c}
                <button onClick={() => removeCategory(c)} className="rounded-full p-0.5 hover:bg-violet-100 dark:hover:bg-violet-500/20" title="Remover categoria">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      {section('Backup e restauração',
        <div className="flex flex-wrap gap-2">
          <button onClick={exportBackup} className="btn bg-violet-600 text-white hover:bg-violet-700"><Download size={16} />Gerar backup (JSON)</button>
          <label className={fileBtn}><Upload size={16} />Restaurar backup<input type="file" accept="application/json,.json" className="hidden" onChange={pickBackup} /></label>
        </div>
      )}

      {section('Importar e exportar',
        <>
          <div className="flex flex-wrap gap-2">
            <label className={fileBtn}><Upload size={16} />Importar planilha<input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={pickSheet} /></label>
            <button onClick={() => exportPDF(transactions).then(() => notify('PDF gerado'))} className="btn bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10"><FileDown size={16} />PDF</button>
            <button onClick={() => exportExcel(transactions).then(() => notify('Excel gerado'))} className="btn bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10"><FileSpreadsheet size={16} />Excel</button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Colunas da planilha: <b>Nome, Categoria, Valor, Data</b> (AAAA-MM-DD ou DD/MM/AAAA) e <b>Tipo</b> (Entrada, Saída, Dinheiro Guardado ou Dinheiro Investido).
          </p>
        </>
      )}

      {section('Zona de perigo',
        <button onClick={() => setConfirmClear(true)} className="btn bg-rose-600 text-white hover:bg-rose-700"><Trash2 size={16} />Apagar todos os dados</button>
      )}

      <ConfirmDialog
        open={!!pendingBackup}
        title="Restaurar backup"
        confirmLabel="Restaurar"
        message="Os dados atuais serão substituídos pelos dados do backup. Deseja continuar?"
        onCancel={() => setPendingBackup(null)}
        onConfirm={() => { restoreBackup(pendingBackup); setPendingBackup(null); }}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Apagar todos os dados"
        confirmLabel="Apagar tudo"
        message="Todas as movimentações e metas serão removidas. Essa ação não pode ser desfeita."
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => { clearAll(); setConfirmClear(false); }}
      />
    </div>
  );
}