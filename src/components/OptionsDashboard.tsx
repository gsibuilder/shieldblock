import React, { useState } from 'react';
import { Shield, Check, X, Plus, Trash2, Download, Upload, RefreshCcw, Database } from 'lucide-react';
import { ExtensionSettings } from '../types';

interface OptionsDashboardProps {
  settings: ExtensionSettings;
  setSettings: React.Dispatch<React.SetStateAction<ExtensionSettings>>;
}

export const OptionsDashboard: React.FC<OptionsDashboardProps> = ({ settings, setSettings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'rules' | 'whitelist' | 'blocklist' | 'stats'>('rules');
  const [newWhitelistInput, setNewWhitelistInput] = useState('');
  const [newBlocklistInput, setNewBlocklistInput] = useState('');
  const [backupFeedback, setBackupFeedback] = useState('');

  const handleRulesetToggle = (ruleset: 'ads_rules' | 'privacy_rules' | 'annoyances_rules') => {
    setSettings(prev => ({
      ...prev,
      rulesets: {
        ...prev.rulesets,
        [ruleset]: !prev.rulesets[ruleset]
      }
    }));
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistInput.trim()) return;
    const domain = newWhitelistInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (settings.whitelist.includes(domain)) return;
    setSettings(prev => ({
      ...prev,
      whitelist: [...prev.whitelist, domain]
    }));
    setNewWhitelistInput('');
  };

  const handleRemoveWhitelist = (domain: string) => {
    setSettings(prev => ({
      ...prev,
      whitelist: prev.whitelist.filter(d => d !== domain)
    }));
  };

  const handleAddBlocklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlocklistInput.trim()) return;
    const domain = newBlocklistInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (settings.customBlocklist.includes(domain)) return;
    setSettings(prev => ({
      ...prev,
      customBlocklist: [...prev.customBlocklist, domain]
    }));
    setNewBlocklistInput('');
  };

  const handleRemoveBlocklist = (domain: string) => {
    setSettings(prev => ({
      ...prev,
      customBlocklist: prev.customBlocklist.filter(d => d !== domain)
    }));
  };

  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all statistics?')) {
      setSettings(prev => ({
        ...prev,
        stats: { totalBlocked: 0, siteBlocked: {} }
      }));
      setBackupFeedback('Statistics reset successfully.');
      setTimeout(() => setBackupFeedback(''), 3000);
    }
  };

  const handleExportSettings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shieldblock_settings_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setBackupFeedback('Settings exported successfully.');
    setTimeout(() => setBackupFeedback(''), 3000);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object' && parsed.rulesets) {
            setSettings(parsed);
            setBackupFeedback('Settings imported successfully!');
          } else {
            setBackupFeedback('Invalid settings file format.');
          }
        } catch {
          setBackupFeedback('Failed to parse JSON file.');
        }
        setTimeout(() => setBackupFeedback(''), 3000);
      };
    }
  };

  const totalSitesTracked = Object.keys(settings.stats.siteBlocked).length || 4;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
      {/* Sidebar Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 h-fit">
        <div className="flex items-center space-x-3 px-3 py-3 mb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">ShieldBlock</h3>
            <span className="text-xs text-slate-400">Dashboard & Options</span>
          </div>
        </div>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2.5 transition-colors ${
            activeSubTab === 'rules' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🛡️</span>
          <span>Filter Lists & Rulesets</span>
        </button>

        <button
          onClick={() => setActiveSubTab('whitelist')}
          className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2.5 transition-colors ${
            activeSubTab === 'whitelist' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>✅</span>
          <span>Allowed Sites (Whitelist)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('blocklist')}
          className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2.5 transition-colors ${
            activeSubTab === 'blocklist' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🚫</span>
          <span>Custom Blocklist</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`w-full text-left px-3 py-2.5 rounded-xl font-medium text-sm flex items-center space-x-2.5 transition-colors ${
            activeSubTab === 'stats' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>📊</span>
          <span>Stats & Backup</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="md:col-span-3 space-y-6">
        {activeSubTab === 'rules' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Filter Lists & Rulesets</h2>
              <p className="text-sm text-slate-500 mt-1">Enable or disable built-in network filtering categories powered by DeclarativeNetRequest.</p>
            </div>

            <div className="space-y-4">
              {/* Ads */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800">General Advertisements</h3>
                  <p className="text-xs text-slate-500">Blocks doubleclick, google ads, adnxs, popups, and standard ad network scripts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.rulesets.ads_rules}
                    onChange={() => handleRulesetToggle('ads_rules')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Privacy */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800">Privacy & Analytics Trackers</h3>
                  <p className="text-xs text-slate-500">Blocks telemetry, google analytics, facebook pixel, hotjar, and tracking beacons.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.rulesets.privacy_rules}
                    onChange={() => handleRulesetToggle('privacy_rules')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Annoyances */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800">Popups & Annoyances</h3>
                  <p className="text-xs text-slate-500">Blocks aggressive popunder windows, redirect ads, and intrusive overlays.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.rulesets.annoyances_rules}
                    onChange={() => handleRulesetToggle('annoyances_rules')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'whitelist' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Allowed Sites (Whitelist)</h2>
              <p className="text-sm text-slate-500 mt-1">Ad blocking is paused on these specific domains.</p>
            </div>

            <form onSubmit={handleAddWhitelist} className="flex space-x-3">
              <input
                type="text"
                value={newWhitelistInput}
                onChange={(e) => setNewWhitelistInput(e.target.value)}
                placeholder="Add domain (e.g. example.com)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Domain</span>
              </button>
            </form>

            <div className="space-y-2">
              {settings.whitelist.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No allowed sites configured yet.</p>
              ) : (
                settings.whitelist.map((domain) => (
                  <div key={domain} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-medium text-slate-800 text-sm">{domain}</span>
                    <button
                      onClick={() => handleRemoveWhitelist(domain)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove domain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'blocklist' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Custom Blocklist</h2>
              <p className="text-sm text-slate-500 mt-1">Add custom domain block rules to prevent requests to specific domains.</p>
            </div>

            <form onSubmit={handleAddBlocklist} className="flex space-x-3">
              <input
                type="text"
                value={newBlocklistInput}
                onChange={(e) => setNewBlocklistInput(e.target.value)}
                placeholder="Add domain to block (e.g. adserver.net)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Block Domain</span>
              </button>
            </form>

            <div className="space-y-2">
              {settings.customBlocklist.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No custom blocked domains added yet.</p>
              ) : (
                settings.customBlocklist.map((domain) => (
                  <div key={domain} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-medium text-slate-800 text-sm">{domain}</span>
                    <button
                      onClick={() => handleRemoveBlocklist(domain)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove domain"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'stats' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Statistics & Configuration Backup</h2>
              <p className="text-sm text-slate-500 mt-1">Manage your telemetry statistics, export configuration, or restore from a backup file.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
                <span className="text-3xl font-black text-indigo-600">{settings.stats.totalBlocked}</span>
                <span className="block text-xs text-slate-500 font-semibold mt-1">Total Requests Blocked</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
                <span className="text-3xl font-black text-emerald-600">{totalSitesTracked}</span>
                <span className="block text-xs text-slate-500 font-semibold mt-1">Tracked Sites</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h3 className="font-semibold text-slate-800">Manage Data & Settings</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleResetStats}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset All Statistics</span>
                </button>
                <button
                  onClick={handleExportSettings}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Settings (JSON)</span>
                </button>
                <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center space-x-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Import Settings (JSON)</span>
                  <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" />
                </label>
              </div>
              {backupFeedback && <p className="text-xs font-semibold text-emerald-600">{backupFeedback}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
