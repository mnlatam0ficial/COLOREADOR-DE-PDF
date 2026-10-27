import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Compass,
  FileSpreadsheet,
  Palette,
  Scroll,
  ArrowRight,
  ShieldCheck,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { SAMPLE_DOCS, SampleDocMeta } from '../utils/samplePdfs';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sampleId: string) => void;
  isLoading: boolean;
  loadingMessage?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onSampleSelected,
  isLoading,
  loadingMessage = 'Procesando documento...',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    return (
      validTypes.includes(file.type) ||
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.jpeg')
    );
  };

  const getSampleIcon = (id: string) => {
    switch (id) {
      case 'blueprint':
        return <Compass className="w-5 h-5 text-sky-400" />;
      case 'corporate':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'comic':
        return <Palette className="w-5 h-5 text-pink-400" />;
      case 'vintage':
        return <Scroll className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Restaura y dale vida a tus documentos monocromáticos</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Haz una versión a <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">color</span> de cualquier PDF
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Sube tus archivos en blanco y negro —planos, informes financieros, libros de colorear, cómics o documentos históricos— y transfórmalos a todo color manteniendo el texto y las líneas nítidas.
        </p>
      </div>

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/80 shadow-xl'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{loadingMessage}</p>
              <p className="text-xs text-slate-400 mt-1">
                Extrayendo páginas en alta definición y preparando lienzo de color...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <UploadCloud className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Arrastra y suelta tu archivo PDF o imagen aquí
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Soporta documentos PDF de múltiples páginas, escaneos e imágenes PNG, JPG y WebP en alta resolución.
            </p>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all">
              <FileText className="w-4 h-4" />
              <span>Explorar archivos del equipo</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-500 mt-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Procesamiento seguro
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Calidad Retina HD
              </span>
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" /> Exportación en PDF
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instant Sample Documents Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>¿No tienes un PDF a mano? Prueba con estos ejemplos en 1 clic:</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic sobre cualquier muestra en blanco y negro para ver la colorización en tiempo real.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_DOCS.map((sample: SampleDocMeta) => (
            <div
              key={sample.id}
              onClick={() => !isLoading && onSampleSelected(sample.id)}
              className="group relative flex flex-col justify-between p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:bg-slate-700/80 transition-colors">
                    {getSampleIcon(sample.id)}
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {sample.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Colorear ahora</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
