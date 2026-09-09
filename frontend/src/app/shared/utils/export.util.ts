/**
 * Converts array of objects to CSV and triggers file download
 */
export function exportToCsv<T extends Record<string, any>>(filename: string, rows: T[], headers?: { key: keyof T; label: string }[]) {
  if (!rows || !rows.length) return;

  const effectiveHeaders = headers || Object.keys(rows[0]).map((key) => ({ key, label: key }));

  const headerLine = effectiveHeaders.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');

  const dataLines = rows.map(row => {
    return effectiveHeaders.map(h => {
      const val = row[h.key] ?? '';
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
