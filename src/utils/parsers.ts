import {
  CriacaoIdentidadeRecord,
  RevogacaoRecord,
  AtualizaStatusRecord,
  DuoDesktopRecord
} from '../types/sgt3';
import {
  cleanDigits,
  validateCPF,
  validateLoginZ,
  validateMachineguid,
  validateHostname,
  normalizeSituacao,
  normalizeQualificacao,
  formatPhone
} from './validators';

/**
 * Parser para SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm
 */
export function parseCriacaoIdentidade(rawText: string): CriacaoIdentidadeRecord[] {
  const records: CriacaoIdentidadeRecord[] = [];
  if (!rawText || !rawText.trim()) return records;

  const text = rawText.trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Verificação se é formato colado do Excel (TSV ou ;)
  const isTabular = lines.some(l => l.includes('\t') || (l.includes(';') && l.split(';').length >= 3));

  if (isTabular) {
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('cpf') && line.toLowerCase().includes('nome')) {
        return; // Pular cabeçalho
      }
      const delim = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : null);
      if (delim) {
        const parts = line.split(delim).map(p => p.trim());
        let cpfRaw = '';
        let nomeRaw = '';
        let nascRaw = '';
        let telRaw = '';
        let emailRaw = '';
        let qualifRaw = 'MÉDIO';

        parts.forEach(part => {
          const digits = cleanDigits(part);
          if ((digits.length === 11 || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(part)) && !cpfRaw) {
            cpfRaw = part;
          } else if (/\b\d{2}[/-]\d{2}[/-]\d{4}\b/.test(part) && !nascRaw) {
            const m = part.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/);
            if (m) nascRaw = m[0].replace(/-/g, '/');
          } else if (part.includes('@') && part.includes('.') && !emailRaw) {
            emailRaw = part;
          } else if ((digits.length === 10 || digits.length === 11 || part.includes('(')) && !telRaw && part !== cpfRaw) {
            telRaw = part;
          } else if (/(FUNDAMENTAL|MÉDIO|MEDIO|SUPERIOR)/i.test(part)) {
            qualifRaw = part;
          } else if (!nomeRaw && part.length > 3 && !/\d/.test(part)) {
            nomeRaw = part;
          }
        });

        // Fallbacks
        if (!cpfRaw && parts[0] && cleanDigits(parts[0]).length === 11) cpfRaw = parts[0];
        if (!nomeRaw && parts[1]) nomeRaw = parts[1];

        if (cpfRaw || nomeRaw) {
          records.push(buildCriacaoRecord(cpfRaw, nomeRaw, nascRaw, telRaw, emailRaw, qualifRaw, line, idx));
        }
      }
    });

    if (records.length > 0) return records;
  }

  // 2. Parser para WhatsApp / Teams / Mensagens livres
  const blocks = text.split(/\n\s*\n|(?=(?:^|\n)\s*(?:nome|cpf|doc)\s*[:=-])/i).map(b => b.trim()).filter(Boolean);

  blocks.forEach((block, idx) => {
    const cpfMatch = block.match(/(?:cpf|doc(?:umento)?)\s*[:=-]?\s*([0-9.\-]{11,14})/i);
    const nomeMatch = block.match(/(?:nome(?:\s+completo)?)\s*[:=-]?\s*([^\n\r,;]+)/i);
    const nascMatch = block.match(/(?:nasc(?:imento)?|data\s*nasc(?:imento)?)\s*[:=-]?\s*(\d{2}[/-]\d{2}[/-]\d{4})/i);
    const telMatch = block.match(/(?:tel(?:efone)?|cel(?:ular)?|contato|whatsapp)\s*[:=-]?\s*([\d\s().-]{8,20})/i);
    const emailMatch = block.match(/(?:e-?mail)\s*[:=-]?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i);
    const qualifMatch = block.match(/(?:qualifica[çc][aã]o|escolaridade|grau)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú]+)/i);

    let cpfRaw = cpfMatch ? cpfMatch[1].trim() : '';
    let nomeRaw = nomeMatch ? nomeMatch[1].trim() : '';
    let nascRaw = nascMatch ? nascMatch[1].trim().replace(/-/g, '/') : '';
    let telRaw = telMatch ? telMatch[1].trim() : '';
    let emailRaw = emailMatch ? emailMatch[1].trim() : '';
    let qualifRaw = qualifMatch ? qualifMatch[1].trim() : '';

    if (!cpfRaw) {
      const finder = block.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
      if (finder) cpfRaw = finder[0];
    }
    if (!nascRaw) {
      const finder = block.match(/\b\d{2}[/-]\d{2}[/-]\d{4}\b/);
      if (finder) nascRaw = finder[0].replace(/-/g, '/');
    }
    if (!emailRaw) {
      const finder = block.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
      if (finder) emailRaw = finder[0];
    }
    if (!telRaw) {
      const finder = block.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-.\s]?\d{4}/);
      if (finder && finder[0] !== cpfRaw) telRaw = finder[0];
    }
    if (!nomeRaw) {
      for (const bLine of block.split(/\r?\n/)) {
        const l = bLine.trim();
        if (l && !/\d/.test(l) && l.split(' ').length >= 2) {
          nomeRaw = l;
          break;
        }
      }
    }

    if (cpfRaw || nomeRaw) {
      records.push(buildCriacaoRecord(cpfRaw, nomeRaw, nascRaw, telRaw, emailRaw, qualifRaw, block, idx));
    }
  });

  return records;
}

