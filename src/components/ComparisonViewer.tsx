import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  SplitSquareHorizontal,
  Columns2,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import { PDFPage } from '../types';

interface ComparisonViewerProps {
  page: PDFPage;
  totalPages: number;
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  onDownloadPageImage: (format: 'png' | 'jpg') => void;
}

export type ViewMode = 'split' | 'sideBySide' | 'color' | 'original';

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  page,
  totalPages,
  currentPageIndex,
  onPageChange,
  onDownloadPageImage,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when page changes
  useEffect(() => {
    setZoomLevel(1);
  }, [page.pageNumber]);

  // Handle slider drag
  const handlePointerDown = () => {
    setIsDraggingSlider(true);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
      if (!isDraggingSlider || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    },
    [isDraggingSlider]
  );

  const handlePointerUp = useCallback(() => {
    setIsDraggingSlider(false);
  }, []);

  useEffect(() => {
    if (isDraggingSlider) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingSlider, handlePointerMove, handlePointerUp]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(3, Math.max(0.5, prev + delta)));
  };

  const handleFitScreen = () => {
    setZoomLevel(1);
  };

  const isColorReady = Boolean(page.colorizedDataUrl);
  const isProcessing = page.status === 'processing';

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-0 relative select-none">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-slate-800/80 bg-slate-900/60 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Deslizador interactivo Antes / Después"
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deslizador</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'sideBySide'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Ver Original y Color en paralelo"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lado a Lado</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('color')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'color'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Ver únicamente la versión a color"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solo Color</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              viewMode === 'original'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Ver únicamente el original en blanco y negro"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Solo B/N</span>
          </button>
        </div>

        {/* Center: Page Switcher */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <button
            type="button"
            onClick={() => onPageChange(currentPageIndex - 1)}
            disabled={currentPageIndex <= 0}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Pág. <span className="font-bold text-white">{currentPageIndex + 1}</span> de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPageIndex + 1)}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Quick PNG Download */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Alejar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.25)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Acercar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleFitScreen}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Ajustar al área de visualización"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => onDownloadPageImage('png')}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Descargar esta página en formato PNG de alta resolución"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Descargar Imagen</span>
          </button>
        </div>
      </div>

      {/* Main Canvas / Viewer Workspace */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center relative bg-radial from-slate-900/50 to-slate-950">
        {/* Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white">Sintetizando versión a color...</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Analizando tonos, preservando tipografía nítida y aplicando paleta armónica.
              </p>
            </div>
          </div>
        )}

        {/* 1. Split Screen View */}
        {viewMode === 'split' && (
          <div
            ref={containerRef}
            className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800/80 bg-white"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isDraggingSlider ? 'none' : 'transform 0.15s ease-out',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Base Image: Colorized Version (or Original if not yet colored) */}
            <img
              src={page.colorizedDataUrl || page.originalDataUrl}
              alt="Versión a color"
              className="block max-h-[75vh] w-auto max-w-full object-contain pointer-events-none select-none"
            />

            {/* Clipped Top Image: Original B&W Version */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <img
                src={page.originalDataUrl}
                alt="Versión original blanco y negro"
                className="block max-h-[75vh] w-auto max-w-full object-contain pointer-events-none select-none"
              />

              {/* Tag "Original B/N" */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-lg">
                ORIGINAL (B/N)
              </div>
            </div>

            {/* Tag "Versión a Color" */}
            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-indigo-400/30 shadow-lg pointer-events-none">
              A TODO COLOR
            </div>

            {/* Divider Handle */}
            <div
              onPointerDown={handlePointerDown}
              className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.6)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-indigo-600 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                <SplitSquareHorizontal className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        {/* 2. Side by Side View */}
        {viewMode === 'sideBySide' && (
          <div
            className="flex flex-col md:flex-row items-center justify-center gap-6"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Left: Original */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 mb-2 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                ORIGINAL (B/N)
              </span>
              <div className="rounded-lg overflow-hidden border border-slate-800 shadow-xl bg-white">
                <img
                  src={page.originalDataUrl}
                  alt="Original"
                  className="max-h-[68vh] w-auto object-contain block"
                />
              </div>
            </div>

            {/* Right: Colorized */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-indigo-400 mb-2 px-2.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
                VERSIÓN A COLOR
              </span>
              <div className="rounded-lg overflow-hidden border border-indigo-500/30 shadow-2xl bg-white">
                <img
                  src={page.colorizedDataUrl || page.originalDataUrl}
                  alt="A Color"
                  className="max-h-[68vh] w-auto object-contain block"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Color Only */}
        {viewMode === 'color' && (
          <div
            className="rounded-lg overflow-hidden border border-indigo-500/30 shadow-2xl bg-white relative"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-indigo-400/30 shadow-lg">
              VERSIÓN A COLOR
            </div>
            <img
              src={page.colorizedDataUrl || page.originalDataUrl}
              alt="A Color"
              className="max-h-[75vh] w-auto object-contain block"
            />
          </div>
        )}

        {/* 4. Original Only */}
        {viewMode === 'original' && (
          <div
            className="rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-white relative"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/20 shadow-lg">
              ORIGINAL (B/N)
            </div>
            <img
              src={page.originalDataUrl}
              alt="Original"
              className="max-h-[75vh] w-auto object-contain block"
            />
          </div>
        )}
      </div>

      {/* Helper caption */}
      <div className="py-1 px-4 text-center text-[11px] text-slate-500 bg-slate-950/90 border-t border-slate-900 flex items-center justify-center gap-4">
        <span>💡 Arrastra el divisor para comparar el antes y después en tiempo real</span>
        <span>•</span>
        <span>Resolución Retina de alta fidelidad</span>
      </div>
    </div>
  );
};
