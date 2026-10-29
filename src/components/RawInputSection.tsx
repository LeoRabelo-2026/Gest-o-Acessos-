import React from 'react';
import { Play, Sparkles, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import { SGT3FormType } from '../types/sgt3';
import { SAMPLE_INPUTS, FORM_CONFIGS } from '../utils/sampleData';

interface RawInputSectionProps {
  currentForm: SGT3FormType;
  rawInput: string;
  setRawInput: (val: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export const RawInputSection: React.FC<RawInputSectionProps> = ({
  currentForm,
  rawInput,
  setRawInput,
  onProcess,
  isProcessing
}) => {
  const samples = SAMPLE_INPUTS[currentForm];
  const config = FORM_CONFIGS[currentForm];

  const lineCount = rawInput.trim() ? rawInput.trim().split('\n').length : 0;
  const charCount = rawInput.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>1. Entrada de Mensagens ou Dados Brutos</span>
            <span className="text-xs font-normal text-slate-400">({config.title})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cole mensagens do WhatsApp, Teams, e-mails ou linhas copiadas diretamente de planilhas Excel (TSV / CSV).
          </p>
        </div>

        {/* Quick Sample Fill Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setRawInput(samples.valid)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Carregar exemplo válido com múltiplos registros"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Exemplo Válido
          </button>

          <button
            onClick={() => setRawInput(samples.withIssues)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Carregar exemplo com erros para testar os alertas"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Exemplo c/ Erros
          </button>

          {rawInput && (
            <button
              onClick={() => setRawInput('')}
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
              title="Limpar campo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={samples.placeholder}
          rows={7}
          className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg p-3.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-y transition-all leading-relaxed"
        />

        {/* Status footer inside textarea */}
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>{lineCount} linhas detectadas</span>
            <span>•</span>
            <span>{charCount} caracteres</span>
            <span>•</span>
            <span className="text-slate-300">Layout de saída: <strong className="font-mono text-white">{config.filename}</strong></span>
          </div>

          <button
            onClick={onProcess}
            disabled={!rawInput.trim() || isProcessing}
            className={`px-5 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              !rawInput.trim() || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-950/50 active:scale-[0.98]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Processar e Validar Regras</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
