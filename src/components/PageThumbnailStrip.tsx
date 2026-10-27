import React from 'react';
import { Layers, CheckCircle2, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { PDFPage } from '../types';

interface PageThumbnailStripProps {
  pages: PDFPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onBatchColorize: () => void;
  isProcessingBatch: boolean;
}

export const PageThumbnailStrip: React.FC<PageThumbnailStripProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onBatchColorize,
  isProcessingBatch,
}) => {
  const coloredCount = pages.filter((p) => p.colorizedDataUrl).length;
  const total = pages.length;

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left header / Batch Button */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
            Páginas del documento ({total}):
          </span>

          {total > 1 && (
            <button
              type="button"
              onClick={onBatchColorize}
              disabled={isProcessingBatch}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isProcessingBatch ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              )}
              <span>
                {isProcessingBatch
                  ? 'Coloreando...'
                  : coloredCount === total
                  ? 'Re-colorear todo'
                  : `Colorear todo (${coloredCount}/${total})`}
              </span>
            </button>
          )}
        </div>

        {/* Carousel / Thumbnails */}
        <div className="relative flex-1 flex items-center overflow-hidden">
          {total > 4 && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 z-10 p-1 rounded-full bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 shadow-md"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 px-6 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pages.map((page, idx) => {
              const isActive = idx === activePageIndex;
              const isDone = Boolean(page.colorizedDataUrl);
              const isProcessing = page.status === 'processing';

              return (
                <button
                  key={page.pageNumber}
                  type="button"
                  onClick={() => onSelectPage(idx)}
                  className={`group relative flex items-center gap-2 p-1.5 rounded-lg border transition-all shrink-0 text-left ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-10 h-12 rounded bg-slate-800 overflow-hidden border border-slate-700/50">
                    <img
                      src={page.colorizedDataUrl || page.originalDataUrl}
                      alt={`Página ${page.pageNumber}`}
                      className="w-full h-full object-cover"
                    />

                    {isProcessing && (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                        <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                      </div>
                    )}

                    {isDone && !isProcessing && (
                      <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Page Info */}
                  <div className="pr-2">
                    <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      Pág. {page.pageNumber}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isProcessing ? 'Procesando' : isDone ? 'A Color' : 'B/N'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {total > 4 && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 z-10 p-1 rounded-full bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 shadow-md"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
