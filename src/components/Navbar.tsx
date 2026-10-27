import React, { useEffect, useState } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Sparkles,
  Layers,
  Wand2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { DocumentState } from '../types';

interface NavbarProps {
  document: DocumentState | null;
  onNewUpload: () => void;
  onExportClick: () => void;
  onBatchColorize: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  document,
  onNewUpload,
  onExportClick,
  onBatchColorize,
  isProcessing,
}) => {
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHasServerKey(Boolean(data.hasKey));
      })
      .catch(() => {
        setHasServerKey(false);
      });
  }, []);

  const coloredPagesCount = document?.pages.filter((p) => p.colorizedDataUrl).length || 0;
  const totalPages = document?.totalPages || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Wand2 className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                PDF a Color AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Studio Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Convierte documentos, planos y gráficos monocromáticos en versiones a todo color
            </p>
          </div>
        </div>

        {/* Center: Doc Info if loaded */}
        {document && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-medium truncate max-w-[200px]" title={document.fileName}>
              {document.fileName}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {coloredPagesCount}/{totalPages} páginas a color
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status Pill */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${
              hasServerKey
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}
            title={
              hasServerKey
                ? 'Gemini Vision AI Activo'
                : 'Motor de Colorización Neural de Alta Definición Listo'
            }
          >
            {hasServerKey ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Gemini AI Activo</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Motor Neural HD</span>
              </>
            )}
          </div>

          {document && (
            <>
              {/* Batch Colorize Button */}
              {totalPages > 1 && (
                <button
                  type="button"
                  onClick={onBatchColorize}
                  disabled={isProcessing}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50"
                  title="Aplica la colorización a todas las páginas automáticamente"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>Colorear Todo</span>
                </button>
              )}

              {/* Upload New Doc */}
              <button
                type="button"
                onClick={onNewUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cargar otro documento o imagen"
              >
                <UploadCloud className="w-4 h-4" />
                <span className="hidden sm:inline">Cambiar PDF</span>
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={onExportClick}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
