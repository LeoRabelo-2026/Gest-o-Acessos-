# SGT3 Automação - Claro & Grupo Talentos

Aplicação completa em Python (Streamlit) e Web React para automação de extração de dados não estruturados, validação rigorosa de regras de negócio e geração das 4 planilhas operacionais do sistema **SGT3 (Claro / Grupo Talentos)**.

---

## 📋 As 4 Planilhas Suportadas

1. **`SGT3_CRIAÇÃO_DE_IDENTIDADE.xlsm`** (Versão V 16)
   - Linha inicial de dados: **Linha 6**
   - Preserva macros VBA originais (`keep_vba=True`)
   - Preenche parâmetros institucionais: CNPJ Grupo Talentos `54.956.511/0001-00`, Área `CALL CENTER - COBRANÇA`, Gestor `DEGLEITON AQUINO DE MELO`, etc.
   - Validação matemática de CPF (módulo 11) e formatação `000.000.000-00`

2. **`SGT3_REVOGAÇÂO.xlsx`**
   - Linha 1 = Cabeçalho (`LOGIN Z`, `NOME`, `CPF`, `EMPRESA`)
   - Linha 2 em diante = Dados
   - Login Z estrito (`^Z\d{6}$`) e CPF de 11 dígitos numéricos

3. **`SGT3_ATUALIZA_STATUS.xlsm`**
   - Linha 1 = Título/Ação
   - Linha 2 = Cabeçalhos
   - Linha 3 em diante = Dados com marcação com `X` na coluna correspondente:
     - `FERIAS`, `RETORNO FERIAS`, `LICENCA` ou `RETORNO LICENCA`
   - Razão Social fixa como `Talentos Total Servicos LTDA ME`

4. **`SGT3_DUO_DESKTOP.xlsx`**
   - Linha inicial de dados: **Estritamente Linha 8**
   - Colunas: D (Origem `CLARO BR`), L (Login Z), N (Nome Completo), R (Hostname), T (Machineguid minúsculo)
   - Validação de GUID hexadecimal (8-4-4-4-12), Hostname sem espaços e alerta de duplicidades

---

## 🚀 Como Executar Localmente em Python (Streamlit)

### Pré-requisitos
- Python 3.10 ou superior instalado
- Git instalado (opcional)

### Passo a Passo

1. **Clone ou navegue até o diretório do projeto**:
   ```bash
   cd sgt3-automacao
   ```

2. **Crie e ative um ambiente virtual (recomendado)**:
   ```bash
   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate

   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Instale as dependências**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Execute o aplicativo Streamlit**:
   ```bash
   streamlit run app.py
   ```

5. O navegador abrirá automaticamente em `http://localhost:8501`.

---

## 🗂️ Estrutura Modular dos Arquivos

```
├── app.py              # Interface Streamlit principal (Sidebar, visualização, downloads)
├── parsers.py          # Mecanismo de parsing inteligente (WhatsApp, Teams, TSV, CSV, Regex)
├── validators.py       # Validações matemáticas (Módulo 11 CPF, Login Z, Hostname, GUID)
├── excel_engine.py     # Motor openpyxl com suporte a .xlsm (keep_vba=True) e .xlsx
├── requirements.txt    # Dependências do projeto (streamlit, openpyxl, pandas)
└── templates/          # Diretório opcional para armazenar templates originais oficiais
```
