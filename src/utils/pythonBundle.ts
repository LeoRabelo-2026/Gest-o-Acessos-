export const PYTHON_BUNDLE_FILES: Record<string, string> = {
  'app.py': `"""
Aplicação Streamlit SGT3 - Automação de Planilhas Operacionais (Claro / Grupo Talentos).
Desenvolvido para extração, validação rigorosa de regras de negócio e geração automática das planilhas:
- SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm (V 16, macros preservadas, linha 6)
- SGT3_REVOGAÇÂO.xlsx (linha 2)
- SGT3_ATUALIZA_STATUS.xlsm (linha 3, marcações X)
- SGT3_DUO_DESKTOP.xlsx (linha 8 estrita)
"""

import streamlit as st
import pandas as pd
from parsers import (
    parse_criacao_identidade,
    parse_revogacao,
    parse_atualiza_status,
    parse_duo_desktop
)
from excel_engine import (
    generate_criacao_identidade_excel,
    generate_revogacao_excel,
    generate_atualiza_status_excel,
    generate_duo_desktop_excel
)

st.set_page_config(
    page_title="SGT3 Automação - Claro & Grupo Talentos",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Exemplos dinâmicos por tipo de planilha
PLACEHOLDERS = {
    "Criação de Identidade (V 16)": """Exemplo WhatsApp / Teams:
Nome: Carlos Eduardo da Silva
CPF: 382.492.128-09
Nasc: 14/05/1992
Celular: 11987654321
Email: carlos.silva@grupotalentos.com.br
Qualificação: Superior

Nome: Mariana Oliveira Ramos
CPF: 191.458.730-04
Nasc: 20/08/1998
Celular: 11976543210
Email: mariana.ramos@grupotalentos.com.br
Qualificação: Médio

Ou colagem direta do Excel (TSV):
04212345678\\tFERNANDA LIMA\\t12/03/1995\\t11999998888\\tfernanda@email.com\\tMÉDIO""",

    "Revogação de Acessos": """Exemplo texto livre ou colagem Excel:
Z559454\\tCarlos Eduardo da Silva\\t38249212809\\tTalentos Total Servicos LTDA ME
Z668123\\tMariana Oliveira Ramos\\t19145873004\\tGrupo Talentos
Z123456\\tJoão Pereira Santos\\t44220394826

Ou formato mensagem:
Login: Z998877
Nome: Marcos Aurelio
CPF: 382.492.128-09""",

    "Atualização de Status": """Exemplo texto livre ou colagem Excel:
38249212809\\tCarlos Eduardo da Silva\\tFERIAS
19145873004\\tMariana Oliveira Ramos\\tRETORNO FERIAS
44220394826\\tJoão Pereira Santos\\tLICENCA
02846337632\\tDegleiton Aquino de Melo\\tRETORNO LICENCA""",

    "Ativação DUO Desktop": """Exemplo lista de máquinas e usuários:
Z559454\\tCarlos Eduardo da Silva\\tCL-51-I5-B2-B2\\tc6316c4b-8e89-4149-b0d0-fdb622236250
Z668123\\tMariana Oliveira Ramos\\tCL-44-I7-A1-C3\\ta1b2c3d4-e5f6-7890-abcd-ef1234567890

Ou formato WhatsApp / Teams:
Login: Z559454
Nome: Carlos Eduardo
Hostname: CL-51-I5-B2-B2
GUID: c6316c4b-8e89-4149-b0d0-fdb622236250"""
}

# SIDEBAR
st.sidebar.title("Operação SGT3")
st.sidebar.markdown("**Grupo Talentos & Claro Brasil**")
st.sidebar.markdown("---")

st.sidebar.subheader("📂 Template Oficial (Opcional)")
uploaded_template = st.sidebar.file_uploader(
    "Fazer upload de template personalizado (.xlsx / .xlsm)",
    type=["xlsx", "xlsm"],
    help="Se não enviado, o sistema usará o template padrão ou gerará o layout oficial automaticamente."
)

template_bytes = uploaded_template.read() if uploaded_template else None

st.sidebar.markdown("---")
st.sidebar.subheader("ℹ️ Orientações e Regras")
st.sidebar.info(
    """
    - **Validação de CPF**: Cálculo estrito do módulo 11 (dígitos verificadores).
    - **Login Z**: Obrigatório 'Z' seguido de 6 dígitos numéricos.
    - **DUO Desktop**: Preenchimento a partir da **Linha 8**, com GUIDs em minúsculas e alertas de duplicidade.
    - **Macros (.xlsm)**: Preservação total de código VBA existente.
    """
)

# ÁREA PRINCIPAL
st.title("SGT3 • Central de Automação e Validação Operacional")
st.markdown("Extração inteligente de dados não estruturados, conferência de regras de negócio e geração das 4 planilhas padrão Claro / Grupo Talentos.")

# Seletor de Tipo de Planilha
form_options = [
    "Criação de Identidade (V 16)",
    "Revogação de Acessos",
    "Atualização de Status",
    "Ativação DUO Desktop"
]
selected_form = st.selectbox("Selecione o modelo de planilha SGT3 a gerar:", form_options)

# Campo de texto para colagem
st.subheader("1. Entrada de Dados Não Estruturados")
placeholder_text = PLACEHOLDERS.get(selected_form, "")
raw_input = st.text_area(
    "Cole aqui as mensagens brutas (WhatsApp, Teams, e-mails ou linhas copiadas do Excel):",
    height=200,
    placeholder=placeholder_text
)

btn_processar = st.button("🚀 Processar e Validar", type="primary")

if btn_processar:
    if not raw_input.strip():
        st.warning("Por favor, cole os dados no campo de texto antes de processar.")
        st.stop()
        
    if selected_form == "Criação de Identidade (V 16)":
        records = parse_criacao_identidade(raw_input)
        filename = "SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm"
        mime_type = "application/vnd.ms-excel.sheet.macroEnabled.12"
        generate_func = generate_criacao_identidade_excel
    elif selected_form == "Revogação de Acessos":
        records = parse_revogacao(raw_input)
        filename = "SGT3_REVOGAÇÂO.xlsx"
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        generate_func = generate_revogacao_excel
    elif selected_form == "Atualização de Status":
        records = parse_atualiza_status(raw_input)
        filename = "SGT3_ATUALIZA_STATUS.xlsm"
        mime_type = "application/vnd.ms-excel.sheet.macroEnabled.12"
        generate_func = generate_atualiza_status_excel
    else: # Ativação DUO Desktop
        records = parse_duo_desktop(raw_input)
        filename = "SGT3_DUO_DESKTOP.xlsx"
        mime_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        generate_func = generate_duo_desktop_excel

    if not records:
        st.error("Nenhum registro pôde ser reconhecido. Verifique o formato do texto inserido.")
        st.stop()

    st.markdown("---")
    st.subheader(f"2. Painel de Conferência ({len(records)} registros identificados)")

    invalid_records = [r for r in records if not r.get("is_valid", True)]
    
    if invalid_records:
        st.error(f"⚠️ Atenção: {len(invalid_records)} registro(s) possuem inconsistências!")
        with st.expander("🔍 Detalhes das Inconsistências Detectadas", expanded=True):
            for i, r in enumerate(invalid_records, 1):
                col_ref = r.get('nome') or r.get('nome_completo') or f"Linha {i}"
                issues_str = " | ".join(r.get('issues', []))
                st.markdown(f"**Registro {i} ({col_ref}):** {issues_str}")
    else:
        st.success("✅ Todos os registros foram validados com 100% de conformidade!")

    display_rows = []
    for r in records:
        row = {k: v for k, v in r.items() if k not in ["issues", "is_valid", "raw_source"]}
        row["Status"] = "✅ Válido" if r.get("is_valid") else "⚠️ Inconsistente"
        display_rows.append(row)

    df = pd.DataFrame(display_rows)
    st.dataframe(df, use_container_width=True)

    st.markdown("---")
    st.subheader("3. Exportação e Download Oficial")
    
    try:
        excel_bytes = generate_func(records, template_bytes)
        st.download_button(
            label=f"📥 Baixar Planilha Oficial: {filename}",
            data=excel_bytes,
            file_name=filename,
            mime=mime_type,
            type="primary"
        )
    except Exception as e:
        st.error(f"Erro ao gerar a planilha com openpyxl: {str(e)}")
`,

  'parsers.py': `"""
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
    records = []
    if not raw_text or not raw_text.strip():
        return records

    text = raw_text.strip()
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    is_tabular = any("\\t" in line or (";" in line and len(line.split(";")) >= 3) for line in lines)
    
    if is_tabular:
        for idx, line in enumerate(lines):
            if idx == 0 and ("cpf" in line.lower() and "nome" in line.lower()):
                continue
                
            delimiter = "\\t" if "\\t" in line else (";" if ";" in line else None)
            if delimiter:
                parts = [p.strip() for p in line.split(delimiter)]
                cpf_raw, nome_raw, nasc_raw, tel_raw, email_raw, qualif_raw = "", "", "", "", "", "MÉDIO"
                for part in parts:
                    digits = clean_digits(part)
                    if (len(digits) == 11 or re.match(r"^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$", part)) and not cpf_raw:
                        cpf_raw = part
                    elif re.search(r"\\b\\d{2}[/-]\\d{2}[/-]\\d{4}\\b", part) and not nasc_raw:
                        nasc_raw = re.search(r"\\b\\d{2}[/-]\\d{2}[/-]\\d{4}\\b", part).group(0).replace("-", "/")
                    elif "@" in part and "." in part and not email_raw:
                        email_raw = part
                    elif (len(digits) in (10, 11) or re.search(r"\\(\\d{2}\\)", part)) and not tel_raw and part != cpf_raw:
                        tel_raw = part
                    elif any(q in part.upper() for q in ["FUNDAMENTAL", "MÉDIO", "MEDIO", "SUPERIOR"]):
                        qualif_raw = part
                    elif not nome_raw and len(part) > 3 and not any(c.isdigit() for c in part):
                        nome_raw = part

                if not cpf_raw and len(parts) > 0 and len(clean_digits(parts[0])) == 11:
                    cpf_raw = parts[0]
                if not nome_raw and len(parts) > 1:
                    nome_raw = parts[1]
                    
                if cpf_raw or nome_raw:
                    records.append(_build_criacao_record(cpf_raw, nome_raw, nasc_raw, tel_raw, email_raw, qualif_raw, line))
        if records:
            return records

    blocks = re.split(r"\\n\\s*\\n|(?=(?i)(?:^|\\n)\\s*(?:nome|cpf)\\s*:)", text)
    blocks = [b.strip() for b in blocks if b.strip()]
    
    for block in blocks:
        cpf_match = re.search(r"(?i)(?:cpf|doc(?:umento)?)\\s*[:=-]?\\s*([0-9.\\-]{11,14})", block)
        nome_match = re.search(r"(?i)(?:nome(?:\\s+completo)?)\\s*[:=-]?\\s*([^\\n\\r,;]+)", block)
        nasc_match = re.search(r"(?i)(?:nasc(?:imento)?|data\\s*nasc(?:imento)?)\\s*[:=-]?\\s*(\\d{2}[/-]\\d{2}[/-]\\d{4})", block)
        tel_match = re.search(r"(?i)(?:tel(?:efone)?|cel(?:ular)?|contato|whatsapp)\\s*[:=-]?\\s*([\\d\\s().-]{8,20})", block)
        email_match = re.search(r"(?i)(?:e-?mail)\\s*[:=-]?\\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})", block)
        qualif_match = re.search(r"(?i)(?:qualifica[çc][aã]o|escolaridade|grau)\\s*[:=-]?\\s*([A-Za-zÁ-Úá-ú]+)", block)
        
        cpf_raw = cpf_match.group(1).strip() if cpf_match else ""
        nome_raw = nome_match.group(1).strip() if nome_match else ""
        nasc_raw = nasc_match.group(1).strip().replace("-", "/") if nasc_match else ""
        tel_raw = tel_match.group(1).strip() if tel_match else ""
        email_raw = email_match.group(1).strip() if email_match else ""
        qualif_raw = qualif_match.group(1).strip() if qualif_match else ""

        if not cpf_raw:
            cpf_finder = re.search(r"\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b", block)
            if cpf_finder:
                cpf_raw = cpf_finder.group(0)
        if not nasc_raw:
            date_finder = re.search(r"\\b\\d{2}[/-]\\d{2}[/-]\\d{4}\\b", block)
            if date_finder:
                nasc_raw = date_finder.group(0).replace("-", "/")
        if not email_raw:
            email_finder = re.search(r"\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b", block)
            if email_finder:
                email_raw = email_finder.group(0)
        if not tel_raw:
            tel_finder = re.search(r"(?:\\(?\\d{2}\\)?\\s*)?(?:9\\s*)?\\d{4}[-.\\s]?\\d{4}", block)
            if tel_finder and tel_finder.group(0) != cpf_raw:
                tel_raw = tel_finder.group(0)
        if not nome_raw:
            for b_line in block.splitlines():
                clean_l = b_line.strip()
                if clean_l and not re.search(r"\\d", clean_l) and len(clean_l.split()) >= 2:
                    nome_raw = clean_l
                    break

        if cpf_raw or nome_raw:
            records.append(_build_criacao_record(cpf_raw, nome_raw, nasc_raw, tel_raw, email_raw, qualif_raw, block))

    return records


def _build_criacao_record(cpf_raw: str, nome_raw: str, nasc_raw: str, tel_raw: str, email_raw: str, qualif_raw: str, raw_ref: str) -> Dict[str, Any]:
    valid_cpf, formatted_cpf, cpf_msg = validate_cpf(cpf_raw)
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
    elif not re.match(r"^\\d{2}/\\d{2}/\\d{4}$", data_nasc):
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
    records = []
    if not raw_text or not raw_text.strip():
        return records
        
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    for idx, line in enumerate(lines):
        if idx == 0 and ("login" in line.lower() or "z" in line.lower()) and "cpf" in line.lower():
            continue
            
        delimiter = "\\t" if "\\t" in line else (";" if ";" in line else ("," if "," in line else None))
        login_z_raw, nome_raw, cpf_raw, empresa_raw = "", "", "", ""
        
        if delimiter:
            parts = [p.strip() for p in line.split(delimiter)]
            for p in parts:
                if re.match(r"(?i)^z\\d{6}$", p):
                    login_z_raw = p
                elif len(clean_digits(p)) == 11 and not cpf_raw:
                    cpf_raw = p
                elif "talentos" in p.lower() or "claro" in p.lower() or "empresa" in p.lower():
                    empresa_raw = p
                elif not nome_raw and len(p) > 2 and not any(c.isdigit() for c in p):
                    nome_raw = p
            if not login_z_raw and len(parts) >= 1 and re.match(r"(?i)^z\\d{6}$", parts[0]):
                login_z_raw = parts[0]
            if not nome_raw and len(parts) >= 2:
                nome_raw = parts[1]
            if not cpf_raw and len(parts) >= 3 and len(clean_digits(parts[2])) == 11:
                cpf_raw = parts[2]
            if not empresa_raw and len(parts) >= 4:
                empresa_raw = parts[3]
        else:
            z_match = re.search(r"(?i)\\b(Z\\d{6})\\b", line)
            if z_match:
                login_z_raw = z_match.group(1)
            cpf_match = re.search(r"\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b|\\b\\d{11}\\b", line)
            if cpf_match:
                cpf_raw = cpf_match.group(0)
            nome_match = re.search(r"(?i)(?:nome)\\s*[:=-]?\\s*([A-Za-zÁ-Úá-ú\\s]+)", line)
            if nome_match:
                nome_raw = nome_match.group(1).strip()

        if login_z_raw or cpf_raw or nome_raw:
            valid_z, login_clean, z_msg = validate_login_z(login_z_raw)
            valid_cpf, _, cpf_msg = validate_cpf(cpf_raw)
            cpf_digits = clean_digits(cpf_raw)
            empresa = empresa_raw.strip() if empresa_raw else "Talentos Total Servicos LTDA ME"
            
            issues = []
            if not valid_z: issues.append(f"Login Z: {z_msg}")
            if not valid_cpf: issues.append(f"CPF: {cpf_msg}")
            if not nome_raw: issues.append("Nome não informado.")
                
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
    records = []
    if not raw_text or not raw_text.strip():
        return records
        
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    for idx, line in enumerate(lines):
        if idx == 0 and "cpf" in line.lower() and ("situa" in line.lower() or "status" in line.lower() or "nome" in line.lower()):
            continue
            
        delimiter = "\\t" if "\\t" in line else (";" if ";" in line else ("," if "," in line else None))
        cpf_raw, nome_raw, situacao_raw = "", "", ""
        
        if delimiter:
            parts = [p.strip() for p in line.split(delimiter)]
            for p in parts:
                if len(clean_digits(p)) == 11 and not cpf_raw:
                    cpf_raw = p
                elif any(s in p.upper() for s in ["FERIAS", "FÉR", "LICEN", "RETORNO"]):
                    situacao_raw = p
                elif not nome_raw and len(p) > 2 and not any(c.isdigit() for c in p):
                    nome_raw = p
            if not cpf_raw and len(parts) >= 1 and len(clean_digits(parts[0])) == 11:
                cpf_raw = parts[0]
            if not nome_raw and len(parts) >= 2:
                nome_raw = parts[1]
            if not situacao_raw and len(parts) >= 3:
                situacao_raw = parts[2]
        else:
            cpf_match = re.search(r"\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b|\\b\\d{11}\\b", line)
            if cpf_match: cpf_raw = cpf_match.group(0)
            sit_match = re.search(r"(?i)\\b(retorno\\s*f[eé]rias|f[eé]rias|retorno\\s*licen[çc]a|licen[çc]a|afastamento)\\b", line)
            if sit_match: situacao_raw = sit_match.group(0)
            nome_match = re.search(r"(?i)(?:nome)\\s*[:=-]?\\s*([A-Za-zÁ-Úá-ú\\s]+)", line)
            if nome_match: nome_raw = nome_match.group(1).strip()

        if cpf_raw or nome_raw or situacao_raw:
            valid_cpf, _, cpf_msg = validate_cpf(cpf_raw)
            valid_sit, situacao_norm, sit_msg = normalize_situacao(situacao_raw)
            
            issues = []
            if not valid_cpf: issues.append(f"CPF: {cpf_msg}")
            if not nome_raw: issues.append("Nome não informado.")
            if not valid_sit: issues.append(f"Situação: {sit_msg}")
                
            records.append({
                "cpf_numeros": clean_digits(cpf_raw),
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
    records = []
    if not raw_text or not raw_text.strip():
        return records
        
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    guid_regex = r"\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b"
    seen_logins, seen_hostnames, seen_guids = {}, {}, {}
    
    for idx, line in enumerate(lines):
        if idx == 0 and ("login" in line.lower() or "hostname" in line.lower()) and "guid" in line.lower():
            continue
            
        delimiter = "\\t" if "\\t" in line else (";" if ";" in line else ("," if "," in line else None))
        login_z_raw, nome_raw, hostname_raw, guid_raw = "", "", "", ""
        
        if delimiter:
            parts = [p.strip() for p in line.split(delimiter)]
            for p in parts:
                if re.match(r"(?i)^z\\d{6}$", p): login_z_raw = p
                elif re.match(guid_regex, p): guid_raw = p
                elif re.match(r"^[A-Za-z0-9]+(-[A-Za-z0-9]+)+$", p): hostname_raw = p
                elif not nome_raw and len(p) > 2 and not any(c.isdigit() for c in p): nome_raw = p
            if not login_z_raw and len(parts) >= 1 and re.match(r"(?i)^z\\d{6}$", parts[0]): login_z_raw = parts[0]
            if not nome_raw and len(parts) >= 2: nome_raw = parts[1]
            if not hostname_raw and len(parts) >= 3: hostname_raw = parts[2]
            if not guid_raw and len(parts) >= 4: guid_raw = parts[3]
        else:
            z_match = re.search(r"(?i)\\b(Z\\d{6})\\b", line)
            if z_match: login_z_raw = z_match.group(1)
            guid_match = re.search(guid_regex, line)
            if guid_match: guid_raw = guid_match.group(0)
            host_match = re.search(r"(?i)(?:host(?:name)?|maquina|pc)\\s*[:=-]?\\s*([A-Za-z0-9\\-]+)", line)
            if host_match: hostname_raw = host_match.group(1)
            nome_match = re.search(r"(?i)(?:nome)\\s*[:=-]?\\s*([A-Za-zÁ-Úá-ú\\s]+)", line)
            if nome_match: nome_raw = nome_match.group(1).strip()

        if login_z_raw or guid_raw or hostname_raw or nome_raw:
            valid_z, login_clean, z_msg = validate_login_z(login_z_raw)
            valid_host, host_clean, host_msg = validate_hostname(hostname_raw)
            valid_guid, guid_clean, guid_msg = validate_machineguid(guid_raw)
            
            issues = []
            if not valid_z: issues.append(f"Login Z: {z_msg}")
            if not valid_host: issues.append(f"Hostname: {host_msg}")
            if not valid_guid: issues.append(f"Machineguid: {guid_msg}")
            if not nome_raw: issues.append("Nome Completo ausente.")
                
            if login_clean:
                if login_clean in seen_logins:
                    issues.append(f"DUPLICIDADE: Login {login_clean} já apareceu na linha {seen_logins[login_clean] + 1}.")
                else: seen_logins[login_clean] = idx
            if host_clean:
                if host_clean in seen_hostnames:
                    issues.append(f"DUPLICIDADE: Hostname {host_clean} já apareceu na linha {seen_hostnames[host_clean] + 1}.")
                else: seen_hostnames[host_clean] = idx
            if guid_clean:
                if guid_clean in seen_guids:
                    issues.append(f"DUPLICIDADE: Machineguid {guid_clean} já apareceu na linha {seen_guids[guid_clean] + 1}.")
                else: seen_guids[guid_clean] = idx
                    
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
`,

  'validators.py': `"""
Módulo de Validações de Regras de Negócio - SGT3 (Claro / Grupo Talentos).
Validação estrita de CPF (módulo 11), Login Z, Hostname, Machineguid e campos padronizados.
"""

import re
from typing import Tuple, Optional


def clean_digits(value: str) -> str:
    if not value: return ""
    return re.sub(r"\\D", "", str(value))


def validate_cpf(cpf_raw: str) -> Tuple[bool, str, str]:
    digits = clean_digits(cpf_raw)
    if len(digits) != 11:
        return False, digits, f"CPF possui {len(digits)} dígitos (esperado: 11)."
    if digits == digits[0] * 11:
        return False, digits, "CPF inválido (todos os dígitos repetidos)."
    soma_1 = sum(int(digits[i]) * (10 - i) for i in range(9))
    resto_1 = (soma_1 * 10) % 11
    digito_1 = 0 if resto_1 == 10 else resto_1
    if digito_1 != int(digits[9]):
        return False, digits, "Primeiro dígito verificador incorreto."
    soma_2 = sum(int(digits[i]) * (11 - i) for i in range(10))
    resto_2 = (soma_2 * 10) % 11
    digito_2 = 0 if resto_2 == 10 else resto_2
    if digito_2 != int(digits[10]):
        return False, digits, "Segundo dígito verificador incorreto."
    formatted = f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"
    return True, formatted, "CPF Válido"


def validate_login_z(login_raw: str) -> Tuple[bool, str, str]:
    if not login_raw: return False, "", "Login Z não informado."
    login_clean = str(login_raw).strip().upper()
    if not re.match(r"^Z\\d{6}$", login_clean):
        return False, login_clean, "Login Z inválido (deve ser 'Z' seguido de 6 números)."
    return True, login_clean, "Login Z Válido"


def validate_machineguid(guid_raw: str) -> Tuple[bool, str, str]:
    if not guid_raw: return False, "", "Machineguid não informado."
    guid_clean = str(guid_raw).strip().lower()
    if not re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", guid_clean):
        return False, guid_clean, "Machineguid inválido (formato esperado: 8-4-4-4-12 hex)."
    return True, guid_clean, "Machineguid Válido"


def validate_hostname(hostname_raw: str) -> Tuple[bool, str, str]:
    if not hostname_raw: return False, "", "Hostname não informado."
    hostname_clean = str(hostname_raw).strip().upper()
    if " " in hostname_clean: return False, hostname_clean, "Hostname não pode conter espaços."
    if not re.match(r"^[A-Z0-9]+(-[A-Z0-9]+)*$", hostname_clean):
        return False, hostname_clean, "Hostname contém caracteres inválidos."
    return True, hostname_clean, "Hostname Válido"


def normalize_situacao(situacao_raw: str) -> Tuple[bool, str, str]:
    if not situacao_raw: return False, "", "Situação não informada."
    text = situacao_raw.strip().upper()
    if "RETORNO" in text and ("FÉR" in text or "FERIAS" in text or "FER" in text):
        return True, "RETORNO FERIAS", "Válido"
    elif "FÉR" in text or "FERIAS" in text or "FERIA" in text:
        return True, "FERIAS", "Válido"
    elif "RETORNO" in text and ("LICEN" in text or "AFAST" in text):
        return True, "RETORNO LICENCA", "Válido"
    elif "LICEN" in text or "AFAST" in text:
        return True, "LICENCA", "Válido"
    valid_options = ["FERIAS", "RETORNO FERIAS", "LICENCA", "RETORNO LICENCA"]
    if text in valid_options: return True, text, "Válido"
    return False, text, f"Situação desconhecida ('{text}')."


def normalize_qualificacao(qualif_raw: str) -> str:
    if not qualif_raw: return "MÉDIO"
    text = qualif_raw.strip().upper()
    if "FUND" in text: return "FUNDAMENTAL"
    elif "SUP" in text or "GRAD" in text or "POS" in text or "PÓS" in text: return "SUPERIOR"
    return "MÉDIO"


def format_phone(phone_raw: str) -> str:
    digits = clean_digits(phone_raw)
    if len(digits) == 11: return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    elif len(digits) == 10: return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    elif len(digits) == 13 and digits.startswith("55"): return format_phone(digits[2:])
    return phone_raw.strip() if phone_raw else ""
`,

  'excel_engine.py': `"""
Motor de Geração e Preenchimento de Planilhas SGT3 (Claro / Grupo Talentos).
openpyxl com keep_vba=True e suporte a templates ou criação do zero.
"""

import os, io
from typing import List, Dict, Any, Optional
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")


def _get_or_create_workbook(template_bytes: Optional[bytes], default_filename: str, is_macro: bool = False):
    if template_bytes:
        return openpyxl.load_workbook(io.BytesIO(template_bytes), keep_vba=is_macro)
    local_path = os.path.join(TEMPLATES_DIR, default_filename)
    if os.path.exists(local_path):
        return openpyxl.load_workbook(local_path, keep_vba=is_macro)
    return openpyxl.Workbook()


def generate_criacao_identidade_excel(records: List[Dict[str, Any]], template_bytes: Optional[bytes] = None) -> bytes:
    wb = _get_or_create_workbook(template_bytes, "SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm", is_macro=True)
    ws = wb.active
    ws.title = "Identidades SGT3"

    start_row = 6
    for idx, rec in enumerate(records):
        r = start_row + idx
        ws.cell(row=r, column=2, value="TERCEIRO CALL CENTER")
        ws.cell(row=r, column=3, value="NÃO")
        ws.cell(row=r, column=4, value="SIM (CLARO + NET + EMBRATEL)")
        ws.cell(row=r, column=5, value="NÃO")
        ws.cell(row=r, column=6, value="NÃO SE APLICA")
        ws.cell(row=r, column=9, value=rec.get("cpf_formatado", ""))
        ws.cell(row=r, column=10, value=rec.get("nome_completo", ""))
        ws.cell(row=r, column=11, value=rec.get("data_nascimento", ""))
        ws.cell(row=r, column=13, value=rec.get("telefone_celular", ""))
        ws.cell(row=r, column=14, value=rec.get("email", "suporte@grupotalentos.com.br"))
        ws.cell(row=r, column=15, value=rec.get("qualificacao", "MÉDIO"))
        ws.cell(row=r, column=16, value="54.956.511/0001-00")
        ws.cell(row=r, column=17, value="Talentos Total Servicos LTDA ME")
        ws.cell(row=r, column=18, value="CALL CENTER - COBRANÇA")
        ws.cell(row=r, column=19, value="NÃO")
        ws.cell(row=r, column=20, value="54.956.511/0001-00")
        ws.cell(row=r, column=21, value="Talentos Total Servicos LTDA ME")
        ws.cell(row=r, column=22, value="CLT")
        ws.cell(row=r, column=25, value="SUPORTE AO NEGOCIO")
        ws.cell(row=r, column=26, value="TERCEIRIZAÇÃO")
        ws.cell(row=r, column=27, value="SERVIÇOS DE APOIO")
        ws.cell(row=r, column=28, value="CLARO SP - REGIONAL SÃO PAULO")
        ws.cell(row=r, column=29, value="SP")
        ws.cell(row=r, column=30, value="São Paulo")
        ws.cell(row=r, column=31, value="028.463.376-32")
        ws.cell(row=r, column=32, value="DEGLEITON AQUINO DE MELO")

    output = io.BytesIO()
    wb.save(output)
    return output.getvalue()


def generate_revogacao_excel(records: List[Dict[str, Any]], template_bytes: Optional[bytes] = None) -> bytes:
    wb = _get_or_create_workbook(template_bytes, "SGT3_REVOGAÇÂO.xlsx", is_macro=False)
    ws = wb.active
    ws.title = "Revogação"

    for idx, rec in enumerate(records, start=2):
        ws.cell(row=idx, column=1, value=rec.get("login_z", "")).alignment = Alignment(horizontal="center")
        ws.cell(row=idx, column=2, value=rec.get("nome", ""))
        c = ws.cell(row=idx, column=3, value=str(rec.get("cpf_numeros", "")))
        c.number_format = "@"
        c.alignment = Alignment(horizontal="center")
        ws.cell(row=idx, column=4, value=rec.get("empresa", "Talentos Total Servicos LTDA ME"))

    output = io.BytesIO()
    wb.save(output)
    return output.getvalue()


def generate_atualiza_status_excel(records: List[Dict[str, Any]], template_bytes: Optional[bytes] = None) -> bytes:
    wb = _get_or_create_workbook(template_bytes, "SGT3_ATUALIZA_STATUS.xlsm", is_macro=True)
    ws = wb.active
    ws.title = "Status Colaboradores"

    for idx, rec in enumerate(records, start=3):
        c = ws.cell(row=idx, column=1, value=str(rec.get("cpf_numeros", "")))
        c.number_format = "@"
        ws.cell(row=idx, column=2, value="")
        ws.cell(row=idx, column=3, value=rec.get("nome_completo", ""))
        ws.cell(row=idx, column=4, value="Talentos Total Servicos LTDA ME")
        sit = rec.get("situacao", "")
        ws.cell(row=idx, column=5, value="X" if sit == "FERIAS" else "")
        ws.cell(row=idx, column=6, value="X" if sit == "RETORNO FERIAS" else "")
        ws.cell(row=idx, column=7, value="X" if sit == "LICENCA" else "")
        ws.cell(row=idx, column=8, value="X" if sit == "RETORNO LICENCA" else "")

    output = io.BytesIO()
    wb.save(output)
    return output.getvalue()


def generate_duo_desktop_excel(records: List[Dict[str, Any]], template_bytes: Optional[bytes] = None) -> bytes:
    wb = _get_or_create_workbook(template_bytes, "SGT3_DUO_DESKTOP.xlsx", is_macro=False)
    ws = wb.active
    ws.title = "DUO Desktop"

    start_row = 8
    for idx, rec in enumerate(records):
        r = start_row + idx
        ws.cell(row=r, column=4, value="CLARO BR")
        ws.cell(row=r, column=12, value=rec.get("login_z", ""))
        ws.cell(row=r, column=14, value=rec.get("nome_completo", ""))
        ws.cell(row=r, column=18, value=rec.get("hostname", ""))
        ws.cell(row=r, column=20, value=str(rec.get("machineguid", "")).lower())

    output = io.BytesIO()
    wb.save(output)
    return output.getvalue()
`,

  'requirements.txt': `streamlit>=1.30.0
openpyxl>=3.1.2
pandas>=2.0.0
`,

  'README.md': `# SGT3 Automação - Claro & Grupo Talentos

Aplicação completa em Python (Streamlit) para automação de planilhas operacionais do sistema SGT3.

## Instalação e Execução Local

\`\`\`bash
# 1. Instalar dependências
pip install -r requirements.txt

# 2. Executar aplicativo Streamlit
streamlit run app.py
\`\`\`
`
};
