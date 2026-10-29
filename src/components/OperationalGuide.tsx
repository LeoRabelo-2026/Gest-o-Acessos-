import React from 'react';
import { BookOpen, Table, FileSpreadsheet, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const OperationalGuide: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-200 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-red-500" />
          Guia Operacional e Regras de Negócio SGT3 (Claro / Grupo Talentos)
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Este guia sintetiza as especificações oficiais de cada planilha, o mapeamento exato de linhas e colunas,
          e as regras de validação necessárias para evitar recusas na auditoria de segurança da Claro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Model 1: Criação de Identidade */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-white text-sm">A. Criação de Identidade</h3>
              <span className="font-mono text-xs text-red-400">SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
              V 16 • Macros Ativas
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Utilizado para cadastrar novos terceiros e solicitar acessos de rede e sistemas.
          </p>

          <div className="bg-slate-950 rounded-lg p-3 text-xs space-y-1.5 font-mono">
            <div className="text-red-400 font-bold mb-1">Mapeamento (Dados iniciam na Linha 6):</div>
            <div>• Col B (2): TERCEIRO CALL CENTER</div>
            <div>• Col C (3): NÃO | Col D (4): SIM (CLARO + NET + EMBRATEL)</div>
            <div>• Col I (9): CPF formatado (000.000.000-00, Módulo 11)</div>
            <div>• Col J (10): Nome Completo em MAIÚSCULAS</div>
            <div>• Col K (11): Data de Nascimento (DD/MM/AAAA)</div>
            <div>• Col M (13): Celular ((XX) XXXXX-XXXX)</div>
            <div>• Col N (14): E-mail (suporte@grupotalentos.com.br)</div>
            <div>• Col O (15): Qualificação (FUNDAMENTAL, MÉDIO ou SUPERIOR)</div>
            <div>• Col P (16) & T (20): CNPJ 54.956.511/0001-00</div>
            <div>• Col Q (17) & U (21): Talentos Total Servicos LTDA ME</div>
            <div>• Col R (18): CALL CENTER - COBRANÇA | Col V (22): CLT</div>
            <div>• Col Y (25): SUPORTE AO NEGOCIO | Col Z (26): TERCEIRIZAÇÃO</div>
            <div>• Col AA (27): SERVIÇOS DE APOIO | Col AB (28): CLARO SP</div>
            <div>• Col AE (31): 028.463.376-32 | Col AF (32): DEGLEITON AQUINO DE MELO</div>
          </div>
        </div>

        {/* Model 2: Revogação de Acessos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-white text-sm">B. Revogação de Acessos</h3>
              <span className="font-mono text-xs text-red-400">SGT3_REVOGAÇÂO.xlsx</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
              XLSX Padrão
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Utilizado para cancelamento imediato de acessos após desligamento do colaborador.
          </p>

          <div className="bg-slate-950 rounded-lg p-3 text-xs space-y-1.5 font-mono">
            <div className="text-red-400 font-bold mb-1">Mapeamento (Linha 1 = Cabeçalho; Linha 2+ = Dados):</div>
            <div>• Col A (1): LOGIN Z (Formato obrigatório: Z + 6 números, ex: Z559454)</div>
            <div>• Col B (2): NOME COMPLETO</div>
            <div>• Col C (3): CPF (11 dígitos numéricos, gravado como texto)</div>
            <div>• Col D (4): EMPRESA (Padrão: Talentos Total Servicos LTDA ME)</div>
          </div>
        </div>

        {/* Model 3: Atualização de Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-white text-sm">C. Atualização de Status</h3>
              <span className="font-mono text-xs text-red-400">SGT3_ATUALIZA_STATUS.xlsm</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              XLSM com Colunas 'X'
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Comunica afastamentos temporários e retornos operacionais para suspensão ou reativação de permissões.
          </p>

          <div className="bg-slate-950 rounded-lg p-3 text-xs space-y-1.5 font-mono">
            <div className="text-red-400 font-bold mb-1">Mapeamento (Linha 1 = Ação; Linha 2 = Headers; Linha 3+ = Dados):</div>
            <div>• Col A (1): CPF (11 dígitos como texto)</div>
            <div>• Col B (2): Em branco</div>
            <div>• Col C (3): Nome Completo</div>
            <div>• Col D (4): Razão Social fixa (Talentos Total Servicos LTDA ME)</div>
            <div>• Col E (5): 'X' se situação for FERIAS</div>
            <div>• Col F (6): 'X' se situação for RETORNO FERIAS</div>
            <div>• Col G (7): 'X' se situação for LICENCA</div>
            <div>• Col H (8): 'X' se situação for RETORNO LICENCA</div>
          </div>
        </div>

        {/* Model 4: Ativação DUO Desktop */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-white text-sm">D. Ativação DUO Desktop</h3>
              <span className="font-mono text-xs text-red-400">SGT3_DUO_DESKTOP.xlsx</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Linha 8 Estrita
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Vinculação do duplo fator Cisco DUO à máquina do agente e seu Login Z.
          </p>

          <div className="bg-slate-950 rounded-lg p-3 text-xs space-y-1.5 font-mono">
            <div className="text-red-400 font-bold mb-1">Mapeamento (Dados iniciam estritamente na Linha 8):</div>
            <div>• Col D (4): CLARO BR (Origem fixa)</div>
            <div>• Col L (12): Login Z (Z + 6 dígitos)</div>
            <div>• Col N (14): Nome Completo</div>
            <div>• Col R (18): Hostname (sem espaços, ex: CL-51-I5-B2-B2)</div>
            <div>• Col T (20): Machineguid (GUID 8-4-4-4-12 em minúsculas)</div>
            <div>• Demais colunas da linha permanecem em branco</div>
            <div>• Auditoria de duplicidade no mesmo lote ativada</div>
          </div>
        </div>
      </div>
    </div>
  );
};
