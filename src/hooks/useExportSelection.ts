import { useState, useCallback } from 'react';
import { message } from 'antd';

interface ExportItem {
  id: string;
}

export type ExportFormat = 'json' | 'csv';

export const useExportSelection = <T extends ExportItem>() => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      }
      return [...prev, id];
    });
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedIds(items.map(item => item.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsSelectMode(false);
  }, []);

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  const convertToCSV = useCallback((data: unknown): string => {
    if (!Array.isArray(data)) return '';
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0] as Record<string, unknown>);
    const rows = data.map(item => {
      return headers.map(header => {
        const value = (item as Record<string, unknown>)[header];
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }, []);

  const downloadFile = useCallback((data: unknown, filename: string, format: ExportFormat = 'json') => {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      content = convertToCSV(data);
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`导出成功，格式：${format === 'csv' ? 'CSV' : 'JSON'}`);
  }, [convertToCSV]);

  return {
    selectedIds,
    isSelectMode,
    toggleSelect,
    selectAll,
    clearSelection,
    enterSelectMode,
    exitSelectMode,
    isSelected,
    downloadFile,
    selectedCount: selectedIds.length
  };
};
