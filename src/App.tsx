import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Sliders, Code, Globe, Sparkles, Download } from 'lucide-react';
import { TabType, ExtensionSettings } from './types';
import { PopupPreview } from './components/PopupPreview';
import { OptionsDashboard } from './components/OptionsDashboard';
import { RuleExplorer } from './components/RuleExplorer';
import { CodeInspector } from './components/CodeInspector';

const DEFAULT_SETTINGS: ExtensionSettings = {
  globalEnabled: true,
  rulesets: {
    ads_rules: true,
    privacy_rules: true,
    annoyances_rules: true,
  },
  whitelist: ['example.com'],
  customBlocklist: ['annoying-tracker.com', 'popup-adnetwork.net'],
  stats: {
    totalBlocked: 1428,
    siteBlocked: {
      'example.com': 42,
      'news-site.org': 315,
      'stream-videos.io': 890,
      'social-feed.net': 181,
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('popup');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const [settings, setSettings] = useState<ExtensionSettings>(() => {
    const saved = localStorage.getItem('shieldblock_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('shieldblock_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Install ShieldBlock App for offline access!</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-indigo-700 hover:bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 inline mr-1" />
              Install App
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-white/80 hover:text-white px-2 py-1 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-tight">ShieldBlock</h1>
              <p className="text-[11px] text-blue-400 font-semibold">Ad & Tracker Shield • Corey Kiesel</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 mr-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Shield Active
            </span>
          </div>
        </div>

        {/* Mobile & Desktop Navigation Pills */}
        <div className="bg-slate-900 border-t border-slate-800/80 px-4 py-2 flex items-center justify-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('popup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'popup'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📱 Extension Popup
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'options'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            ⚙️ Dashboard & Options
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🛡️ Rules & Engine
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            💻 Extension Files
          </button>
        </div>
      </header>

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'popup' && (
          <div className="space-y-4">
            <div className="text-center max-w-lg mx-auto mb-2">
              <h2 className="text-xl font-extrabold text-white">Extension Popup Preview</h2>
              <p className="text-xs text-slate-400 mt-1">Manage blocking stats, pause rules, and preferences directly.</p>
            </div>
            <PopupPreview settings={settings} setSettings={setSettings} onOpenOptions={() => setActiveTab('options')} />
          </div>
        )}

        {activeTab === 'options' && (
          <OptionsDashboard settings={settings} setSettings={setSettings} />
        )}

        {activeTab === 'simulator' && (
          <RuleExplorer />
        )}

        {activeTab === 'code' && (
          <CodeInspector />
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <p>ShieldBlock v1.0.0 — Designed & Built by <strong>Corey Kiesel</strong></p>
      </footer>
    </div>
  );
}
