import React, { useState } from 'react';
import { Shield, Pause, Play, Plus, RefreshCw, Settings, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-md mx-auto bg-slate-900/90 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-4">
      {/* Extension Header */}
      <div className="bg-slate-950 p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white leading-tight">ShieldBlock</h2>
            <span className="text-xs text-blue-400 font-semibold">v1.0.0 • Popup</span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.globalEnabled}
            onChange={handleToggleGlobal}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="p-5 space-y-4 bg-slate-900/50">
        {/* Current Site Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Site</span>
            <div className="flex items-center space-x-2 mt-1">
              <select
                value={currentDomain}
                onChange={(e) => setCurrentDomain(e.target.value)}
                className="font-bold text-blue-400 bg-slate-900 px-3 py-1.5 rounded-lg text-sm border border-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
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
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-all ${
              isWhitelisted
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isWhitelisted ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isWhitelisted ? 'Resumed' : 'Pause'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-2xl font-black text-blue-400">{siteBlockedCount}</span>
            <span className="block text-xs text-slate-400 font-medium mt-1">Blocked on Site</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-2xl font-black text-emerald-400">{settings.stats.totalBlocked}</span>
            <span className="block text-xs text-slate-400 font-medium mt-1">Total Shielded</span>
          </div>
        </div>

        {/* Quick Block Form */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Quick Block Domain</label>
          <form onSubmit={handleQuickBlock} className="flex space-x-2">
            <input
              type="text"
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder="e.g. tracker.com"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Block</span>
            </button>
          </form>
          {feedback && <p className="text-xs text-emerald-400 font-medium flex items-center space-x-1 mt-1"><CheckCircle2 className="w-3.5 h-3.5"/><span>{feedback}</span></p>}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
          <button
            onClick={onOpenOptions}
            className="flex items-center space-x-1.5 hover:text-blue-400 font-semibold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Options & Dashboard</span>
          </button>
          <button
            onClick={handleReload}
            className="flex items-center space-x-1.5 hover:text-blue-400 font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloaded ? 'animate-spin' : ''}`} />
            <span>{isReloaded ? 'Reloaded!' : 'Refresh Tab'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
