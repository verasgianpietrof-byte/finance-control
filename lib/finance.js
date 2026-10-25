// Constantes, cálculos e utilidades financeiras do Finance Control.

/** Tipos de movimentação, com rótulo e cor usados em toda a interface. */
export const TYPES = {
  entrada: { label: 'Entrada', color: '#10b981' },
  saida: { label: 'Saída', color: '#f43f5e' },
  guardado: { label: 'Dinheiro Guardado', color: '#f59e0b' },
  investido: { label: 'Dinheiro Investido', color: '#8b5cf6' },
};

export const DEFAULT_CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde',
  'Educação', 'Salário', 'Investimentos', 'Reserva de Emergência', 'Outros',
];

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Data de hoje no fuso local, formato YYYY-MM-DD. */
export const todayLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const formatBRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');
export const monthOf = (iso) => iso.slice(0, 7);
export const yearOf = (iso) => iso.slice(0, 4);

/** Dados de exemplo exibidos na primeira abertura do app. */
export function sampleData() {
  const ago = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const mk = (name, category, amount, type, days) => ({ id: uid(), name, category, amount, type, date: ago(days) });
  return [
    mk('Salário', 'Salário', 5500, 'entrada', 28),
    mk('Freelance', 'Outros', 900, 'entrada', 12),
    mk('Aluguel', 'Moradia', 1500, 'saida', 25),
    mk('Supermercado', 'Alimentação', 620, 'saida', 20),
    mk('Uber', 'Transporte', 145, 'saida', 15),
    mk('Academia', 'Saúde', 120, 'saida', 8),
    mk('Cinema', 'Lazer', 80, 'saida', 5),
    mk('Reserva mensal', 'Reserva de Emergência', 800, 'guardado', 26),
    mk('Tesouro Selic', 'Investimentos', 1000, 'investido', 26),
    mk('Salário', 'Salário', 5500, 'entrada', 1),
  ];
}

/**
 * Totais por tipo e saldo.
 * Saldo Atual = Entradas - Saídas - Guardado - Investido
 * Dinheiro Restante = Entradas - Saídas (o que sobrou antes de guardar/investir)
 */
export function calcTotals(list) {
  const t = { entrada: 0, saida: 0, guardado: 0, investido: 0 };
  list.forEach((x) => { t[x.type] += Number(x.amount) || 0; });
  const saldo = t.entrada - t.saida - t.guardado - t.investido;
  const restante = t.entrada - t.saida;
  return { ...t, saldo, restante };
}

/** Aplica pesquisa e filtros. f = { query, type, category, month, year, start, end } */
export function filterTransactions(list, f = {}) {
  const q = (f.query || '').trim().toLowerCase();
  return list.filter((x) =>
    (!q || x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q)) &&
    (!f.type || x.type === f.type) &&
    (!f.category || x.category === f.category) &&
    (!f.month || monthOf(x.date) === f.month) &&
    (!f.year || yearOf(x.date) === f.year) &&
    (!f.start || x.date >= f.start) &&
    (!f.end || x.date <= f.end)
  );
}

/** Ordena por uma chave (asc/desc). */
export function sortTransactions(list, key, dir) {
  const mult = dir === 'asc' ? 1 : -1;
  const val = (x) => (key === 'amount' ? Number(x[key]) : String(x[key]).toLowerCase());
  return [...list].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    return va > vb ? mult : va < vb ? -mult : 0;
  });
}

/** Saldo acumulado ao longo do tempo (para o gráfico de linha). */
export function balanceSeries(list) {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  let acc = 0;
  const byDate = {};
  sorted.forEach((x) => {
    const v = Number(x.amount);
    // Entradas somam; saídas, guardados e investidos reduzem o saldo
    acc += x.type === 'entrada' ? v : -v;
    byDate[x.date] = acc;
  });
  return Object.entries(byDate).map(([date, saldo]) => ({ date: formatDate(date), saldo }));
}

