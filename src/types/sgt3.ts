export type SGT3FormType = 
  | 'CRIACAO_IDENTIDADE' 
  | 'REVOGACAO' 
  | 'ATUALIZA_STATUS' 
  | 'DUO_DESKTOP';

export interface BaseRecord {
  id: string;
  is_valid: boolean;
  issues: string[];
  raw_source: string;
}

export interface CriacaoIdentidadeRecord extends BaseRecord {
  cpf_formatado: string;
  cpf_valido: boolean;
  cpf_erro?: string;
  nome_completo: string;
  data_nascimento: string;
  telefone_celular: string;
  email: string;
  qualificacao: 'FUNDAMENTAL' | 'MÉDIO' | 'SUPERIOR';
  // Campos fixos institucionais
  tipo_terceiro: string; // TERCEIRO CALL CENTER
  vip: string; // NÃO
  empresas: string; // SIM (CLARO + NET + EMBRATEL)
  estrangeiro: string; // NÃO
  tipo_doc: string; // NÃO SE APLICA
  cnpj_contratante: string; // 54.956.511/0001-00
  razao_contratante: string; // Talentos Total Servicos LTDA ME
  area_atuacao: string; // CALL CENTER - COBRANÇA
  homologacao: string; // NÃO
  cnpj_fornecedor: string; // 54.956.511/0001-00
  razao_fornecedor: string; // Talentos Total Servicos LTDA ME
  tipo_contrato: string; // CLT
  diretoria: string; // SUPORTE AO NEGOCIO
  gerencia: string; // TERCEIRIZAÇÃO
  coordenacao: string; // SERVIÇOS DE APOIO
  estrutura_local: string; // CLARO SP - REGIONAL SÃO PAULO
  uf: string; // SP
  municipio: string; // São Paulo
  cpf_gestor: string; // 028.463.376-32
  nome_gestor: string; // DEGLEITON AQUINO DE MELO
}

export interface RevogacaoRecord extends BaseRecord {
  login_z: string;
  login_z_valido: boolean;
  login_z_erro?: string;
  nome: string;
  cpf_numeros: string;
  cpf_valido: boolean;
  cpf_erro?: string;
  empresa: string;
}

export interface AtualizaStatusRecord extends BaseRecord {
  cpf_numeros: string;
  cpf_valido: boolean;
  cpf_erro?: string;
  nome_completo: string;
  razao_social: string;
  situacao: 'FERIAS' | 'RETORNO FERIAS' | 'LICENCA' | 'RETORNO LICENCA' | string;
  situacao_valida: boolean;
  situacao_erro?: string;
}

export interface DuoDesktopRecord extends BaseRecord {
  origem: string; // CLARO BR
  login_z: string;
  login_z_valido: boolean;
  login_z_erro?: string;
  nome_completo: string;
  hostname: string;
  hostname_valido: boolean;
  hostname_erro?: string;
  machineguid: string;
  machineguid_valido: boolean;
  machineguid_erro?: string;
  duplicate_alert?: string;
}

export interface FormConfig {
  id: SGT3FormType;
  title: string;
  filename: string;
  mimeType: string;
  isMacro: boolean;
  startRow: number;
  badge: string;
  description: string;
}
