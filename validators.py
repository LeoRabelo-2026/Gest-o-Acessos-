"""
Módulo de Validações de Regras de Negócio - SGT3 (Claro / Grupo Talentos).
Validação estrita de CPF (módulo 11), Login Z, Hostname, Machineguid e campos padronizados.
"""

import re
from typing import Tuple, Optional


def clean_digits(value: str) -> str:
    """Remove todos os caracteres não numéricos de uma string."""
    if not value:
        return ""
    return re.sub(r"\D", "", str(value))


def validate_cpf(cpf_raw: str) -> Tuple[bool, str, str]:
    """
    Valida CPF utilizando o cálculo oficial dos dígitos verificadores (Módulo 11).
    Retorna uma tupla: (is_valid, cpf_formatado, mensagem_erro).
    """
    digits = clean_digits(cpf_raw)
    
    if len(digits) != 11:
        return False, digits, f"CPF possui {len(digits)} dígitos (esperado: 11)."
        
    # Rejeitar sequências de dígitos iguais (ex: 111.111.111-11, 000.000.000-00)
    if digits == digits[0] * 11:
        return False, digits, "CPF inválido (todos os dígitos são repetidos)."
        
    # Cálculo do primeiro dígito verificador
    soma_1 = sum(int(digits[i]) * (10 - i) for i in range(9))
    resto_1 = (soma_1 * 10) % 11
    digito_1 = 0 if resto_1 == 10 else resto_1
    
    if digito_1 != int(digits[9]):
        return False, digits, "Primeiro dígito verificador incorreto."
        
    # Cálculo do segundo dígito verificador
    soma_2 = sum(int(digits[i]) * (11 - i) for i in range(10))
    resto_2 = (soma_2 * 10) % 11
    digito_2 = 0 if resto_2 == 10 else resto_2
    
    if digito_2 != int(digits[10]):
        return False, digits, "Segundo dígito verificador incorreto."
        
    formatted = f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"
    return True, formatted, "CPF Válido"


def validate_login_z(login_raw: str) -> Tuple[bool, str, str]:
    """
    Valida o Login Z.
    Regra: Z seguido rigorosamente de 6 dígitos numéricos (ex: Z559454).
    """
    if not login_raw:
        return False, "", "Login Z não informado."
        
    login_clean = str(login_raw).strip().upper()
    match = re.match(r"^Z\d{6}$", login_clean)
    if not match:
        return False, login_clean, "Login Z inválido (deve ser 'Z' seguido de exatamente 6 números, ex: Z123456)."
        
    return True, login_clean, "Login Z Válido"


def validate_machineguid(guid_raw: str) -> Tuple[bool, str, str]:
    """
    Valida o Machineguid (GUID hexadecimal 8-4-4-4-12).
    Retorna o GUID padronizado em minúsculas conforme especificação SGT3.
    """
    if not guid_raw:
        return False, "", "Machineguid não informado."
        
    guid_clean = str(guid_raw).strip().lower()
    guid_pattern = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
    
    if not re.match(guid_pattern, guid_clean):
        return False, guid_clean, "Machineguid inválido (formato esperado: c6316c4b-8e89-4149-b0d0-fdb622236250)."
        
    return True, guid_clean, "Machineguid Válido"


def validate_hostname(hostname_raw: str) -> Tuple[bool, str, str]:
    """
    Valida o Hostname da máquina.
    Regra: Alfanumérico com hífen, sem espaços (ex: CL-51-I5-B2-B2).
    """
    if not hostname_raw:
        return False, "", "Hostname não informado."
        
    hostname_clean = str(hostname_raw).strip().upper()
    if " " in hostname_clean:
        return False, hostname_clean, "Hostname não pode conter espaços."
        
    if not re.match(r"^[A-Z0-9]+(-[A-Z0-9]+)*$", hostname_clean):
        return False, hostname_clean, "Hostname contém caracteres inválidos (use letras, números e hífens)."
        
    return True, hostname_clean, "Hostname Válido"


def normalize_situacao(situacao_raw: str) -> Tuple[bool, str, str]:
    """
    Normaliza a situação do colaborador para a planilha de Atualização de Status.
    Situações válidas:
    - FERIAS
    - RETORNO FERIAS
    - LICENCA
    - RETORNO LICENCA
    """
    if not situacao_raw:
        return False, "", "Situação não informada."
        
    text = situacao_raw.strip().upper()
    
    # Mapeamentos tolerantes comuns
    if "RETORNO" in text and ("FÉR" in text or "FERIAS" in text or "FER" in text):
        return True, "RETORNO FERIAS", "Válido"
    elif "FÉR" in text or "FERIAS" in text or "FERIA" in text:
        return True, "FERIAS", "Válido"
    elif "RETORNO" in text and ("LICEN" in text or "AFAST" in text):
        return True, "RETORNO LICENCA", "Válido"
    elif "LICEN" in text or "AFAST" in text:
        return True, "LICENCA", "Válido"
        
    # Verificação exata
    valid_options = ["FERIAS", "RETORNO FERIAS", "LICENCA", "RETORNO LICENCA"]
    if text in valid_options:
        return True, text, "Válido"
        
    return False, text, f"Situação desconhecida ('{text}'). Escolha: FERIAS, RETORNO FERIAS, LICENCA ou RETORNO LICENCA."


def normalize_qualificacao(qualif_raw: str) -> str:
    """
    Normaliza o campo Qualificação / Escolaridade.
    Aceitar: FUNDAMENTAL, MÉDIO ou SUPERIOR; padrão: MÉDIO.
    """
    if not qualif_raw:
        return "MÉDIO"
        
    text = qualif_raw.strip().upper()
    if "FUND" in text:
        return "FUNDAMENTAL"
    elif "SUP" in text or "GRAD" in text or "POS" in text or "PÓS" in text:
        return "SUPERIOR"
    return "MÉDIO"


def format_phone(phone_raw: str) -> str:
    """Formata telefone celular: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX."""
    digits = clean_digits(phone_raw)
    if len(digits) == 11:
        return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    elif len(digits) == 10:
        return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    elif len(digits) == 13 and digits.startswith("55"): # com DDI 55
        return format_phone(digits[2:])
    return phone_raw.strip() if phone_raw else ""
