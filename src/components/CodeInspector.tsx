import React, { useState, useEffect } from 'react';
import { Code, FileText, Cpu, Eye } from 'lucide-react';

export const CodeInspector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<'manifest' | 'background' | 'content' | 'cosmetic'>('manifest');
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let filePath = '/manifest.json';
    if (selectedFile === 'background') filePath = '/background/service-worker.js';
    if (selectedFile === 'content') filePath = '/content/content.js';
    if (selectedFile === 'cosmetic') filePath = '/content/cosmetic.css';

    fetch(filePath)
      .then(res => res.text())
      .then(text => {
        setFileContent(text);
        setLoading(false);
      })
      .catch(() => {
        setFileContent('Failed to load file content.');
        setLoading(false);
      });
  }, [selectedFile]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Chrome Extension Code Inspector</h2>
            <p className="text-sm text-slate-500 mt-0.5">Explore the raw source files of the ShieldBlock extension architecture.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setSelectedFile('manifest')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedFile === 'manifest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              manifest.json
            </button>
            <button
              onClick={() => setSelectedFile('background')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedFile === 'background' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              service-worker.js
            </button>
            <button
              onClick={() => setSelectedFile('content')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedFile === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              content.js
            </button>
            <button
              onClick={() => setSelectedFile('cosmetic')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedFile === 'cosmetic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cosmetic.css
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
          {loading ? (
            <p className="text-slate-400">Loading source file...</p>
          ) : (
            <pre className="whitespace-pre-wrap">{fileContent}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