function buildCriacaoRecord(
  cpfRaw: string,
  nomeRaw: string,
  nascRaw: string,
  telRaw: string,
  emailRaw: string,
  qualifRaw: string,
  rawSource: string,
  idx: number
): CriacaoIdentidadeRecord {
  const cpfRes = validateCPF(cpfRaw);
  const issues: string[] = [];

  if (!cpfRes.isValid) {
    issues.push(`CPF: ${cpfRes.message}`);
  }
  const nome = nomeRaw.trim().toUpperCase();
  if (!nome || nome.split(' ').length < 2) {
    issues.push('Nome incompleto ou não identificado.');
  }
  if (!nascRaw) {
    issues.push('Data de nascimento não identificada.');
  } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(nascRaw)) {
    issues.push('Data de nascimento fora do formato DD/MM/AAAA.');
  }
  const telefone = formatPhone(telRaw);
  if (!telefone) {
    issues.push('Telefone celular não identificado.');
  }

  const email = emailRaw ? emailRaw.trim().toLowerCase() : 'suporte@grupotalentos.com.br';
  const qualif = normalizeQualificacao(qualifRaw);

  return {
    id: `rec-criacao-${idx}-${Date.now()}`,
    cpf_formatado: cpfRes.isValid ? cpfRes.formatted : (cpfRaw || ''),
    cpf_valido: cpfRes.isValid,
    cpf_erro: !cpfRes.isValid ? cpfRes.message : undefined,
    nome_completo: nome,
    data_nascimento: nascRaw,
    telefone_celular: telefone,
    email,
    qualificacao: qualif,
    // Campos fixos institucionais Claro / Grupo Talentos
    tipo_terceiro: 'TERCEIRO CALL CENTER',
    vip: 'NÃO',
    empresas: 'SIM (CLARO + NET + EMBRATEL)',
    estrangeiro: 'NÃO',
    tipo_doc: 'NÃO SE APLICA',
    cnpj_contratante: '54.956.511/0001-00',
    razao_contratante: 'Talentos Total Servicos LTDA ME',
    area_atuacao: 'CALL CENTER - COBRANÇA',
    homologacao: 'NÃO',
    cnpj_fornecedor: '54.956.511/0001-00',
    razao_fornecedor: 'Talentos Total Servicos LTDA ME',
    tipo_contrato: 'CLT',
    diretoria: 'SUPORTE AO NEGOCIO',
    gerencia: 'TERCEIRIZAÇÃO',
    coordenacao: 'SERVIÇOS DE APOIO',
    estrutura_local: 'CLARO SP - REGIONAL SÃO PAULO',
    uf: 'SP',
    municipio: 'São Paulo',
    cpf_gestor: '028.463.376-32',
    nome_gestor: 'DEGLEITON AQUINO DE MELO',
    issues,
    is_valid: issues.length === 0,
    raw_source: rawSource
  };
}

/**
 * Parser para SGT3_REVOGAÇÂO.xlsx
 */
