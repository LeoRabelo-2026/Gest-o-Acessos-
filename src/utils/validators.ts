export function cleanDigits(value: string | number | undefined | null): string {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

/**
 * Validação de CPF utilizando o cálculo matemático oficial dos dígitos verificadores (Módulo 11).
 */
export function validateCPF(cpfRaw: string): { isValid: boolean; formatted: string; rawDigits: string; message: string } {
  const digits = cleanDigits(cpfRaw);

  if (digits.length !== 11) {
    return {
      isValid: false,
      formatted: digits,
      rawDigits: digits,
      message: `CPF possui ${digits.length} dígitos (esperado: 11 dígitos).`
    };
  }

  // Rejeita sequências de dígitos idênticos (ex: 111.111.111-11, 000.000.000-00)
  if (/^(\d)\1{10}$/.test(digits)) {
    return {
      isValid: false,
      formatted: digits,
      rawDigits: digits,
      message: 'CPF inválido: todos os 11 dígitos são repetidos.'
    };
  }

  // 1º Dígito Verificador
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += parseInt(digits[i], 10) * (10 - i);
  }
  let rem1 = (sum1 * 10) % 11;
  let d1 = rem1 === 10 ? 0 : rem1;
  if (d1 !== parseInt(digits[9], 10)) {
    return {
      isValid: false,
      formatted: digits,
      rawDigits: digits,
      message: 'Primeiro dígito verificador matematicamente incorreto.'
    };
  }

  // 2º Dígito Verificador
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += parseInt(digits[i], 10) * (11 - i);
  }
  let rem2 = (sum2 * 10) % 11;
  let d2 = rem2 === 10 ? 0 : rem2;
  if (d2 !== parseInt(digits[10], 10)) {
    return {
      isValid: false,
      formatted: digits,
      rawDigits: digits,
      message: 'Segundo dígito verificador matematicamente incorreto.'
    };
  }

  const formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  return {
    isValid: true,
    formatted,
    rawDigits: digits,
    message: 'CPF Válido'
  };
}

/**
 * Validação rigorosa do Login Z: Z seguido estritamente de 6 dígitos numéricos.
 */
export function validateLoginZ(loginRaw: string): { isValid: boolean; normalized: string; message: string } {
  if (!loginRaw || !loginRaw.trim()) {
    return { isValid: false, normalized: '', message: 'Login Z não informado.' };
  }

  const clean = loginRaw.trim().toUpperCase();
  const match = /^Z\d{6}$/.test(clean);

  if (!match) {
    return {
      isValid: false,
      normalized: clean,
      message: "Login Z inválido: deve conter 'Z' seguido exatamente de 6 números (ex: Z559454)."
    };
  }

  return { isValid: true, normalized: clean, message: 'Login Z Válido' };
}

/**
 * Validação do Machineguid: GUID hexadecimal 8-4-4-4-12 em minúsculas.
 */
export function validateMachineguid(guidRaw: string): { isValid: boolean; normalized: string; message: string } {
  if (!guidRaw || !guidRaw.trim()) {
    return { isValid: false, normalized: '', message: 'Machineguid não informado.' };
  }

  const clean = guidRaw.trim().toLowerCase();
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  if (!pattern.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      message: 'Machineguid inválido (formato esperado: 8-4-4-4-12 hexadecimais, ex: c6316c4b-8e89-4149-b0d0-fdb622236250).'
    };
  }

  return { isValid: true, normalized: clean, message: 'Machineguid Válido' };
}

/**
 * Validação de Hostname: alfanumérico com hífens, sem espaços.
 */
export function validateHostname(hostRaw: string): { isValid: boolean; normalized: string; message: string } {
  if (!hostRaw || !hostRaw.trim()) {
    return { isValid: false, normalized: '', message: 'Hostname não informado.' };
  }

  const clean = hostRaw.trim().toUpperCase();

  if (/\s/.test(clean)) {
    return { isValid: false, normalized: clean, message: 'Hostname não pode conter espaços.' };
  }

  if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(clean)) {
    return {
      isValid: false,
      normalized: clean,
      message: 'Hostname contém caracteres inválidos (utilize letras, números e hífens, ex: CL-51-I5-B2-B2).'
    };
  }

  return { isValid: true, normalized: clean, message: 'Hostname Válido' };
}

/**
 * Normalização das situações para a planilha de Status.
 */
export function normalizeSituacao(situacaoRaw: string): { isValid: boolean; normalized: string; message: string } {
  if (!situacaoRaw || !situacaoRaw.trim()) {
    return { isValid: false, normalized: '', message: 'Situação não informada.' };
  }

  const text = situacaoRaw.trim().toUpperCase();

  if (text.includes('RETORNO') && (text.includes('FER') || text.includes('FÉR'))) {
    return { isValid: true, normalized: 'RETORNO FERIAS', message: 'Válido' };
  }
  if (text.includes('FER') || text.includes('FÉR')) {
    return { isValid: true, normalized: 'FERIAS', message: 'Válido' };
  }
  if (text.includes('RETORNO') && (text.includes('LICEN') || text.includes('AFAST'))) {
    return { isValid: true, normalized: 'RETORNO LICENCA', message: 'Válido' };
  }
  if (text.includes('LICEN') || text.includes('AFAST')) {
    return { isValid: true, normalized: 'LICENCA', message: 'Válido' };
  }

  const valid = ['FERIAS', 'RETORNO FERIAS', 'LICENCA', 'RETORNO LICENCA'];
  if (valid.includes(text)) {
    return { isValid: true, normalized: text, message: 'Válido' };
  }

  return {
    isValid: false,
    normalized: text,
    message: `Situação desconhecida ('${text}'). Válidas: FERIAS, RETORNO FERIAS, LICENCA, RETORNO LICENCA.`
  };
}

/**
 * Normalização de Qualificação / Escolaridade: FUNDAMENTAL, MÉDIO ou SUPERIOR; padrão MÉDIO.
 */
export function normalizeQualificacao(qualifRaw?: string): 'FUNDAMENTAL' | 'MÉDIO' | 'SUPERIOR' {
  if (!qualifRaw) return 'MÉDIO';
  const text = qualifRaw.trim().toUpperCase();
  if (text.includes('FUND')) return 'FUNDAMENTAL';
  if (text.includes('SUP') || text.includes('GRAD') || text.includes('POS') || text.includes('PÓS')) return 'SUPERIOR';
  return 'MÉDIO';
}

/**
 * Formata telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 */
export function formatPhone(phoneRaw?: string): string {
  const digits = cleanDigits(phoneRaw);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 13 && digits.startsWith('55')) {
    return formatPhone(digits.slice(2));
  }
  return phoneRaw?.trim() || '';
}
