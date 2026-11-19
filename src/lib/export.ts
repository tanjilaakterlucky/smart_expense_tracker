import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Category, Wallet, CurrencyCode } from '../types';
import { formatCurrency } from './currencies';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[]
) {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));

  const rows = transactions.map((t) => ({
    ID: t.id,
    Date: t.date,
    Type: t.type.toUpperCase(),
    Category: catMap.get(t.categoryId) || 'Uncategorized',
    Wallet: walletMap.get(t.walletId) || 'Unknown',
    'To Wallet': t.toWalletId ? walletMap.get(t.toWalletId) || '' : '',
    Amount: t.amount,
    Currency: t.currency,
    'Exchange Rate (to USD)': t.exchangeRate,
    'Converted (USD)': t.convertedAmountUSD,
    Description: t.description || '',
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `finora_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTransactionsToPDF(
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[],
  primaryCurrency: CurrencyCode
) {
  const doc = new jsPDF();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));

  // Brand Header
  doc.setFillColor(118, 87, 232); // #7657E8
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('FINORA', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Smart Personal Finance Management Statement', 52, 18);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 38);
  doc.text(`Total Records: ${transactions.length}`, 14, 44);

  const tableData = transactions.map((t) => [
    t.date,
    t.type.toUpperCase(),
    t.description || '—',
    catMap.get(t.categoryId) || '—',
    walletMap.get(t.walletId) || '—',
    `${t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}${formatCurrency(t.amount, t.currency)}`,
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Date', 'Type', 'Description', 'Category', 'Wallet', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [118, 87, 232],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [246, 247, 251],
    },
  });

  doc.save(`finora_statement_${new Date().toISOString().split('T')[0]}.pdf`);
}
