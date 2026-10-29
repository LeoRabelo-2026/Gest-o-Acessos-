import React from 'react';
import { Layers, FileSpreadsheet, Code2, BookOpen, ShieldCheck } from 'lucide-react';
import { SGT3FormType } from '../types/sgt3';
import { FORM_CONFIGS } from '../utils/sampleData';

interface HeaderProps {
  currentForm: SGT3FormType;
  activeTab: 'app' | 'code' | 'docs';
  setActiveTab: (tab: 'app' | 'code' | 'docs') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentForm, activeTab, setActiveTab }) => {
  const currentConfig = FORM_CONFIGS[currentForm];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/40 border border-red-500">
              <span className="tracking-tighter text-sm font-extrabold">SGT3</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Central de Automação SGT3
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/40">
                    Claro & Grupo Talentos
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Extração não estruturada, validação matemática e geração das 4 planilhas oficiais
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('app')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'app'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Operação SGT3</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código Python (Streamlit)</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Layouts & Regras</span>
            </button>
          </div>
        </div>

        {/* Current Active Planilha Sub-bar */}
        <div className="py-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Modelo Ativo:</span>
            <span className="font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
              {currentConfig.title}
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-red-400">{currentConfig.filename}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Validação Módulo 11 Ativa
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50 font-medium">
              {currentConfig.badge}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