export function parseRevogacao(rawText: string): RevogacaoRecord[] {
  const records: RevogacaoRecord[] = [];
  if (!rawText || !rawText.trim()) return records;

  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  lines.forEach((line, idx) => {
    if (idx === 0 && (line.toLowerCase().includes('login') || line.toLowerCase().includes('z')) && line.toLowerCase().includes('cpf')) {
      return; // Ignora cabeçalho
    }

    const delim = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : (line.includes(',') ? ',' : null));
    let loginZRaw = '';
    let nomeRaw = '';
    let cpfRaw = '';
    let empresaRaw = '';

    if (delim) {
      const parts = line.split(delim).map(p => p.trim());
      parts.forEach(p => {
        if (/^z\d{6}$/i.test(p)) {
          loginZRaw = p;
        } else if (cleanDigits(p).length === 11 && !cpfRaw) {
          cpfRaw = p;
        } else if (/(talentos|claro|empresa)/i.test(p)) {
          empresaRaw = p;
        } else if (!nomeRaw && p.length > 2 && !/\d/.test(p)) {
          nomeRaw = p;
        }
      });

      if (!loginZRaw && parts[0] && /^z\d{6}$/i.test(parts[0])) loginZRaw = parts[0];
      if (!nomeRaw && parts[1]) nomeRaw = parts[1];
      if (!cpfRaw && parts[2] && cleanDigits(parts[2]).length === 11) cpfRaw = parts[2];
      if (!empresaRaw && parts[3]) empresaRaw = parts[3];
    } else {
      const zMatch = line.match(/\b(Z\d{6})\b/i);
      if (zMatch) {
        loginZRaw = zMatch[1];
      } else {
        const zKv = line.match(/(?:login|z|acesso)\s*[:=-]?\s*([A-Za-z0-9]+)/i);
        if (zKv) loginZRaw = zKv[1];
      }

      const cpfMatch = line.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{11}\b/);
      if (cpfMatch) cpfRaw = cpfMatch[0];

      const nomeMatch = line.match(/(?:nome)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú\s]+)/i);
      if (nomeMatch) {
        nomeRaw = nomeMatch[1].trim();
      } else {
        let cleaned = line;
        if (loginZRaw) cleaned = cleaned.replace(new RegExp(loginZRaw, 'gi'), '');
        if (cpfRaw) cleaned = cleaned.replace(cpfRaw, '');
        cleaned = cleaned.replace(/[:;,\t\-]/g, ' ').trim();
        if (cleaned.length > 2) nomeRaw = cleaned;
      }
    }

    if (loginZRaw || cpfRaw || nomeRaw) {
      const zRes = validateLoginZ(loginZRaw);
      const cpfRes = validateCPF(cpfRaw);
      const issues: string[] = [];

      if (!zRes.isValid) issues.push(`Login Z: ${zRes.message}`);
      if (!cpfRes.isValid) issues.push(`CPF: ${cpfRes.message}`);
      if (!nomeRaw) issues.push('Nome não informado.');

      records.push({
        id: `rec-rev-${idx}-${Date.now()}`,
        login_z: zRes.normalized,
        login_z_valido: zRes.isValid,
        login_z_erro: !zRes.isValid ? zRes.message : undefined,
        nome: nomeRaw.trim().toUpperCase(),
        cpf_numeros: cleanDigits(cpfRaw),
        cpf_valido: cpfRes.isValid,
        cpf_erro: !cpfRes.isValid ? cpfRes.message : undefined,
        empresa: empresaRaw.trim() || 'Talentos Total Servicos LTDA ME',
        issues,
        is_valid: issues.length === 0,
        raw_source: line
      });
    }
  });

  return records;
}

/**
 * Parser para SGT3_ATUALIZA_STATUS.xlsm
 */