/** Soma de valores por categoria para um tipo, ordenada do maior para o menor. */
export function categoryTotals(list, type) {
  const map = {};
  list.filter((x) => x.type === type).forEach((x) => {
    map[x.category] = (map[x.category] || 0) + Number(x.amount);
  });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/** Estatísticas de um mês (formato YYYY-MM). */
export function monthStats(list, month) {
  const items = list.filter((x) => monthOf(x.date) === month);
  const t = calcTotals(items);
  const gastos = categoryTotals(items, 'saida');
  const ganhos = categoryTotals(items, 'entrada');
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const isCurrent = month === monthOf(todayLocal());
  const daysElapsed = isCurrent ? new Date().getDate() : daysInMonth;
  return {
    gasto: t.saida,
    ganho: t.entrada,
    economia: t.entrada - t.saida,
    topGasto: gastos[0],
    topGanho: ganhos[0],
    mediaDiaria: t.saida / Math.max(1, daysElapsed),
  };
}

/** Agrupa entradas e saídas por mês. */
function agrupaMeses(list) {
  const months = {};
  list.forEach((x) => {
    const m = monthOf(x.date);
    months[m] = months[m] || { mes: m, entradas: 0, saidas: 0 };
    if (x.type === 'entrada') months[m].entradas += Number(x.amount);
    if (x.type === 'saida') months[m].saidas += Number(x.amount);
  });
  return months;
}

/** Médias mensais considerando apenas meses com movimentações. */
export function monthlyAverages(list) {
  const months = Object.values(agrupaMeses(list));
  const n = months.length || 1;
  return {
    gasto: months.reduce((s, m) => s + m.saidas, 0) / n,
    ganho: months.reduce((s, m) => s + m.entradas, 0) / n,
  };
}

/** Evolução mensal: entradas, saídas e economia por mês. */
export function monthlyEvolution(list) {
  return Object.values(agrupaMeses(list))
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .map((m) => ({ ...m, economia: m.entradas - m.saidas }));
}

/** Exporta as movimentações para PDF (bibliotecas carregadas sob demanda). */
export async function exportPDF(list, fileName = 'movimentacoes.pdf') {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Finance Control - Movimentações', 14, 16);
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 23);
  autoTable(doc, {
    startY: 28,
    head: [['Nome', 'Categoria', 'Tipo', 'Data', 'Valor']],
    body: list.map((x) => [x.name, x.category, TYPES[x.type].label, formatDate(x.date), formatBRL(x.amount)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [124, 58, 237] },
  });
  const saldo = calcTotals(list).saldo;
  doc.text(`Saldo: ${formatBRL(saldo)}`, 14, doc.lastAutoTable.finalY + 10);
  doc.save(fileName);
}

/** Exporta as movimentações para Excel (.xlsx). */
export async function exportExcel(list) {
  const XLSX = await import('xlsx');
  const rows = list.map((x) => ({
    Nome: x.name, Categoria: x.category, Valor: Number(x.amount), Data: x.date, Tipo: TYPES[x.type].label,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Movimentações');
  XLSX.writeFile(wb, 'movimentacoes.xlsx');
}

/** Lê uma planilha (.xlsx/.xls/.csv) e converte em movimentações. */
export async function parseSpreadsheet(file) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  const typeByLabel = Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [v.label.toLowerCase(), k]));

  const parseDate = (raw) => {
    if (typeof raw === 'number') return new Date(Math.round((raw - 25569) * 864e5)).toISOString().slice(0, 10);
    const s = String(raw).trim();
    const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/); // aceita DD/MM/AAAA
    return br ? `${br[3]}-${br[2]}-${br[1]}` : s.slice(0, 10);
  };
  const parseAmount = (raw) =>
    typeof raw === 'number' ? raw : Number(String(raw).replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.'));

  return rows
    .map((r) => {
      const get = (...keys) => {
        const col = Object.keys(r).find((c) => keys.includes(c.trim().toLowerCase()));
        return col ? r[col] : '';
      };
      const typeText = String(get('tipo', 'type')).trim().toLowerCase();
      return {
        name: String(get('nome', 'name') || 'Sem nome'),
        category: String(get('categoria', 'category') || 'Outros'),
        amount: Math.abs(parseAmount(get('valor', 'amount'))) || 0,
        date: parseDate(get('data', 'date') || todayLocal()),
        type: typeByLabel[typeText] || (TYPES[typeText] ? typeText : 'saida'),
      };
    })
    .filter((x) => x.amount > 0);
}

/** Faz o download de um objeto como arquivo JSON. */
export function downloadJSON(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}