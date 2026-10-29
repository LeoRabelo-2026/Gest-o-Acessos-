import React from 'react';
import { Download, FileSpreadsheet, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import {
  SGT3FormType,
  CriacaoIdentidadeRecord,
  RevogacaoRecord,
  AtualizaStatusRecord,
  DuoDesktopRecord
} from '../types/sgt3';
import { FORM_CONFIGS } from '../utils/sampleData';

interface DataTableProps {
  currentForm: SGT3FormType;
  records: any[];
  onDownloadExcel: () => void;
  isDownloading: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  currentForm,
  records,
  onDownloadExcel,
  isDownloading
}) => {
  const config = FORM_CONFIGS[currentForm];
  const [copied, setCopied] = React.useState(false);

  if (records.length === 0) return null;

  const validCount = records.filter(r => r.is_valid).length;
  const invalidCount = records.length - validCount;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(records, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Table Header Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>2. Dados Extraídos & Mapeamento de Colunas</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {records.length} registro{records.length > 1 ? 's' : ''}
            </span>
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span className="text-emerald-400 font-medium">✓ {validCount} válidos</span>
            {invalidCount > 0 && <span className="text-red-400 font-medium">⚠ {invalidCount} pendentes</span>}
            <span>•</span>
            <span>Início na planilha: <strong>Linha {config.startRow}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyJSON}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copiar dados extraídos em formato JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
          </button>

          <button
            onClick={onDownloadExcel}
            disabled={isDownloading}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-md shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar {config.filename}</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 text-[11px] uppercase tracking-wider z-10">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-3 w-28">Status</th>

              {currentForm === 'CRIACAO_IDENTIDADE' && (
                <>
                  <th className="py-2.5 px-3">CPF (Col I)</th>
                  <th className="py-2.5 px-3">Nome Completo (Col J)</th>
                  <th className="py-2.5 px-3">Dt Nasc (Col K)</th>
                  <th className="py-2.5 px-3">Celular (Col M)</th>
                  <th className="py-2.5 px-3">E-mail (Col N)</th>
                  <th className="py-2.5 px-3">Qualificação (Col O)</th>
                  <th className="py-2.5 px-3">CNPJ Contratante (Col P)</th>
                  <th className="py-2.5 px-3">Gestor (Col AF)</th>
                </>
              )}

              {currentForm === 'REVOGACAO' && (
                <>
                  <th className="py-2.5 px-3">Login Z (Col A)</th>
                  <th className="py-2.5 px-3">Nome (Col B)</th>
                  <th className="py-2.5 px-3">CPF (Col C - 11d)</th>
                  <th className="py-2.5 px-3">Empresa (Col D)</th>
                </>
              )}

              {currentForm === 'ATUALIZA_STATUS' && (
                <>
                  <th className="py-2.5 px-3">CPF (Col A - 11d)</th>
                  <th className="py-2.5 px-3">Nome Completo (Col C)</th>
                  <th className="py-2.5 px-3">Razão Social (Col D)</th>
                  <th className="py-2.5 px-3 text-center">Férias (Col E)</th>
                  <th className="py-2.5 px-3 text-center">Ret. Férias (Col F)</th>
                  <th className="py-2.5 px-3 text-center">Licença (Col G)</th>
                  <th className="py-2.5 px-3 text-center">Ret. Licença (Col H)</th>
                </>
              )}

              {currentForm === 'DUO_DESKTOP' && (
                <>
                  <th className="py-2.5 px-3">Origem (Col D)</th>
                  <th className="py-2.5 px-3">Login Z (Col L)</th>
                  <th className="py-2.5 px-3">Nome Completo (Col N)</th>
                  <th className="py-2.5 px-3">Hostname (Col R)</th>
                  <th className="py-2.5 px-3">Machineguid (Col T)</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
            {records.map((rec, idx) => {
              const rowNum = config.startRow + idx;
              return (
                <tr
                  key={rec.id || idx}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    !rec.is_valid ? 'bg-red-950/20' : idx % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-900/30'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                    {rowNum}
                  </td>

                  <td className="py-2.5 px-3">
                    {rec.is_valid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Válido
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800" title={rec.issues.join(' | ')}>
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        Pendente
                      </span>
                    )}
                  </td>

                  {currentForm === 'CRIACAO_IDENTIDADE' && (
                    <>
                      <td className="py-2.5 px-3 font-mono text-slate-200">
                        <span className={rec.cpf_valido ? 'text-emerald-300 font-semibold' : 'text-red-400 font-bold underline'}>
                          {rec.cpf_formatado}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{rec.nome_completo}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{rec.data_nascimento}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{rec.telefone_celular}</td>
                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[180px]">{rec.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
                          {rec.qualificacao}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">54.956.511/0001-00</td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] whitespace-nowrap">DEGLEITON AQUINO DE MELO</td>
                    </>
                  )}

                  {currentForm === 'REVOGACAO' && (
                    <>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={rec.login_z_valido ? 'text-emerald-300 font-bold' : 'text-red-400 font-bold underline'}>
                          {rec.login_z}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{rec.nome}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={rec.cpf_valido ? 'text-slate-200' : 'text-red-400 font-bold underline'}>
                          {rec.cpf_numeros}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{rec.empresa}</td>
                    </>
                  )}

                  {currentForm === 'ATUALIZA_STATUS' && (
                    <>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={rec.cpf_valido ? 'text-slate-200' : 'text-red-400 font-bold underline'}>
                          {rec.cpf_numeros}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{rec.nome_completo}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{rec.razao_social}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-400">
                        {rec.situacao === 'FERIAS' ? 'X' : ''}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-400">
                        {rec.situacao === 'RETORNO FERIAS' ? 'X' : ''}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-400">
                        {rec.situacao === 'LICENCA' ? 'X' : ''}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-red-400">
                        {rec.situacao === 'RETORNO LICENCA' ? 'X' : ''}
                      </td>
                    </>
                  )}

                  {currentForm === 'DUO_DESKTOP' && (
                    <>
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-300">CLARO BR</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={rec.login_z_valido ? 'text-emerald-300 font-bold' : 'text-red-400 font-bold underline'}>
                          {rec.login_z}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{rec.nome_completo}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={rec.hostname_valido ? 'text-blue-300' : 'text-red-400 font-bold underline'}>
                          {rec.hostname}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className={rec.machineguid_valido ? 'text-slate-300' : 'text-red-400 font-bold underline'}>
                          {rec.machineguid}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