export function parseAtualizaStatus(rawText: string): AtualizaStatusRecord[] {
  const records: AtualizaStatusRecord[] = [];
  if (!rawText || !rawText.trim()) return records;

  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  lines.forEach((line, idx) => {
    if (idx === 0 && line.toLowerCase().includes('cpf') && (line.toLowerCase().includes('status') || line.toLowerCase().includes('situa'))) {
      return;
    }

    const delim = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : (line.includes(',') ? ',' : null));
    let cpfRaw = '';
    let nomeRaw = '';
    let situacaoRaw = '';

    if (delim) {
      const parts = line.split(delim).map(p => p.trim());
      parts.forEach(p => {
        if (cleanDigits(p).length === 11 && !cpfRaw) {
          cpfRaw = p;
        } else if (/(FERIAS|FÉR|LICEN|RETORNO)/i.test(p)) {
          situacaoRaw = p;
        } else if (!nomeRaw && p.length > 2 && !/\d/.test(p)) {
          nomeRaw = p;
        }
      });

      if (!cpfRaw && parts[0] && cleanDigits(parts[0]).length === 11) cpfRaw = parts[0];
      if (!nomeRaw && parts[1]) nomeRaw = parts[1];
      if (!situacaoRaw && parts[2]) situacaoRaw = parts[2];
    } else {
      const cpfMatch = line.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{11}\b/);
      if (cpfMatch) cpfRaw = cpfMatch[0];

      const sitMatch = line.match(/\b(retorno\s*f[eé]rias|f[eé]rias|retorno\s*licen[çc]a|licen[çc]a|afastamento)\b/i);
      if (sitMatch) situacaoRaw = sitMatch[0];

      const nomeMatch = line.match(/(?:nome)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú\s]+)/i);
      if (nomeMatch) {
        nomeRaw = nomeMatch[1].trim();
      } else {
        let cleaned = line;
        if (cpfRaw) cleaned = cleaned.replace(cpfRaw, '');
        if (situacaoRaw) cleaned = cleaned.replace(new RegExp(situacaoRaw, 'gi'), '');
        cleaned = cleaned.replace(/[:;,\t\-]/g, ' ').trim();
        if (cleaned.length > 2) nomeRaw = cleaned;
      }
    }

    if (cpfRaw || nomeRaw || situacaoRaw) {
      const cpfRes = validateCPF(cpfRaw);
      const sitRes = normalizeSituacao(situacaoRaw);
      const issues: string[] = [];

      if (!cpfRes.isValid) issues.push(`CPF: ${cpfRes.message}`);
      if (!nomeRaw) issues.push('Nome Completo não informado.');
      if (!sitRes.isValid) issues.push(`Situação: ${sitRes.message}`);

      records.push({
        id: `rec-status-${idx}-${Date.now()}`,
        cpf_numeros: cleanDigits(cpfRaw),
        cpf_valido: cpfRes.isValid,
        cpf_erro: !cpfRes.isValid ? cpfRes.message : undefined,
        nome_completo: nomeRaw.trim().toUpperCase(),
        razao_social: 'Talentos Total Servicos LTDA ME',
        situacao: sitRes.normalized,
        situacao_valida: sitRes.isValid,
        situacao_erro: !sitRes.isValid ? sitRes.message : undefined,
        issues,
        is_valid: issues.length === 0,
        raw_source: line
      });
    }
  });

  return records;
}

/**
 * Parser para SGT3_DUO_DESKTOP.xlsx
 * Com verificação e alerta de duplicidade no mesmo lote!
 */
