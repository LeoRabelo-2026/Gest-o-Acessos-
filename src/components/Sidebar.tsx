import React, { useRef } from 'react';
import {
  FileText,
  UserPlus,
  UserX,
  RefreshCw,
  Monitor,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  FileCode2,
  HelpCircle,
  Check
} from 'lucide-react';
import { SGT3FormType } from '../types/sgt3';
import { FORM_CONFIGS } from '../utils/sampleData';

interface SidebarProps {
  currentForm: SGT3FormType;
  onSelectForm: (form: SGT3FormType) => void;
  templateFile: File | null;
  onTemplateUpload: (file: File | null) => void;
  onDownloadPythonZip: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentForm,
  onSelectForm,
  templateFile,
  onTemplateUpload,
  onDownloadPythonZip
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formButtons: { id: SGT3FormType; icon: React.ReactNode; label: string; fileType: string }[] = [
    {
      id: 'CRIACAO_IDENTIDADE',
      icon: <UserPlus className="w-4 h-4" />,
      label: 'Criação de Identidade',
      fileType: '.xlsm (V 16)'
    },
    {
      id: 'REVOGACAO',
      icon: <UserX className="w-4 h-4" />,
      label: 'Revogação de Acessos',
      fileType: '.xlsx'
    },
    {
      id: 'ATUALIZA_STATUS',
      icon: <RefreshCw className="w-4 h-4" />,
      label: 'Atualização de Status',
      fileType: '.xlsm'
    },
    {
      id: 'DUO_DESKTOP',
      icon: <Monitor className="w-4 h-4" />,
      label: 'Ativação DUO Desktop',
      fileType: '.xlsx'
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onTemplateUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="w-full md:w-72 lg:w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-5 text-slate-200">
      {/* Grupo Talentos / Claro Header Badge */}
      <div className="bg-gradient-to-br from-red-950/70 to-slate-900 border border-red-900/60 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          TALENTOS TOTAL SERVIÇOS
        </div>
        <div className="text-xs text-slate-300 leading-tight">
          CNPJ: 54.956.511/0001-00<br />
          Operação Claro Brasil • Call Center Cobrança
        </div>
      </div>

      {/* Model Selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Modelos de Planilha SGT3
        </label>
        <div className="flex flex-col gap-1.5">
          {formButtons.map(btn => {
            const isSelected = currentForm === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onSelectForm(btn.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all text-left border ${
                  isSelected
                    ? 'bg-red-600/20 text-white border-red-500 shadow-sm shadow-red-950'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isSelected ? 'text-red-400' : 'text-slate-400'}`}>
                    {btn.icon}
                  </span>
                  <div>
                    <div className="font-semibold">{btn.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{btn.fileType}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-red-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload de Template Opcional */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-red-400" />
            Template Base (Opcional)
          </label>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5 leading-snug">
          Envie o arquivo original <span className="text-slate-200 font-mono">.xlsx</span> ou{' '}
          <span className="text-slate-200 font-mono">.xlsm</span> com macros para sobrepor o layout nativo.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={handleFileChange}
        />

        {templateFile ? (
          <div className="bg-emerald-950/40 border border-emerald-700/60 p-2 rounded flex items-center justify-between text-xs text-emerald-300">
            <div className="truncate max-w-[180px]">
              <span className="font-semibold block truncate">{templateFile.name}</span>
              <span className="text-[10px] text-emerald-400">{(templateFile.size / 1024).toFixed(1)} KB carregado</span>
            </div>
            <button
              onClick={() => onTemplateUpload(null)}
              className="text-slate-400 hover:text-red-400 text-xs px-1 font-bold"
              title="Remover template customizado"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded border border-slate-600 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Carregar Arquivo Base
          </button>
        )}
      </div>

      {/* Regras Operacionais Rápidas */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          Regras SGT3 Ativas
        </div>
        <ul className="space-y-1.5 text-[11px] text-slate-400">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>CPF:</strong> Módulo 11 oficial (rejeita 111.111.111-11 e cálculos errados).</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Login Z:</strong> Letra 'Z' + 6 dígitos numéricos (ex: Z559454).</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>DUO Desktop:</strong> Inserção estrita na <strong>Linha 8</strong>; GUID em minúsculas.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>Macros .xlsm:</strong> Preservação total de código VBA e listas suspensas.</span>
          </li>
        </ul>
      </div>

      {/* Download do Pacote Python Streamlit */}
      <div className="mt-auto pt-2">
        <button
          onClick={onDownloadPythonZip}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <FileCode2 className="w-4 h-4" />
          <span>Baixar Pacote Python (.ZIP)</span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Inclui app.py, parsers.py, validators.py, excel_engine.py e requirements.txt
        </p>
      </div>
    </aside>
  );
};
