import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Sliders, Code, Globe, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header / Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">ShieldBlock</h1>
              <p className="text-xs text-slate-500 font-medium">Ad & Tracker Blocker • Extension Dashboard</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('popup')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'popup' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📱</span>
              <span>Extension Popup</span>
            </button>
            <button
              onClick={() => setActiveTab('options')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'options' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⚙️</span>
              <span>Dashboard & Options</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'simulator' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🛡️</span>
              <span>Rules & Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'code' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💻</span>
              <span>Extension Files</span>
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto bg-slate-100 p-2 gap-1 border-t border-slate-200">
          <button
            onClick={() => setActiveTab('popup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'popup' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Extension Popup
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'options' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Options
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'simulator' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Rules & Simulator
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'code' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Extension Files
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'popup' && (
          <div className="space-y-4">
            <div className="text-center max-w-lg mx-auto mb-2">
              <h2 className="text-xl font-extrabold text-slate-900">Chrome Extension Popup Preview</h2>
              <p className="text-xs text-slate-500 mt-1">This is the interactive popup interface users see when clicking the ShieldBlock toolbar icon in Chrome.</p>
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <p>ShieldBlock - High-performance ad blocker & tracker shield. Built by <strong>Corey Kiesel</strong>.</p>
      </footer>
    </div>
  );
}
