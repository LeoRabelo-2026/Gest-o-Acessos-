import { SGT3FormType, FormConfig } from '../types/sgt3';

export const FORM_CONFIGS: Record<SGT3FormType, FormConfig> = {
  CRIACAO_IDENTIDADE: {
    id: 'CRIACAO_IDENTIDADE',
    title: 'Criação de Identidade (V 16)',
    filename: 'SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm',
    mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    isMacro: true,
    startRow: 6,
    badge: 'Macros .XLSM • Linha 6',
    description: 'Cadastro de novos colaboradores terceiros Claro / Grupo Talentos com validação matemática de CPF e preenchimento de parâmetros corporativos.'
  },
  REVOGACAO: {
    id: 'REVOGACAO',
    title: 'Revogação de Acessos',
    filename: 'SGT3_REVOGAÇÂO.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    isMacro: false,
    startRow: 2,
    badge: 'XLSX • Linha 2',
    description: 'Desativação e revogação imediata de acessos corporativos Claro através de Login Z (formato Z000000) e CPF com 11 dígitos numéricos.'
  },
  ATUALIZA_STATUS: {
    id: 'ATUALIZA_STATUS',
    title: 'Atualização de Status',
    filename: 'SGT3_ATUALIZA_STATUS.xlsm',
    mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    isMacro: true,
    startRow: 3,
    badge: 'Macros .XLSM • Linha 3',
    description: 'Gestão de afastamentos operacionais com marcação em colunas específicas (X) para FERIAS, RETORNO FERIAS, LICENCA e RETORNO LICENCA.'
  },
  DUO_DESKTOP: {
    id: 'DUO_DESKTOP',
    title: 'Ativação DUO Desktop',
    filename: 'SGT3_DUO_DESKTOP.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    isMacro: false,
    startRow: 8,
    badge: 'XLSX • Linha 8 Estrita',
    description: 'Provisionamento de MFA Cisco DUO Desktop para estações de call center com validação rigorosa de Machineguid e detecção de duplicidades.'
  }
};

export const SAMPLE_INPUTS: Record<SGT3FormType, { valid: string; withIssues: string; placeholder: string }> = {
  CRIACAO_IDENTIDADE: {
    placeholder: `Exemplo de Mensagem WhatsApp / Teams:
Nome: Carlos Eduardo da Silva
CPF: 382.492.128-09
Nasc: 14/05/1992
Celular: (11) 98765-4321
Email: carlos.silva@grupotalentos.com.br
Qualificação: SUPERIOR

Nome: Mariana Oliveira Ramos
CPF: 191.458.730-04
Nasc: 20/08/1998
Celular: 11976543210
Email: mariana.ramos@grupotalentos.com.br
Qualificação: MÉDIO

Ou colagem tabular direta do Excel (TSV):
04212345678\tFERNANDA LIMA SOUZA\t12/03/1995\t11999998888\tfernanda@email.com\tMÉDIO`,
    valid: `Nome: Carlos Eduardo da Silva
CPF: 382.492.128-09
Nasc: 14/05/1992
Celular: (11) 98765-4321
Email: carlos.silva@grupotalentos.com.br
Qualificação: SUPERIOR

Nome: Mariana Oliveira Ramos
CPF: 191.458.730-04
Nasc: 20/08/1998
Celular: (11) 97654-3210
Email: mariana.ramos@grupotalentos.com.br
Qualificação: MÉDIO

Nome: Bruno Henrique dos Santos
CPF: 442.203.948-26
Nasc: 05/11/1994
Celular: (11) 95544-3322
Email: bruno.santos@grupotalentos.com.br
Qualificação: FUNDAMENTAL`,
    withIssues: `Nome: Carlos Eduardo da Silva
CPF: 111.111.111-11
Nasc: 14/05/1992
Celular: (11) 98765-4321
Email: carlos.silva@grupotalentos.com.br
Qualificação: SUPERIOR

Nome: Mariana
CPF: 123.456.789-99
Nasc: 1998-08-20
Celular: 
Email: 
Qualificação: Outro`
  },

  REVOGACAO: {
    placeholder: `Z559454\tCarlos Eduardo da Silva\t38249212809\tTalentos Total Servicos LTDA ME
Z668123\tMariana Oliveira Ramos\t19145873004\tGrupo Talentos
Z123456\tJoão Pereira Santos\t44220394826

Ou texto livre:
Login: Z559454
Nome: Carlos Eduardo da Silva
CPF: 382.492.128-09`,
    valid: `Z559454\tCarlos Eduardo da Silva\t38249212809\tTalentos Total Servicos LTDA ME
Z668123\tMariana Oliveira Ramos\t19145873004\tTalentos Total Servicos LTDA ME
Z774910\tBruno Henrique dos Santos\t44220394826\tTalentos Total Servicos LTDA ME`,
    withIssues: `Z5594\tCarlos Eduardo da Silva\t11111111111\tTalentos Total Servicos LTDA ME
USR9988\tMariana Oliveira\t12345678999\tClaro
Z123456\t\t38249212809\tTalentos Total Servicos LTDA ME`
  },

  ATUALIZA_STATUS: {
    placeholder: `38249212809\tCarlos Eduardo da Silva\tFERIAS
19145873004\tMariana Oliveira Ramos\tRETORNO FERIAS
44220394826\tBruno Henrique dos Santos\tLICENCA
02846337632\tDegleiton Aquino de Melo\tRETORNO LICENCA`,
    valid: `38249212809\tCarlos Eduardo da Silva\tFERIAS
19145873004\tMariana Oliveira Ramos\tRETORNO FERIAS
44220394826\tBruno Henrique dos Santos\tLICENCA
02846337632\tDegleiton Aquino de Melo\tRETORNO LICENCA`,
    withIssues: `11111111111\tCarlos Eduardo da Silva\tDESLIGAMENTO
19145873004\t\tFERIAS
12345678999\tBruno Henrique\tINDEFINIDO`
  },

  DUO_DESKTOP: {
    placeholder: `Z559454\tCarlos Eduardo da Silva\tCL-51-I5-B2-B2\tc6316c4b-8e89-4149-b0d0-fdb622236250
Z668123\tMariana Oliveira Ramos\tCL-44-I7-A1-C3\ta1b2c3d4-e5f6-7890-abcd-ef1234567890
Z774910\tBruno Henrique dos Santos\tCL-33-I3-D4-E5\te9f8a7b6-c5d4-3210-9876-543210abcdef`,
    valid: `Z559454\tCarlos Eduardo da Silva\tCL-51-I5-B2-B2\tc6316c4b-8e89-4149-b0d0-fdb622236250
Z668123\tMariana Oliveira Ramos\tCL-44-I7-A1-C3\ta1b2c3d4-e5f6-7890-abcd-ef1234567890
Z774910\tBruno Henrique dos Santos\tCL-33-I3-D4-E5\te9f8a7b6-c5d4-3210-9876-543210abcdef`,
    withIssues: `Z559454\tCarlos Eduardo da Silva\tCL-51-I5-B2-B2\tc6316c4b-8e89-4149-b0d0-fdb622236250
Z559454\tOutro Usuario Repetido\tCL 51 I5 B2\tc6316c4b-8e89-4149-b0d0-fdb622236250
Z123\tUsuario Invalido\tCL-99\tINVALID-GUID-12345`
  }
};
