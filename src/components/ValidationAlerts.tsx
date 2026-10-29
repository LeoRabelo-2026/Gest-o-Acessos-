import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { BaseRecord } from '../types/sgt3';

interface ValidationAlertsProps {
  records: BaseRecord[];
}

export const ValidationAlerts: React.FC<ValidationAlertsProps> = ({ records }) => {
  const invalidRecords = records.filter(r => !r.is_valid);
  const totalIssues = records.reduce((acc, r) => acc + r.issues.length, 0);

  if (records.length === 0) return null;

  if (invalidRecords.length === 0) {
    return (
      <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-200 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-900/60 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Validação Aprovada: 100% de Conformidade ({records.length} registro{records.length > 1 ? 's' : ''})
            </h3>
            <p className="text-emerald-300/90 text-xs">
              Todos os CPFs, Logins Z, Machineguids e regras de layout foram matematicamente aprovados para preenchimento oficial.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-950/30 border border-red-900/80 rounded-xl p-4 text-xs shadow-md space-y-3 animate-in fade-in duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-900/60 flex items-center justify-center flex-shrink-0 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-red-200 text-sm flex items-center gap-2">
              Painel de Inconsistências Detectadas
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-red-900/80 text-red-300 border border-red-700/60">
                {invalidRecords.length} registro{invalidRecords.length > 1 ? 's' : ''} com erro • {totalIssues} falha{totalIssues > 1 ? 's' : ''}
              </span>
            </h3>
            <p className="text-slate-300 text-xs mt-0.5">
              Corrija as pendências apontadas abaixo antes de enviar ao gestor SGT3 Claro ou gerar a planilha final.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {invalidRecords.map((rec, idx) => (
          <div
            key={rec.id || idx}
            className="bg-slate-900/90 border border-red-900/60 rounded-lg p-2.5 text-xs text-slate-300 space-y-1.5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-semibold text-red-300 font-mono text-[11px]">
                Registro #{idx + 1}
              </span>
              <span className="text-[10px] text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-900/70">
                {rec.issues.length} erro{rec.issues.length > 1 ? 's' : ''}
              </span>
            </div>

            <ul className="space-y-1 text-[11px]">
              {rec.issues.map((issue, iIdx) => (
                <li key={iIdx} className="flex items-start gap-1.5 text-red-300">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>

            {rec.raw_source && (
              <div className="text-[10px] text-slate-500 font-mono truncate pt-0.5 border-t border-slate-800/60">
                Origem: {rec.raw_source}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
