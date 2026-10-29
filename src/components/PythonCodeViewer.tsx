import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  FolderTree
} from 'lucide-react';

interface PythonCodeViewerProps {
  files: Record<string, string>;
  onDownloadZip: () => void;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ files, onDownloadZip }) => {
  const fileKeys = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState<string>(fileKeys[0] || 'app.py');
  const [copied, setCopied] = useState(false);

  const currentContent = files[selectedFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Quick Execution Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-red-500" />
              Execução Local do Projeto Python Streamlit
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Código modular 100% aderente à especificação oficial do SGT3 Claro / Grupo Talentos.
            </p>
          </div>

          <button
            onClick={onDownloadZip}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold shadow-md shadow-red-950 flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Projeto Completo (.ZIP)</span>
          </button>
        </div>

        {/* Terminal commands box */}
        <div className="mt-4 bg-black/70 rounded-lg p-3 font-mono text-xs text-slate-300 border border-slate-800">
          <div className="text-slate-500 text-[11px] mb-1"># Comandos no terminal local (Linux, macOS ou Windows PowerShell):</div>
          <div className="text-emerald-400 font-bold">$ pip install -r requirements.txt</div>
          <div className="text-emerald-400 font-bold">$ streamlit run app.py</div>
        </div>
      </div>

      {/* Code Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-4">
        {/* File Tree Column */}
        <div className="lg:col-span-1 bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 flex flex-col gap-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-red-400" />
            Arquivos do Projeto
          </div>

          {fileKeys.map((filename) => {
            const isSelected = selectedFile === filename;
            return (
              <button
                key={filename}
                onClick={() => setSelectedFile(filename)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                  isSelected
                    ? 'bg-red-600/20 text-white border border-red-500/70 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCode className={`w-4 h-4 ${isSelected ? 'text-red-400' : 'text-slate-500'}`} />
                <span>{filename}</span>
              </button>
            );
          })}

          <div className="mt-4 pt-3 border-t border-slate-800/80 px-2 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200 block mb-1">Arquitetura Modular:</strong>
            • <code className="text-red-400">app.py</code>: UI Streamlit completa<br />
            • <code className="text-red-400">parsers.py</code>: Extração de texto/mensagens<br />
            • <code className="text-red-400">validators.py</code>: Módulo 11 CPF, Login Z<br />
            • <code className="text-red-400">excel_engine.py</code>: openpyxl + macros .xlsm
          </div>
        </div>

        {/* Code View Column */}
        <div className="lg:col-span-3 flex flex-col">
          {/* File Action Topbar */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-xs">{selectedFile}</span>
              <span className="text-slate-500 text-[11px]">({currentContent.split('\n').length} linhas)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[580px] leading-relaxed selection:bg-red-800 selection:text-white">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
