import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Sliders, Code, Globe, Sparkles, Download, Monitor, Smartphone, Puzzle, ExternalLink, CheckCircle, HelpCircle, X } from 'lucide-react';
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

interface DeviceInfo {
  isDesktop: boolean;
  isMobile: boolean;
  isChrome: boolean;
  deviceName: string;
  osName: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('popup');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isDesktop: true,
    isMobile: false,
    isChrome: true,
    deviceName: 'Desktop PC',
    osName: 'Computer'
  });

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

  // Scan Device Type
  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isDesktop = !isMobile;
    const isChrome = /Chrome|Chromium|Edg|Brave/i.test(ua);

    let osName = 'Computer';
    if (ua.includes('Win')) osName = 'Windows';
    else if (ua.includes('Mac')) osName = 'macOS';
    else if (ua.includes('Linux')) osName = 'Linux';
    else if (ua.includes('Android')) osName = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';

    let deviceName = `${osName} Desktop`;
    if (isMobile) {
      deviceName = `${osName} Mobile`;
    }

    setDeviceInfo({
      isDesktop,
      isMobile,
      isChrome,
      deviceName,
      osName
    });
  }, []);

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

  const handleAddExtension = () => {
    // Direct link to download ZIP package
    const link = document.createElement('a');
    link.href = './shieldblock-extension.zip';
    link.download = 'shieldblock-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show setup modal
    setShowExtensionModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Extension Installation Guide Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                  <Puzzle className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Add ShieldBlock to Chrome</h3>
                  <p className="text-xs text-slate-400">Downloaded <code className="text-indigo-300">shieldblock-extension.zip</code></p>
                </div>
              </div>
              <button
                onClick={() => setShowExtensionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Follow 3 quick steps to enable extension:</p>
              
              <div className="flex items-start space-x-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <strong className="text-white block">Unzip Downloaded Folder</strong>
                  Extract <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-300">shieldblock-extension.zip</code> on your computer.
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <strong className="text-white block">Open Extensions Page</strong>
                  Navigate to <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">chrome://extensions</code> in Chrome / Edge / Brave.
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <strong className="text-white block">Load Unpacked Extension</strong>
                  Enable <span className="text-emerald-400 font-bold">Developer Mode</span> (top right toggle) and click <span className="text-blue-400 font-bold">Load unpacked</span> to pick the extracted folder.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-blue-500/20"
              >
                Got It! Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Install ShieldBlock Web App for offline access!</span>
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

      {/* Device Scan Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs">
          {deviceInfo.isDesktop ? (
            <Monitor className="w-4 h-4 text-blue-400" />
          ) : (
            <Smartphone className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-slate-400">Device Detected:</span>
          <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {deviceInfo.deviceName} ({deviceInfo.osName})
          </span>
        </div>

        <div>
          {deviceInfo.isDesktop ? (
            <button
              onClick={handleAddExtension}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
            >
              <Puzzle className="w-4 h-4 text-amber-300" />
              <span>Add to Chrome Extensions</span>
            </button>
          ) : (
            <a
              href="./shieldblock-app.apk"
              download="shieldblock-app.apk"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Download Android App (.apk)</span>
            </a>
          )}
        </div>
      </div>

      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-lg">
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
            {deviceInfo.isDesktop && (
              <button
                onClick={handleAddExtension}
                className="hidden md:flex items-center space-x-1.5 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Add Extension</span>
              </button>
            )}
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

