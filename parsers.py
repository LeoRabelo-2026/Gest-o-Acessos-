"""
Módulo de Parsing e Extração de Dados Não Estruturados - SGT3.
Suporta mensagens de WhatsApp, Microsoft Teams, colagens de planilhas (TSV, CSV, ponto-e-vírgula)
e blocos livres com tolerância a múltiplos formatos.
"""

import re
from typing import List, Dict, Any
from validators import (
    validate_cpf,
    validate_login_z,
    validate_machineguid,
    validate_hostname,
    normalize_situacao,
    normalize_qualificacao,
    format_phone,
    clean_digits
)


def parse_criacao_identidade(raw_text: str) -> List[Dict[str, Any]]:
    """
    Extrai registros para SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm.
    Campos: CPF, Nome Completo, Data de Nascimento, Telefone Celular, E-mail, Qualificação.
    """
    records = []
    if not raw_text or not raw_text.strip():
        return records

    # Divide em blocos caso haja múltiplos registros separados por linhas em branco
    # ou analisa linha a linha se for formato tabular (TSV / CSV).
    text = raw_text.strip()
    
    # 1. Tentativa Tabular (Linhas separadas por \t ou ;)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    is_tabular = any("\t" in line or (";" in line and len(line.split(";")) >= 3) for line in lines)
    
    if is_tabular:
        for idx, line in enumerate(lines):
            # Ignora cabeçalhos se contiverem palavras como 'cpf' e 'nome'
            if idx == 0 and ("cpf" in line.lower() and "nome" in line.lower()):
                continue
                
            delimiter = "\t" if "\t" in line else (";" if ";" in line else None)
            if delimiter:
                parts = [p.strip() for p in line.split(delimiter)]
                if len(parts) >= 2:
                    # Tenta identificar partes por conteúdo
                    cpf_raw = ""
                    nome_raw = ""
                    nasc_raw = ""
                    tel_raw = ""
                    email_raw = ""
                    qualif_raw = "MÉDIO"
                    
                    for part in parts:
                        part_clean = part.strip()
                        digits = clean_digits(part_clean)
                        # CPF candidato
                        if (len(digits) == 11 or re.match(r"^\d{3}\.\d{3}\.\d{3}-\d{2}$", part_clean)) and not cpf_raw:
                            cpf_raw = part_clean
                        # Data de nascimento (DD/MM/AAAA ou DD-MM-AAAA)
                        elif re.search(r"\b\d{2}[/-]\d{2}[/-]\d{4}\b", part_clean) and not nasc_raw:
                            nasc_raw = re.search(r"\b\d{2}[/-]\d{2}[/-]\d{4}\b", part_clean).group(0).replace("-", "/")
                        # Email
                        elif "@" in part_clean and "." in part_clean and not email_raw:
                            email_raw = part_clean
                        # Telefone
                        elif (len(digits) in (10, 11) or re.search(r"\(\d{2}\)", part_clean)) and not tel_raw and part_clean != cpf_raw:
                            tel_raw = part_clean
                        # Qualificação
                        elif any(q in part_clean.upper() for q in ["FUNDAMENTAL", "MÉDIO", "MEDIO", "SUPERIOR"]):
                            qualif_raw = part_clean
                        # Nome
                        elif not nome_raw and len(part_clean) > 3 and not any(c.isdigit() for c in part_clean):
                            nome_raw = part_clean

                    # Fallbacks posicionais caso não tenha detectado por regex
                    if not cpf_raw and len(parts) > 0 and len(clean_digits(parts[0])) == 11:
                        cpf_raw = parts[0]
                    if not nome_raw and len(parts) > 1:
                        nome_raw = parts[1]
                        
                    if cpf_raw or nome_raw:
                        record = _build_criacao_record(cpf_raw, nome_raw, nasc_raw, tel_raw, email_raw, qualif_raw, line)
                        records.append(record)
        if records:
            return records

    # 2. Formato Texto Livre / WhatsApp / Teams (Blocos separados por linhas vazias ou palavras-chave)
    # Quebramos por blocos demarcados por 'Nome:', 'CPF:', ou linhas duplas
    blocks = re.split(r"\n\s*\n|(?=(?i)(?:^|\n)\s*(?:nome|cpf)\s*:)", text)
    blocks = [b.strip() for b in blocks if b.strip()]
    
    for block in blocks:
        # Padrões regex chave-valor
        cpf_match = re.search(r"(?i)(?:cpf|doc(?:umento)?)\s*[:=-]?\s*([0-9.\-]{11,14})", block)
        nome_match = re.search(r"(?i)(?:nome(?:\s+completo)?)\s*[:=-]?\s*([^\n\r,;]+)", block)
        nasc_match = re.search(r"(?i)(?:nasc(?:imento)?|data\s*nasc(?:imento)?)\s*[:=-]?\s*(\d{2}[/-]\d{2}[/-]\d{4})", block)
        tel_match = re.search(r"(?i)(?:tel(?:efone)?|cel(?:ular)?|contato|whatsapp)\s*[:=-]?\s*([\d\s().-]{8,20})", block)
        email_match = re.search(r"(?i)(?:e-?mail)\s*[:=-]?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})", block)
        qualif_match = re.search(r"(?i)(?:qualifica[çc][aã]o|escolaridade|grau)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú]+)", block)
        
        cpf_raw = cpf_match.group(1).strip() if cpf_match else ""
        nome_raw = nome_match.group(1).strip() if nome_match else ""
        nasc_raw = nasc_match.group(1).strip().replace("-", "/") if nasc_match else ""
        tel_raw = tel_match.group(1).strip() if tel_match else ""
        email_raw = email_match.group(1).strip() if email_match else ""
        qualif_raw = qualif_match.group(1).strip() if qualif_match else ""

        # Se não encontrou por chaves explícitas, busca heurística no bloco
        if not cpf_raw:
            cpf_finder = re.search(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b", block)
            if cpf_finder:
                cpf_raw = cpf_finder.group(0)
                
        if not nasc_raw:
            date_finder = re.search(r"\b\d{2}[/-]\d{2}[/-]\d{4}\b", block)
            if date_finder:
                nasc_raw = date_finder.group(0).replace("-", "/")
                
        if not email_raw:
            email_finder = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", block)
            if email_finder:
                email_raw = email_finder.group(0)
                
        if not tel_raw:
            # Procura telefone com DDD
            tel_finder = re.search(r"(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-.\s]?\d{4}", block)
            if tel_finder and tel_finder.group(0) != cpf_raw:
                tel_raw = tel_finder.group(0)

        if not nome_raw:
            # Tenta pegar a primeira linha que pareça um nome próprio
            for b_line in block.splitlines():
                clean_l = b_line.strip()
                if clean_l and not re.search(r"\d", clean_l) and len(clean_l.split()) >= 2:
                    nome_raw = clean_l
                    break

        if cpf_raw or nome_raw:
            record = _build_criacao_record(cpf_raw, nome_raw, nasc_raw, tel_raw, email_raw, qualif_raw, block)
            records.append(record)

    return records


def _build_criacao_record(cpf_raw: str, nome_raw: str, nasc_raw: str, tel_raw: str, email_raw: str, qualif_raw: str, raw_ref: str) -> Dict[str, Any]:
    valid_cpf, formatted_cpf, cpf_msg = validate_cpf(cpf_raw)
    
    # Sanitização e padronização
    nome = nome_raw.strip().upper() if nome_raw else ""
    data_nasc = nasc_raw.strip() if nasc_raw else ""
    telefone = format_phone(tel_raw) if tel_raw else ""
    email = email_raw.strip().lower() if email_raw else "suporte@grupotalentos.com.br"
    qualificacao = normalize_qualificacao(qualif_raw)
    
    issues = []
    if not valid_cpf:
        issues.append(f"CPF: {cpf_msg}")
    if not nome or len(nome.split()) < 2:
        issues.append("Nome incompleto ou ausente.")
    if not data_nasc:
        issues.append("Data de nascimento ausente.")
    elif not re.match(r"^\d{2}/\d{2}/\d{4}$", data_nasc):
        issues.append("Data de nascimento fora do formato DD/MM/AAAA.")
    if not telefone:
        issues.append("Telefone celular ausente.")
        
    return {
        "cpf_formatado": formatted_cpf if valid_cpf else (cpf_raw or ""),
        "cpf_valido": valid_cpf,
        "cpf_erro": cpf_msg if not valid_cpf else "",
        "nome_completo": nome,
        "data_nascimento": data_nasc,
        "telefone_celular": telefone,
        "email": email,
        "qualificacao": qualificacao,
        "issues": issues,
        "is_valid": len(issues) == 0,
        "raw_source": raw_ref
    }


def parse_revogacao(raw_text: str) -> List[Dict[str, Any]]:
    """
    Extrai registros para SGT3_REVOGAÇÂO.xlsx.
    Campos: Login Z, Nome, CPF, Empresa.
    Regras:
    - Login Z: Z + 6 dígitos.
    - CPF: 11 dígitos numéricos apenas.
    - Empresa: default 'Talentos Total Servicos LTDA ME'.
    """
    records = []
    if not raw_text or not raw_text.strip():
        return records
        
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    
    for idx, line in enumerate(lines):
        if idx == 0 and ("login" in line.lower() or "z" in line.lower()) and "cpf" in line.lower():
            continue
            
        delimiter = "\t" if "\t" in line else (";" if ";" in line else ("," if "," in line else None))
        
        login_z_raw = ""
        nome_raw = ""
        cpf_raw = ""
        empresa_raw = ""
        
        if delimiter:
            parts = [p.strip() for p in line.split(delimiter)]
            for p in parts:
                p_clean = p.strip()
                if re.match(r"(?i)^z\d{6}$", p_clean):
                    login_z_raw = p_clean
                elif len(clean_digits(p_clean)) == 11 and not cpf_raw:
                    cpf_raw = p_clean
                elif "talentos" in p_clean.lower() or "claro" in p_clean.lower() or "empresa" in p_clean.lower():
                    empresa_raw = p_clean
                elif not nome_raw and len(p_clean) > 2 and not any(c.isdigit() for c in p_clean):
                    nome_raw = p_clean
                    
            # Fallback posicional se colunas forem: Login, Nome, CPF, Empresa
            if not login_z_raw and len(parts) >= 1 and re.match(r"(?i)^z\d{6}$", parts[0]):
                login_z_raw = parts[0]
            if not nome_raw and len(parts) >= 2:
                nome_raw = parts[1]
            if not cpf_raw and len(parts) >= 3 and len(clean_digits(parts[2])) == 11:
                cpf_raw = parts[2]
            if not empresa_raw and len(parts) >= 4:
                empresa_raw = parts[3]
        else:
            # Formato chave-valor ou texto corrido
            z_match = re.search(r"(?i)\b(Z\d{6})\b", line)
            if z_match:
                login_z_raw = z_match.group(1)
            else:
                z_kv = re.search(r"(?i)(?:login|z|acesso)\s*[:=-]?\s*([A-Za-z0-9]+)", line)
                if z_kv:
                    login_z_raw = z_kv.group(1)
                    
            cpf_match = re.search(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{11}\b", line)
            if cpf_match:
                cpf_raw = cpf_match.group(0)
                
            nome_match = re.search(r"(?i)(?:nome)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú\s]+)", line)
            if nome_match:
                nome_raw = nome_match.group(1).strip()
            else:
                # Tenta extrair texto que não é Login nem CPF
                cleaned_line = line
                if login_z_raw:
                    cleaned_line = re.sub(re.escape(login_z_raw), "", cleaned_line, flags=re.IGNORECASE)
                if cpf_raw:
                    cleaned_line = re.sub(re.escape(cpf_raw), "", cleaned_line)
                cleaned_line = re.sub(r"[:;,\t\-]", " ", cleaned_line).strip()
                if cleaned_line and len(cleaned_line) > 2:
                    nome_raw = cleaned_line

        if login_z_raw or cpf_raw or nome_raw:
            valid_z, login_clean, z_msg = validate_login_z(login_z_raw)
            valid_cpf, _, cpf_msg = validate_cpf(cpf_raw)
            cpf_digits = clean_digits(cpf_raw)
            empresa = empresa_raw.strip() if empresa_raw else "Talentos Total Servicos LTDA ME"
            
            issues = []
            if not valid_z:
                issues.append(f"Login Z: {z_msg}")
            if not valid_cpf:
                issues.append(f"CPF: {cpf_msg}")
            if not nome_raw:
                issues.append("Nome não informado.")
                
            records.append({
                "login_z": login_clean,
                "login_z_valido": valid_z,
                "login_z_erro": z_msg if not valid_z else "",
                "nome": nome_raw.strip().upper(),
                "cpf_numeros": cpf_digits,
                "cpf_valido": valid_cpf,
                "cpf_erro": cpf_msg if not valid_cpf else "",
                "empresa": empresa,
                "issues": issues,
                "is_valid": len(issues) == 0,
                "raw_source": line
            })
            
    return records


def parse_atualiza_status(raw_text: str) -> List[Dict[str, Any]]:
    """
    Extrai registros para SGT3_ATUALIZA_STATUS.xlsm.
    Campos: CPF, Nome, Situação (FERIAS, RETORNO FERIAS, LICENCA, RETORNO LICENCA).
    Razão Social é fixa: Talentos Total Servicos LTDA ME.
    """
    records = []
    if not raw_text or not raw_text.strip():
        return records
        
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    
    for idx, line in enumerate(lines):
        if idx == 0 and "cpf" in line.lower() and ("situa" in line.lower() or "status" in line.lower() or "nome" in line.lower()):
            continue
            
        delimiter = "\t" if "\t" in line else (";" if ";" in line else ("," if "," in line else None))
        
        cpf_raw = ""
        nome_raw = ""
        situacao_raw = ""
        
        if delimiter:
            parts = [p.strip() for p in line.split(delimiter)]
            for p in parts:
                p_clean = p.strip()
                if len(clean_digits(p_clean)) == 11 and not cpf_raw:
                    cpf_raw = p_clean
                elif any(s in p_clean.upper() for s in ["FERIAS", "FÉR", "LICEN", "RETORNO"]):
                    situacao_raw = p_clean
                elif not nome_raw and len(p_clean) > 2 and not any(c.isdigit() for c in p_clean):
                    nome_raw = p_clean
                    
            if not cpf_raw and len(parts) >= 1 and len(clean_digits(parts[0])) == 11:
                cpf_raw = parts[0]
            if not nome_raw and len(parts) >= 2:
                nome_raw = parts[1]
            if not situacao_raw and len(parts) >= 3:
                situacao_raw = parts[2]
        else:
            cpf_match = re.search(r"\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{11}\b", line)
            if cpf_match:
                cpf_raw = cpf_match.group(0)
                
            # Situação
            sit_match = re.search(r"(?i)\b(retorno\s*f[eé]rias|f[eé]rias|retorno\s*licen[çc]a|licen[çc]a|afastamento)\b", line)
            if sit_match:
                situacao_raw = sit_match.group(0)
                
            nome_match = re.search(r"(?i)(?:nome)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú\s]+)", line)
            if nome_match:
                nome_raw = nome_match.group(1).strip()
            else:
                cleaned = line
                if cpf_raw:
                    cleaned = re.sub(re.escape(cpf_raw), "", cleaned)
                if situacao_raw:
                    cleaned = re.sub(re.escape(situacao_raw), "", cleaned, flags=re.IGNORECASE)
                cleaned = re.sub(r"[:;,\t\-]", " ", cleaned).strip()
                if cleaned and len(cleaned) > 2:
                    nome_raw = cleaned

        if cpf_raw or nome_raw or situacao_raw:
            valid_cpf, _, cpf_msg = validate_cpf(cpf_raw)
            cpf_digits = clean_digits(cpf_raw)
            valid_sit, situacao_norm, sit_msg = normalize_situacao(situacao_raw)
            
            issues = []
            if not valid_cpf:
                issues.append(f"CPF: {cpf_msg}")
            if not nome_raw:
                issues.append("Nome não informado.")
            if not valid_sit:
                issues.append(f"Situação: {sit_msg}")
                
            records.append({
                "cpf_numeros": cpf_digits,
                "cpf_valido": valid_cpf,
                "cpf_erro": cpf_msg if not valid_cpf else "",
                "nome_completo": nome_raw.strip().upper(),
                "razao_social": "Talentos Total Servicos LTDA ME",
                "situacao": situacao_norm,
                "situacao_valida": valid_sit,
                "situacao_erro": sit_msg if not valid_sit else "",
                "issues": issues,
                "is_valid": len(issues) == 0,
                "raw_source": line
            })
            
    return records


def parse_duo_desktop(raw_text: str) -> List[Dict[str, Any]]:
    """
    Extrai registros para SGT3_DUO_DESKTOP.xlsx.
    Campos: Login Z, Nome Completo, Hostname, Machineguid.
    Regras:
    - Login Z: Z + 6 dígitos.
    - Hostname: alfanumérico com hífen sem espaços (ex: CL-51-I5-B2-B2).
    - Machineguid: 8-4-4-4-12 em minúsculas.
    - Detecção e alerta de duplicidades.
    """
    records = []
    if not raw_text or not raw_text.strip():
        return records
        
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    
    seen_logins = {}
    seen_hostnames = {}
    seen_guids = {}
    
    for idx, line in enumerate(lines):
        if idx == 0 and ("login" in line.lower() or "hostname" in line.lower()) and "guid" in line.lower():
            continue
            
        delimiter = "\t" if "\t" in line else (";" if ";" in line else ("," if "," in line else None))
        
        login_z_raw = ""
        nome_raw = ""
        hostname_raw = ""
        guid_raw = ""
        
        guid_regex = r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b"
        
        if delimiter:
            parts = [p.strip() for p in line.split(delimiter)]
            for p in parts:
                p_clean = p.strip()
                if re.match(r"(?i)^z\d{6}$", p_clean):
                    login_z_raw = p_clean
                elif re.match(guid_regex, p_clean):
                    guid_raw = p_clean
                elif re.match(r"^[A-Za-z0-9]+(-[A-Za-z0-9]+)+$", p_clean):
                    hostname_raw = p_clean
                elif not nome_raw and len(p_clean) > 2 and not any(c.isdigit() for c in p_clean):
                    nome_raw = p_clean
                    
            if not login_z_raw and len(parts) >= 1 and re.match(r"(?i)^z\d{6}$", parts[0]):
                login_z_raw = parts[0]
            if not nome_raw and len(parts) >= 2:
                nome_raw = parts[1]
            if not hostname_raw and len(parts) >= 3:
                hostname_raw = parts[2]
            if not guid_raw and len(parts) >= 4:
                guid_raw = parts[3]
        else:
            # Regex pattern matching
            z_match = re.search(r"(?i)\b(Z\d{6})\b", line)
            if z_match:
                login_z_raw = z_match.group(1)
                
            guid_match = re.search(guid_regex, line)
            if guid_match:
                guid_raw = guid_match.group(0)
                
            host_match = re.search(r"(?i)(?:host(?:name)?|maquina|pc)\s*[:=-]?\s*([A-Za-z0-9\-]+)", line)
            if host_match:
                hostname_raw = host_match.group(1)
            else:
                # Procura token com hífens tipo CL-51-I5-B2-B2
                candidate_host = re.search(r"\b[A-Za-z0-9]{2,}(?:-[A-Za-z0-9]{2,})+\b", line)
                if candidate_host and candidate_host.group(0) != guid_raw:
                    hostname_raw = candidate_host.group(0)
                    
            nome_match = re.search(r"(?i)(?:nome)\s*[:=-]?\s*([A-Za-zÁ-Úá-ú\s]+)", line)
            if nome_match:
                nome_raw = nome_match.group(1).strip()
            else:
                cleaned = line
                if login_z_raw:
                    cleaned = re.sub(re.escape(login_z_raw), "", cleaned, flags=re.IGNORECASE)
                if guid_raw:
                    cleaned = re.sub(re.escape(guid_raw), "", cleaned, flags=re.IGNORECASE)
                if hostname_raw:
                    cleaned = re.sub(re.escape(hostname_raw), "", cleaned)
                cleaned = re.sub(r"[:;,\t\-]", " ", cleaned).strip()
                if cleaned and len(cleaned) > 2 and not any(c.isdigit() for c in cleaned):
                    nome_raw = cleaned

        if login_z_raw or guid_raw or hostname_raw or nome_raw:
            valid_z, login_clean, z_msg = validate_login_z(login_z_raw)
            valid_host, host_clean, host_msg = validate_hostname(hostname_raw)
            valid_guid, guid_clean, guid_msg = validate_machineguid(guid_raw)
            
            issues = []
            if not valid_z:
                issues.append(f"Login Z: {z_msg}")
            if not valid_host:
                issues.append(f"Hostname: {host_msg}")
            if not valid_guid:
                issues.append(f"Machineguid: {guid_msg}")
            if not nome_raw:
                issues.append("Nome Completo ausente.")
                
            # Checagem de duplicidade no mesmo lote
            if login_clean:
                if login_clean in seen_logins:
                    issues.append(f"DUPLICIDADE: Login {login_clean} já apareceu na linha {seen_logins[login_clean] + 1}.")
                else:
                    seen_logins[login_clean] = idx
                    
            if host_clean:
                if host_clean in seen_hostnames:
                    issues.append(f"DUPLICIDADE: Hostname {host_clean} já apareceu na linha {seen_hostnames[host_clean] + 1}.")
                else:
                    seen_hostnames[host_clean] = idx
                    
            if guid_clean:
                if guid_clean in seen_guids:
                    issues.append(f"DUPLICIDADE: Machineguid {guid_clean} já apareceu na linha {seen_guids[guid_clean] + 1}.")
                else:
                    seen_guids[guid_clean] = idx
                    
            records.append({
                "origem": "CLARO BR",
                "login_z": login_clean,
                "login_z_valido": valid_z,
                "login_z_erro": z_msg if not valid_z else "",
                "nome_completo": nome_raw.strip().upper(),
                "hostname": host_clean,
                "hostname_valido": valid_host,
                "hostname_erro": host_msg if not valid_host else "",
                "machineguid": guid_clean,
                "machineguid_valido": valid_guid,
                "machineguid_erro": guid_msg if not valid_guid else "",
                "issues": issues,
                "is_valid": len(issues) == 0,
                "raw_source": line
            })
            
    return records
