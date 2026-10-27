import React, { useState } from 'react';
import {
  Download,
  FileText,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFPage } from '../types';
import { exportToPdf, downloadBlob } from '../utils/pdfProcessor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PDFPage[];
  fileName: string;
  activePageIndex: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pages,
  fileName,
  activePageIndex,
}) => {
  const [exportScope, setExportScope] = useState<'all' | 'coloredOnly' | 'currentPage'>('all');
  const [includeOriginals, setIncludeOriginals] = useState<boolean>(true);
  const [customName, setCustomName] = useState(() => {
    const base = fileName.replace(/\.[^/.]+$/, '');
    return `${base}_a_color.pdf`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);

  if (!isOpen) return null;

  const totalPages = pages.length;
  const coloredPages = pages.filter((p) => p.colorizedDataUrl);
  const coloredCount = coloredPages.length;

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportProgress({ current: 0, total: totalPages });

    try {
      let pagesToExport: PDFPage[] = [];

      if (exportScope === 'currentPage') {
        pagesToExport = [pages[activePageIndex]];
      } else if (exportScope === 'coloredOnly') {
        pagesToExport = coloredPages.length > 0 ? coloredPages : [pages[activePageIndex]];
      } else {
        pagesToExport = pages;
      }

      const blob = await exportToPdf(pagesToExport, {
        fileName: customName,
        includeOriginalsIfUncolorized: includeOriginals,
        onProgress: (current, total) => setExportProgress({ current, total }),
      });

      downloadBlob(blob, customName);

      // Trigger celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'],
        });
      } catch (_e) {}

      onClose();
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleDownloadSinglePng = () => {
    const activePage = pages[activePageIndex];
    const dataUrl = activePage.colorizedDataUrl || activePage.originalDataUrl;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pagina_${activePage.pageNumber}_a_color.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (_e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-400 rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exportar Documento a Color</h3>
              <p className="text-xs text-slate-400">Descarga tu PDF listo para imprimir o compartir</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Settings */}
        <div className="py-5 space-y-5">
          {/* File Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre del Archivo
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Scope selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Páginas a Incluir
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'all'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">Todo el Documento</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{totalPages} página(s)</p>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('coloredOnly')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'coloredOnly'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">Solo Coloreadas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{coloredCount} página(s)</p>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('currentPage')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  exportScope === 'currentPage'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 text-slate-400'
                }`}
              >
                <p className="text-xs font-bold">Página Actual</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Pág. {activePageIndex + 1}</p>
              </button>
            </div>
          </div>

          {/* Options */}
          {exportScope === 'all' && coloredCount < totalPages && (
            <label className="flex items-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOriginals}
                onChange={(e) => setIncludeOriginals(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <span className="text-xs text-slate-300">
                Mantener en el PDF original las páginas aún no coloreadas ({totalPages - coloredCount})
              </span>
            </label>
          )}

          {/* Progress bar if exporting */}
          {isExporting && exportProgress && (
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>Construyendo documento PDF...</span>
                <span>
                  {exportProgress.current} / {exportProgress.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-200"
                  style={{
                    width: `${Math.round((exportProgress.current / exportProgress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadSinglePng}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>Descargar Pág. {activePageIndex + 1} como PNG</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generando PDF...' : 'Descargar PDF a Color'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
