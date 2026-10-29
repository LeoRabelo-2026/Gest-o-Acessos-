"""
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

# Estilização visual com identidade Claro / Grupo Talentos
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #DA291C 0%, #B30000 100%);
        padding: 1.5rem;
        border-radius: 8px;
        color: white;
        margin-bottom: 1.5rem;
    }
    .main-header h1 {
        margin: 0;
        font-size: 1.8rem;
        color: white;
    }
    .main-header p {
        margin: 0.3rem 0 0 0;
        opacity: 0.9;
        font-size: 0.95rem;
    }
    .badge-error {
        background-color: #ffebee;
        color: #c62828;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
    .badge-success {
        background-color: #e8f5e9;
        color: #2e7d32;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Exemplos dinâmicos por tipo de planilha
PLACEHOLDERS = {
    "Criação de Identidade (V 16)": """Exemplo WhatsApp / Teams:
Nome: Carlos Eduardo da Silva
CPF: 123.456.789-09
Nasc: 14/05/1992
Celular: 11987654321
Email: carlos.silva@grupotalentos.com.br
Qualificação: Superior

Nome: Mariana Oliveira Ramos
CPF: 222.333.444-55
Nasc: 20/08/1998
Celular: 11976543210
Email: mariana.ramos@grupotalentos.com.br
Qualificação: Médio

Ou colagem direta do Excel (TSV):
04212345678\tFERNANDA LIMA\t12/03/1995\t11999998888\tfernanda@email.com\tMÉDIO""",

    "Revogação de Acessos": """Exemplo texto livre ou colagem Excel:
Z559454\tCarlos Eduardo da Silva\t12345678909\tTalentos Total Servicos LTDA ME
Z668123\tMariana Oliveira Ramos\t22233344455\tGrupo Talentos
Z123456\tJoão Pereira Santos\t33344455566

Ou formato mensagem:
Login: Z998877
Nome: Marcos Aurelio
CPF: 444.555.666-77""",

    "Atualização de Status": """Exemplo texto livre ou colagem Excel:
12345678909\tCarlos Eduardo da Silva\tFERIAS
22233344455\tMariana Oliveira Ramos\tRETORNO FERIAS
33344455566\tJoão Pereira Santos\tLICENCA
44455566677\tFernanda Lima Souza\tRETORNO LICENCA

Ou formato mensagem:
Colaborador: Carlos Eduardo
CPF: 123.456.789-09
Status: Férias""",

    "Ativação DUO Desktop": """Exemplo lista de máquinas e usuários:
Z559454\tCarlos Eduardo da Silva\tCL-51-I5-B2-B2\tc6316c4b-8e89-4149-b0d0-fdb622236250
Z668123\tMariana Oliveira Ramos\tCL-44-I7-A1-C3\ta1b2c3d4-e5f6-7890-abcd-ef1234567890

Ou formato WhatsApp / Teams:
Login: Z559454
Nome: Carlos Eduardo
Hostname: CL-51-I5-B2-B2
GUID: c6316c4b-8e89-4149-b0d0-fdb622236250"""
}

# SIDEBAR
st.sidebar.image("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Claro.svg/320px-Claro.svg.png", width=120)
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
st.markdown("""
<div class="main-header">
    <h1>SGT3 • Central de Automação e Validação Operacional</h1>
    <p>Extração inteligente de dados não estruturados, conferência de regras de negócio e geração das 4 planilhas padrão Claro / Grupo Talentos.</p>
</div>
""", unsafe_allow_html=True)

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

col_btn, col_clear = st.columns([1, 5])
with col_btn:
    btn_processar = st.button("🚀 Processar e Validar", type="primary", use_container_width=True)

# Processamento
if btn_processar or "records" in st.session_state:
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

        st.session_state["records"] = records
        st.session_state["filename"] = filename
        st.session_state["mime_type"] = mime_type
        st.session_state["generate_func"] = generate_func
        st.session_state["current_form"] = selected_form

    records = st.session_state.get("records", [])
    filename = st.session_state.get("filename", "planilha.xlsx")
    mime_type = st.session_state.get("mime_type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    generate_func = st.session_state.get("generate_func", None)

    if not records:
        st.error("Nenhum registro pôde ser reconhecido. Verifique o formato do texto inserido.")
        st.stop()

    st.markdown("---")
    st.subheader(f"2. Painel de Conferência ({len(records)} registros identificados)")

    # Auditoria de Inconsistências
    invalid_records = [r for r in records if not r.get("is_valid", True)]
    
    if invalid_records:
        st.error(f"⚠️ Atenção: {len(invalid_records)} registro(s) possuem inconsistências ou violações de regras!")
        with st.expander("🔍 Detalhes das Inconsistências Detectadas", expanded=True):
            for i, r in enumerate(invalid_records, 1):
                col_ref = r.get('nome') or r.get('nome_completo') or f"Linha {i}"
                issues_str = " | ".join(r.get('issues', []))
                st.markdown(f"**Registro {i} ({col_ref}):** {issues_str}")
    else:
        st.success("✅ Todos os registros foram validados com 100% de conformidade!")

    # Tabela de dados interativa
    display_rows = []
    for r in records:
        row = {k: v for k, v in r.items() if k not in ["issues", "is_valid", "raw_source"]}
        row["Status"] = "✅ Válido" if r.get("is_valid") else "⚠️ Inconsistente"
        display_rows.append(row)

    df = pd.DataFrame(display_rows)
    st.dataframe(df, use_container_width=True)

    # Geração do arquivo Excel
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
