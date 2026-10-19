import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { exportData, importData, resetDefaults } = useApp();
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dsa_revision_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ text: 'Backup downloaded successfully!', type: 'success' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!importText.trim()) {
      setStatusMsg({ text: 'Please paste JSON or choose a backup file first.', type: 'error' });
      return;
    }

    const ok = importData(importText);
    if (ok) {
      setStatusMsg({ text: 'Revision history imported successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
        setImportText('');
      }, 1200);
    } else {
      setStatusMsg({ text: 'Failed to parse JSON. Please check file format.', type: 'error' });
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all progress back to the default DSA MindMap dataset? Any custom entries will be restored to initial state.')) {
      await resetDefaults();
      setStatusMsg({ text: 'Reset completed to default library!', type: 'success' });
      setTimeout(() => {
        onClose();
        setStatusMsg(null);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 text-card-foreground max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Backup & Persistence
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Keep your DSA revision progress safe across devices and browsers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`my-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Export Section */}
          <div className="p-4 rounded-xl bg-secondary/40 border border-border">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Export Revision History
            </h4>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Export all your tracked patterns, spaced intervals, problems, and mistake journal entries as a JSON file.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Backup JSON
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-xl bg-secondary/40 border border-border">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Import or Restore Backup
            </h4>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Upload a previously exported backup file or paste its JSON content below.
            </p>

            <div className="flex items-center gap-3 mb-3">
              <label className="cursor-pointer px-3.5 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-xs font-medium transition-colors border border-border flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Select File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-muted-foreground">or paste JSON below</span>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste backup JSON string here..."
              rows={4}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground font-mono focus:border-primary focus:outline-none"
            />

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleApplyImport}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Restore Progress
              </button>
            </div>
          </div>

          {/* Reset Section */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Need to start fresh with default DSA patterns?</span>
            <button
              onClick={handleReset}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
