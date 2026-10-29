/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RawInputSection } from './components/RawInputSection';
import { ValidationAlerts } from './components/ValidationAlerts';
import { DataTable } from './components/DataTable';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { OperationalGuide } from './components/OperationalGuide';
import { SGT3FormType } from './types/sgt3';
import { FORM_CONFIGS, SAMPLE_INPUTS } from './utils/sampleData';
import {
  parseCriacaoIdentidade,
  parseRevogacao,
  parseAtualizaStatus,
  parseDuoDesktop
} from './utils/parsers';
import {
  generateCriacaoIdentidadeWorkbook,
  generateRevogacaoWorkbook,
  generateAtualizaStatusWorkbook,
  generateDuoDesktopWorkbook,
  downloadBlob,
  createPythonProjectZip
} from './utils/excelEngine';
import { PYTHON_BUNDLE_FILES } from './utils/pythonBundle';
import { CheckCircle2, Download } from 'lucide-react';

export default function App() {
  const [currentForm, setCurrentForm] = useState<SGT3FormType>('CRIACAO_IDENTIDADE');
  const [activeTab, setActiveTab] = useState<'app' | 'code' | 'docs'>('app');
  const [rawInput, setRawInput] = useState<string>(SAMPLE_INPUTS.CRIACAO_IDENTIDADE.valid);
  const [records, setRecords] = useState<any[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Executa processamento inicial com o exemplo padrão
  useEffect(() => {
    runProcessing(currentForm, rawInput);
  }, []);

  const runProcessing = (formType: SGT3FormType, input: string) => {
    setIsProcessing(true);
    let parsed: any[] = [];
    if (formType === 'CRIACAO_IDENTIDADE') {
      parsed = parseCriacaoIdentidade(input);
    } else if (formType === 'REVOGACAO') {
      parsed = parseRevogacao(input);
    } else if (formType === 'ATUALIZA_STATUS') {
      parsed = parseAtualizaStatus(input);
    } else if (formType === 'DUO_DESKTOP') {
      parsed = parseDuoDesktop(input);
    }
    setRecords(parsed);
    setIsProcessing(false);
  };

  const handleSelectForm = (newForm: SGT3FormType) => {
    setCurrentForm(newForm);
    const newSample = SAMPLE_INPUTS[newForm].valid;
    setRawInput(newSample);
    runProcessing(newForm, newSample);
  };

  const handleProcess = () => {
    runProcessing(currentForm, rawInput);
  };

  const handleTemplateUpload = (file: File | null) => {
    setTemplateFile(file);
    if (!file) {
      setTemplateBuffer(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        setTemplateBuffer(e.target.result);
        showToast(`Template '${file.name}' carregado e pronto para mesclagem!`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadExcel = async () => {
    if (records.length === 0) return;
    setIsDownloading(true);
    const config = FORM_CONFIGS[currentForm];

    try {
      let blob: Blob;
      if (currentForm === 'CRIACAO_IDENTIDADE') {
        blob = await generateCriacaoIdentidadeWorkbook(records, templateBuffer);
      } else if (currentForm === 'REVOGACAO') {
        blob = await generateRevogacaoWorkbook(records, templateBuffer);
      } else if (currentForm === 'ATUALIZA_STATUS') {
        blob = await generateAtualizaStatusWorkbook(records, templateBuffer);
      } else {
        blob = await generateDuoDesktopWorkbook(records, templateBuffer);
      }

      downloadBlob(blob, config.filename);
      showToast(`Planilha oficial '${config.filename}' gerada com sucesso!`);
    } catch (err: any) {
      console.error(err);
      showToast(`Erro na geração: ${err.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPythonZip = async () => {
    try {
      const zipBlob = await createPythonProjectZip(PYTHON_BUNDLE_FILES);
      downloadBlob(zipBlob, 'sgt3_automacao_python.zip');
      showToast('Pacote Python completo baixado (sgt3_automacao_python.zip)!');
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao compactar arquivos Python.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-800 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/80 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Bar */}
      <Header
        currentForm={currentForm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          currentForm={currentForm}
          onSelectForm={handleSelectForm}
          templateFile={templateFile}
          onTemplateUpload={handleTemplateUpload}
          onDownloadPythonZip={handleDownloadPythonZip}
        />

        {/* Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'app' && (
            <>
              {/* 1. Input Section */}
              <RawInputSection
                currentForm={currentForm}
                rawInput={rawInput}
                setRawInput={setRawInput}
                onProcess={handleProcess}
                isProcessing={isProcessing}
              />

              {/* 2. Inconsistencies Panel */}
              <ValidationAlerts records={records} />

              {/* 3. Extracted Data Table */}
              <DataTable
                currentForm={currentForm}
                records={records}
                onDownloadExcel={handleDownloadExcel}
                isDownloading={isDownloading}
              />
            </>
          )}

          {activeTab === 'code' && (
            <PythonCodeViewer
              files={PYTHON_BUNDLE_FILES}
              onDownloadZip={handleDownloadPythonZip}
            />
          )}

          {activeTab === 'docs' && (
            <OperationalGuide />
          )}
        </main>
      </div>
    </div>
  );
}
