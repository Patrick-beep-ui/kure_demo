"use client"

import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { clinicApi } from "@/lib/api-service"

export default function DSLIDE() {
  const [files, setFiles] = useState([
    { name: "rules.txt", content: 'cuando consulta es por "dolor de cabeza"\n', active: true },
    { name: "kure_rules.tx", content: "// grammar stored on the server", active: false }
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [astUrl, setAstUrl] = useState<string | null>(null);
  const [astJson, setAstJson] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // focus editor on mount
  }, []);

  function log(line: string) {
    setConsoleLines(prev => [...prev, line]);
  }

  function handleEditorMount(editor: any) {
    editorRef.current = editor;
  }

  function updateActiveFileContent(value: string) {
    setFiles(prev => prev.map((f, i) => i === activeIndex ? { ...f, content: value } : f));
  }

  async function validateRule() {
    setIsLoading(true);
    log("Validating rule...");
    const content = files[activeIndex].content;
  
    try {
      const res = await clinicApi.validateRule(content);
      console.log('Validation response:', res);
  
      if (!res.ok) {
        // Check for the specific "Medication not found" error
        if (res.error === "Medication not found in database" || res.meta?.error === "Medication not found in database") {
          const missing = res.missing || res.meta?.missing || [];
          log(`Validation failed: ${res.error || res.meta?.error}. Missing: ${missing.join(', ')}`);
        } else {
          log(`Validation failed: ${res.error || res.meta?.error || JSON.stringify(res)}`);
        }
        setIsLoading(false);
        return;
      }
  
      log('Validation succeeded');
      setAstJson(res || null);
  
      // fetch AST image (optional)
      try {
        const blob = await clinicApi.getASTImage();
        const url = URL.createObjectURL(blob);
        setAstUrl(url);
        log("AST image retrieved");
      } catch (e) {
        log("No AST image available");
      }
      
    } catch (err: any) {
      log('Network error validating rule: ' + err.message);
    }
    setIsLoading(false);
  }

  async function saveRule() {
    log('Saving rule to server...');
    const content = files[activeIndex].content;
  
    try {
      const res = await clinicApi.saveRule(content);
      console.log('Save response:', res);
  
      if (!res.ok) {
        // Check for missing medications specifically
        if (res.error === "Medication not found in database" || res.meta?.error === "Medication not found in database") {
          const missing = res.missing || res.meta?.missing || [];
          log(`Save failed: ${res.error || res.meta?.error}. Missing: ${missing.join(', ')}`);
        } else {
          log(`Save failed: ${res.error || res.meta?.error || JSON.stringify(res)}`);
        }
        return;
      }
  
      log('Rule validated and saved successfully');
      setAstJson(res.ast || null);
  
      // fetch AST image
      try {
        const blob = await clinicApi.getASTImage();
        const url = URL.createObjectURL(blob);
        setAstUrl(url);
        log("AST image retrieved");
      } catch (e) {
        log("No AST image available");
      }
  
    } catch (err: any) {
      log('Network error saving rule: ' + err.message);
    }
  }
  

  function newFile() {
    const name = `rule_${files.length + 1}.txt`;
    const f = { name, content: '', active: false };
    setFiles(prev => [...prev, f]);
    setActiveIndex(files.length);
  }

  function downloadCurrent() {
    const f = files[activeIndex];
    const blob = new Blob([f.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Left: File explorer */}
      <aside className="w-56 bg-white border-r p-3 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Files</h3>
          <button onClick={newFile} className="text-sm px-2 py-1 bg-blue-600 text-white rounded">New</button>
        </div>
        <div className="flex-1 overflow-auto">
          {files.map((f, i) => (
            <div key={f.name}
                 onClick={() => setActiveIndex(i)}
                 className={`p-2 rounded cursor-pointer mb-1 ${i === activeIndex ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
              <div className="text-sm font-medium">{f.name}</div>
              <div className="text-xs text-slate-500 truncate">{f.content.split('\n')[0]}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button onClick={downloadCurrent} className="w-full px-3 py-2 bg-emerald-600 text-white rounded">Download</button>
        </div>
      </aside>

      {/* Center: Editor */}
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">KURE DSL IDE</div>
            <div className="text-sm text-slate-500">Active: {files[activeIndex].name}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={validateRule} className="px-3 py-1 bg-blue-600 text-white rounded" disabled={isLoading}>Validate</button>
            <button onClick={saveRule} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
            <button onClick={() => setConsoleLines([])} className="px-3 py-1 bg-slate-200 rounded">Clear Console</button>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              value={files[activeIndex].content}
              onMount={(editor) => handleEditorMount(editor)}
              onChange={(val) => updateActiveFileContent(val || '')}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>

          {/* Right: AST Preview + JSON */}
          <aside className="w-96 p-3 bg-white border-l flex flex-col">
            <h4 className="font-semibold mb-2">AST Preview</h4>
            <div className="flex-1 overflow-auto">
              {astUrl ? (
                <img src={astUrl} alt="AST" className="w-full rounded border" />
              ) : (
                <div className="text-sm text-slate-500">AST image will appear here after validation.</div>
              )}

              <div className="mt-4">
                <h5 className="font-medium">AST JSON</h5>
                <pre className="text-xs bg-slate-100 p-2 rounded max-h-64 overflow-auto">{astJson ? JSON.stringify(astJson, null, 2) : 'No AST JSON'}</pre>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a className="flex-1 text-center px-3 py-2 bg-slate-200 rounded" href="#" onClick={(e) => { e.preventDefault(); if (astUrl) window.open(astUrl, '_blank'); }}>Open AST</a>
              <a className="flex-1 text-center px-3 py-2 bg-slate-200 rounded" href="#" onClick={(e) => { e.preventDefault(); if (astJson) { const blob = new Blob([JSON.stringify(astJson, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ast.json'; a.click(); URL.revokeObjectURL(url);} }}>Download JSON</a>
            </div>
          </aside>
        </div>

        {/* Bottom console */}
        <div className="h-40 border-t bg-white p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">Console</div>
            <div className="text-xs text-slate-500">{consoleLines.length} entries</div>
          </div>
          <div className="h-full overflow-auto bg-slate-50 p-2 rounded">
            {consoleLines.map((c, i) => (
              <div key={i} className="text-xs font-mono text-slate-700">{c}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
