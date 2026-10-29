import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import {
  CriacaoIdentidadeRecord,
  RevogacaoRecord,
  AtualizaStatusRecord,
  DuoDesktopRecord
} from '../types/sgt3';

export async function generateCriacaoIdentidadeWorkbook(
  records: CriacaoIdentidadeRecord[],
  templateBuffer?: ArrayBuffer
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  if (templateBuffer) {
    await wb.xlsx.load(templateBuffer);
  }

  let ws = wb.getWorksheet('Identidades SGT3') || wb.getWorksheet(1);
  if (!ws) {
    ws = wb.addWorksheet('Identidades SGT3');
  }

  // Se não veio de template carregado, cria o cabeçalho oficial
  if (!templateBuffer) {
    ws.mergeCells('A1:AF3');
    const titleCell = ws.getCell('A1');
    titleCell.value = 'SGT3 - CRIAÇÃO DE IDENTIDADE / SOLICITAÇÃO DE ACESSOS (V 16)';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDA291C' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const headers: Record<number, string> = {
      2: 'TIPO TERCEIRO', 3: 'VIP', 4: 'EMPRESAS', 5: 'ESTRANGEIRO', 6: 'TIPO DOC',
      9: 'CPF', 10: 'NOME COMPLETO', 11: 'DT NASCIMENTO', 13: 'CELULAR',
      14: 'E-MAIL', 15: 'QUALIFICAÇÃO', 16: 'CNPJ CONTRATANTE', 17: 'RAZÃO SOCIAL CONTRATANTE',
      18: 'ÁREA DE ATUAÇÃO', 19: 'HOMOLOGAÇÃO', 20: 'CNPJ FORNECEDOR', 21: 'RAZÃO SOCIAL FORNECEDOR',
      22: 'TIPO CONTRATO', 25: 'DIRETORIA', 26: 'GERÊNCIA', 27: 'COORDENAÇÃO',
      28: 'ESTRUTURA LOCAL', 29: 'UF', 30: 'MUNICÍPIO', 31: 'CPF GESTOR', 32: 'NOME GESTOR'
    };

    Object.entries(headers).forEach(([colStr, text]) => {
      const colIdx = parseInt(colStr, 10);
      const cell = ws.getCell(5, colIdx);
      cell.value = text;
      cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
  }

  // Preenchimento a partir da Linha 6
  const startRow = 6;
  records.forEach((rec, idx) => {
    const rowNum = startRow + idx;

    ws.getCell(rowNum, 2).value = 'TERCEIRO CALL CENTER';
    ws.getCell(rowNum, 3).value = 'NÃO';
    ws.getCell(rowNum, 4).value = 'SIM (CLARO + NET + EMBRATEL)';
    ws.getCell(rowNum, 5).value = 'NÃO';
    ws.getCell(rowNum, 6).value = 'NÃO SE APLICA';

    ws.getCell(rowNum, 9).value = rec.cpf_formatado;
    ws.getCell(rowNum, 10).value = rec.nome_completo;
    ws.getCell(rowNum, 11).value = rec.data_nascimento;
    ws.getCell(rowNum, 13).value = rec.telefone_celular;
    ws.getCell(rowNum, 14).value = rec.email || 'suporte@grupotalentos.com.br';
    ws.getCell(rowNum, 15).value = rec.qualificacao || 'MÉDIO';

    ws.getCell(rowNum, 16).value = '54.956.511/0001-00';
    ws.getCell(rowNum, 17).value = 'Talentos Total Servicos LTDA ME';
    ws.getCell(rowNum, 18).value = 'CALL CENTER - COBRANÇA';
    ws.getCell(rowNum, 19).value = 'NÃO';
    ws.getCell(rowNum, 20).value = '54.956.511/0001-00';
    ws.getCell(rowNum, 21).value = 'Talentos Total Servicos LTDA ME';
    ws.getCell(rowNum, 22).value = 'CLT';

    ws.getCell(rowNum, 25).value = 'SUPORTE AO NEGOCIO';
    ws.getCell(rowNum, 26).value = 'TERCEIRIZAÇÃO';
    ws.getCell(rowNum, 27).value = 'SERVIÇOS DE APOIO';
    ws.getCell(rowNum, 28).value = 'CLARO SP - REGIONAL SÃO PAULO';
    ws.getCell(rowNum, 29).value = 'SP';
    ws.getCell(rowNum, 30).value = 'São Paulo';
    ws.getCell(rowNum, 31).value = '028.463.376-32';
    ws.getCell(rowNum, 32).value = 'DEGLEITON AQUINO DE MELO';
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
}

export async function generateRevogacaoWorkbook(
  records: RevogacaoRecord[],
  templateBuffer?: ArrayBuffer
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  if (templateBuffer) {
    await wb.xlsx.load(templateBuffer);
  }

  let ws = wb.getWorksheet('Revogação') || wb.getWorksheet(1);
  if (!ws) {
    ws = wb.addWorksheet('Revogação');
  }

  // Cabeçalhos na Linha 1
  const headers = ['LOGIN Z', 'NOME', 'CPF', 'EMPRESA'];
  headers.forEach((h, idx) => {
    const cell = ws.getCell(1, idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDA291C' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Linha 2 em diante
  records.forEach((rec, idx) => {
    const rowNum = 2 + idx;
    const c1 = ws.getCell(rowNum, 1);
    c1.value = rec.login_z;
    c1.alignment = { horizontal: 'center' };

    const c2 = ws.getCell(rowNum, 2);
    c2.value = rec.nome;

    const c3 = ws.getCell(rowNum, 3);
    c3.value = String(rec.cpf_numeros);
    c3.numFmt = '@';
    c3.alignment = { horizontal: 'center' };

    const c4 = ws.getCell(rowNum, 4);
    c4.value = rec.empresa || 'Talentos Total Servicos LTDA ME';
  });

  ws.columns.forEach(col => {
    let max = 12;
    col.eachCell?.({ includeEmpty: false }, c => {
      const len = c.value ? String(c.value).length : 0;
      if (len > max) max = len;
    });
    col.width = max + 3;
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function generateAtualizaStatusWorkbook(
  records: AtualizaStatusRecord[],
  templateBuffer?: ArrayBuffer
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  if (templateBuffer) {
    await wb.xlsx.load(templateBuffer);
  }

  let ws = wb.getWorksheet('Status Colaboradores') || wb.getWorksheet(1);
  if (!ws) {
    ws = wb.addWorksheet('Status Colaboradores');
  }

  // Linha 1: Título / Ação
  ws.mergeCells('A1:H1');
  const tCell = ws.getCell('A1');
  tCell.value = 'SGT3 - ATUALIZAÇÃO DE STATUS OPERACIONAL';
  tCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDA291C' } };
  tCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Linha 2: Cabeçalhos
  const headers = ['CPF', '', 'NOME COMPLETO', 'RAZÃO SOCIAL', 'FERIAS', 'RETORNO FERIAS', 'LICENCA', 'RETORNO LICENCA'];
  headers.forEach((h, idx) => {
    const cell = ws.getCell(2, idx + 1);
    cell.value = h;
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Linha 3 em diante
  records.forEach((rec, idx) => {
    const rowNum = 3 + idx;

    const c1 = ws.getCell(rowNum, 1);
    c1.value = String(rec.cpf_numeros);
    c1.numFmt = '@';
    c1.alignment = { horizontal: 'center' };

    ws.getCell(rowNum, 2).value = '';
    ws.getCell(rowNum, 3).value = rec.nome_completo;
    ws.getCell(rowNum, 4).value = 'Talentos Total Servicos LTDA ME';

    const sit = rec.situacao;
    ws.getCell(rowNum, 5).value = sit === 'FERIAS' ? 'X' : '';
    ws.getCell(rowNum, 5).alignment = { horizontal: 'center' };

    ws.getCell(rowNum, 6).value = sit === 'RETORNO FERIAS' ? 'X' : '';
    ws.getCell(rowNum, 6).alignment = { horizontal: 'center' };

    ws.getCell(rowNum, 7).value = sit === 'LICENCA' ? 'X' : '';
    ws.getCell(rowNum, 7).alignment = { horizontal: 'center' };

    ws.getCell(rowNum, 8).value = sit === 'RETORNO LICENCA' ? 'X' : '';
    ws.getCell(rowNum, 8).alignment = { horizontal: 'center' };
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.ms-excel.sheet.macroEnabled.12' });
}

export async function generateDuoDesktopWorkbook(
  records: DuoDesktopRecord[],
  templateBuffer?: ArrayBuffer
): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  if (templateBuffer) {
    await wb.xlsx.load(templateBuffer);
  }

  let ws = wb.getWorksheet('DUO Desktop') || wb.getWorksheet(1);
  if (!ws) {
    ws = wb.addWorksheet('DUO Desktop');
  }

  if (!templateBuffer) {
    ws.mergeCells('A1:U4');
    const tCell = ws.getCell('A1');
    tCell.value = 'SGT3 - ATIVAÇÃO DUO DESKTOP / TOKEN CISCO & CLARO';
    tCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    tCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDA291C' } };
    tCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ws.getCell(7, 4).value = 'ORIGEM';
    ws.getCell(7, 12).value = 'LOGIN Z';
    ws.getCell(7, 14).value = 'NOME COMPLETO';
    ws.getCell(7, 18).value = 'HOSTNAME';
    ws.getCell(7, 20).value = 'MACHINEGUID';

    [4, 12, 14, 18, 20].forEach(col => {
      const c = ws.getCell(7, col);
      c.font = { bold: true };
    });
  }

  // Linha 8 estrita
  const startRow = 8;
  records.forEach((rec, idx) => {
    const rowNum = startRow + idx;

    const c4 = ws.getCell(rowNum, 4);
    c4.value = 'CLARO BR';
    c4.alignment = { horizontal: 'center' };

    const c12 = ws.getCell(rowNum, 12);
    c12.value = rec.login_z;
    c12.alignment = { horizontal: 'center' };

    const c14 = ws.getCell(rowNum, 14);
    c14.value = rec.nome_completo;

    const c18 = ws.getCell(rowNum, 18);
    c18.value = rec.hostname;
    c18.alignment = { horizontal: 'center' };

    const c20 = ws.getCell(rowNum, 20);
    c20.value = rec.machineguid.toLowerCase();
    c20.alignment = { horizontal: 'center' };
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function createPythonProjectZip(files: Record<string, string>): Promise<Blob> {
  const zip = new JSZip();
  Object.entries(files).forEach(([filepath, content]) => {
    zip.file(filepath, content);
  });
  return await zip.generateAsync({ type: 'blob' });
}
