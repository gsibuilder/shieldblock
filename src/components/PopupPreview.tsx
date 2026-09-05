import React, { useState } from 'react';
import { Shield, ShieldAlert, Pause, Play, Plus, RefreshCw, Settings, CheckCircle2 } from 'lucide-react';
import { ExtensionSettings } from '../types';

interface PopupPreviewProps {
  settings: ExtensionSettings;
  setSettings: React.Dispatch<React.SetStateAction<ExtensionSettings>>;
  onOpenOptions: () => void;
}

export const PopupPreview: React.FC<PopupPreviewProps> = ({ settings, setSettings, onOpenOptions }) => {
  const [currentDomain, setCurrentDomain] = useState('example.com');
  const [quickDomain, setQuickDomain] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isReloaded, setIsReloaded] = useState(false);

  const isWhitelisted = settings.whitelist.includes(currentDomain);
  const siteBlockedCount = settings.stats.siteBlocked[currentDomain] || 14;

  const handleToggleGlobal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSettings(prev => ({ ...prev, globalEnabled: val }));
  };

  const handleToggleWhitelist = () => {
    setSettings(prev => {
      const newWhitelist = isWhitelisted
        ? prev.whitelist.filter(d => d !== currentDomain)
        : [...prev.whitelist, currentDomain];
      return { ...prev, whitelist: newWhitelist };
    });
  };

  const handleQuickBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDomain.trim()) return;
    const domain = quickDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (settings.customBlocklist.includes(domain)) {
      setFeedback('Domain already blocked.');
      return;
    }
    setSettings(prev => ({
      ...prev,
      customBlocklist: [...prev.customBlocklist, domain]
    }));
    setQuickDomain('');
    setFeedback(`Successfully blocked ${domain}`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleReload = () => {
    setIsReloaded(true);
    setTimeout(() => setIsReloaded(false), 1500);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
      {/* Extension Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">ShieldBlock</h2>
            <span className="text-xs text-indigo-300 font-medium">v1.0.0 • Extension Popup</span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.globalEnabled}
            onChange={handleToggleGlobal}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      <div className="p-5 space-y-4 bg-slate-50">
        {/* Current Site Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Site</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <select
                value={currentDomain}
                onChange={(e) => setCurrentDomain(e.target.value)}
                className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded text-sm border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="example.com">example.com</option>
                <option value="news-site.org">news-site.org</option>
                <option value="stream-videos.io">stream-videos.io</option>
                <option value="social-feed.net">social-feed.net</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleToggleWhitelist}
            className={`px-3 py-2 rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-all ${
              isWhitelisted
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isWhitelisted ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isWhitelisted ? 'Resumed' : 'Pause'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-2xl font-black text-indigo-600">{siteBlockedCount}</span>
            <span className="block text-xs text-slate-500 font-medium mt-1">Blocked on Site</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-2xl font-black text-emerald-600">{settings.stats.totalBlocked}</span>
            <span className="block text-xs text-slate-500 font-medium mt-1">Total Shielded</span>
          </div>
        </div>

        {/* Quick Block Form */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Quick Block Domain</label>
          <form onSubmit={handleQuickBlock} className="flex space-x-2">
            <input
              type="text"
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder="e.g. tracker.com"
              className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Block</span>
            </button>
          </form>
          {feedback && <p className="text-xs text-emerald-600 font-medium flex items-center space-x-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5"/><span>{feedback}</span></p>}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
          <button
            onClick={onOpenOptions}
            className="flex items-center space-x-1 hover:text-indigo-600 font-semibold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Options & Dashboard</span>
          </button>
          <button
            onClick={handleReload}
            className="flex items-center space-x-1 hover:text-indigo-600 font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloaded ? 'animate-spin' : ''}`} />
            <span>{isReloaded ? 'Reloaded!' : 'Refresh Tab'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