export function parseDuoDesktop(rawText: string): DuoDesktopRecord[] {
  const records: DuoDesktopRecord[] = [];
  if (!rawText || !rawText.trim()) return records;

  const lines = rawText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const guidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/;

  const seenLogins = new Map<string, number>();
  const seenHostnames = new Map<string, number>();
  const seenGuids = new Map<string, number>();

  lines.forEach((line, idx) => {
    if (idx === 0 && (line.toLowerCase().includes('login') || line.toLowerCase().includes('hostname')) && line.toLowerCase().includes('guid')) {
      return;
    }

    const delim = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : (line.includes(',') ? ',' : null));
    let loginZRaw = '';
    let nomeRaw = '';
    let hostRaw = '';
    let guidRaw = '';

    if (delim) {
      const parts = line.split(delim).map(p => p.trim());
      parts.forEach(p => {
        if (/^z\d{6}$/i.test(p)) {
          loginZRaw = p;
        } else if (guidRegex.test(p)) {
          guidRaw = p;
        } else if (/^[A-Za-z0-9]+(-[A-Za-z0-9]+)+$/.test(p)) {
          hostRaw = p;
        } else if (!nomeRaw && p.length > 2 && !/\d/.test(p)) {
          nomeRaw = p;
        }
      });

      if (!loginZRaw && parts[0] && /^z\d{6}$/i.test(parts[0])) loginZRaw = parts[0];
      if (!nomeRaw && parts[1]) nomeRaw = parts[1];
      if (!hostRaw && parts[2]) hostRaw = parts[2];
      if (!guidRaw && parts[3]) guidRaw = parts[3];
    } else {
      const zMatch = line.match(/\b(Z\d{6})\b/i);
      if (zMatch) loginZRaw = zMatch[1];

      const guidMatch = line.match(guidRegex);
      if (guidMatch) guidRaw = guidMatch[0];

      const hostMatch = line.match(/(?:host(?:name)?|maquina|pc)\s*[:=-]?\s*([A-Za-z0-9\-]+)/i);
      if (hostMatch) {
        hostRaw = hostMatch[1];
      } else {
        const candidate = line.match(/\b[A-Za-z0-9]{2,}(?:-[A-Za-z0-9]{2,})+\b/);
        if (candidate && candidate[0] !== guidRaw) hostRaw = candidate[0];
      }

      const nomeMatch = line.match(/(?:nome)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú\s]+)/i);
      if (nomeMatch) {
        nomeRaw = nomeMatch[1].trim();
      } else {
        let cleaned = line;
        if (loginZRaw) cleaned = cleaned.replace(new RegExp(loginZRaw, 'gi'), '');
        if (guidRaw) cleaned = cleaned.replace(new RegExp(guidRaw, 'gi'), '');
        if (hostRaw) cleaned = cleaned.replace(hostRaw, '');
        cleaned = cleaned.replace(/[:;,\t\-]/g, ' ').trim();
        if (cleaned.length > 2 && !/\d/.test(cleaned)) nomeRaw = cleaned;
      }
    }

    if (loginZRaw || guidRaw || hostRaw || nomeRaw) {
      const zRes = validateLoginZ(loginZRaw);
      const hostRes = validateHostname(hostRaw);
      const guidRes = validateMachineguid(guidRaw);
      const issues: string[] = [];

      if (!zRes.isValid) issues.push(`Login Z: ${zRes.message}`);
      if (!hostRes.isValid) issues.push(`Hostname: ${hostRes.message}`);
      if (!guidRes.isValid) issues.push(`Machineguid: ${guidRes.message}`);
      if (!nomeRaw) issues.push('Nome Completo não informado.');

      // Alertas de duplicidade
      let duplicateAlert: string | undefined;
      if (zRes.normalized) {
        if (seenLogins.has(zRes.normalized)) {
          const prev = seenLogins.get(zRes.normalized)! + 1;
          const msg = `DUPLICIDADE: Login ${zRes.normalized} repetido na linha ${prev}.`;
          issues.push(msg);
          duplicateAlert = msg;
        } else {
          seenLogins.set(zRes.normalized, idx);
        }
      }
      if (hostRes.normalized) {
        if (seenHostnames.has(hostRes.normalized)) {
          const prev = seenHostnames.get(hostRes.normalized)! + 1;
          const msg = `DUPLICIDADE: Hostname ${hostRes.normalized} repetido na linha ${prev}.`;
          issues.push(msg);
          duplicateAlert = msg;
        } else {
          seenHostnames.set(hostRes.normalized, idx);
        }
      }
      if (guidRes.normalized) {
        if (seenGuids.has(guidRes.normalized)) {
          const prev = seenGuids.get(guidRes.normalized)! + 1;
          const msg = `DUPLICIDADE: Machineguid ${guidRes.normalized} repetido na linha ${prev}.`;
          issues.push(msg);
          duplicateAlert = msg;
        } else {
          seenGuids.set(guidRes.normalized, idx);
        }
      }

      records.push({
        id: `rec-duo-${idx}-${Date.now()}`,
        origem: 'CLARO BR',
        login_z: zRes.normalized,
        login_z_valido: zRes.isValid,
        login_z_erro: !zRes.isValid ? zRes.message : undefined,
        nome_completo: nomeRaw.trim().toUpperCase(),
        hostname: hostRes.normalized,
        hostname_valido: hostRes.isValid,
        hostname_erro: !hostRes.isValid ? hostRes.message : undefined,
        machineguid: guidRes.normalized,
        machineguid_valido: guidRes.isValid,
        machineguid_erro: !guidRes.isValid ? guidRes.message : undefined,
        duplicate_alert: duplicateAlert,
        issues,
        is_valid: issues.length === 0,
        raw_source: line
      });
    }
  });

  return records;
}
