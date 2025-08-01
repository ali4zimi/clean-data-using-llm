/**
 * Download utilities for various file formats
 */

export const downloadCSV = (data: any[], columnOrder: string[], filename: string = 'data.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = columnOrder.length > 0 ? columnOrder : Object.keys(data[0]);
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item => 
      headers.map(header => {
        const value = item[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
};

export const downloadJSON = (data: any[], columnOrder: string[], filename: string = 'data.json') => {
  if (!data || data.length === 0) return;
  
  // Reorder JSON data according to column order
  const orderedData = data.map(item => {
    const orderedItem: any = {};
    const headers = columnOrder.length > 0 ? columnOrder : Object.keys(item);
    headers.forEach(header => {
      orderedItem[header] = item[header] || '';
    });
    return orderedItem;
  });
  
  const jsonContent = JSON.stringify(orderedData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const downloadFileFromFile = (file: File, filename?: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
