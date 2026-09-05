import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, XCircle, Filter, BookOpen } from 'lucide-react';
import { RuleItem } from '../types';

export const RuleExplorer: React.FC = () => {
  const [rulesetType, setRulesetType] = useState<'ads_rules' | 'privacy_rules' | 'annoyances_rules'>('ads_rules');
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // URL Simulator state
  const [testUrl, setTestUrl] = useState('https://doubleclick.net/ad/banner.js');
  const [simulationResult, setSimulationResult] = useState<{ blocked: boolean; matchedRule?: RuleItem } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rules/${rulesetType}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRules(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rulesetType]);

  const handleTestUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    // Test against loaded rules
    const matched = rules.find(rule => {
      if (!rule.condition?.urlFilter) return false;
      const filter = rule.condition.urlFilter.replace(/^\|\|/, '').replace(/\^$/, '');
      return testUrl.includes(filter);
    });

    setSimulationResult({
      blocked: !!matched,
      matchedRule: matched
    });
  };

  const filteredRules = rules.filter(r => 
    r.condition?.urlFilter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toString().includes(searchQuery)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 my-6">
      {/* Simulator Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
          <h2 className="text-lg font-bold">Live URL Blocking Simulator</h2>
        </div>
        <p className="text-sm text-indigo-200 mb-4">Test any URL against ShieldBlock's active DeclarativeNetRequest ruleset to verify blocking behavior.</p>

        <form onSubmit={handleTestUrl} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter URL to test (e.g. https://doubleclick.net/script.js)"
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-md"
          >
            Test URL
          </button>
        </form>

        {simulationResult && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center space-x-3 ${
            simulationResult.blocked 
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200' 
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}>
            {simulationResult.blocked ? (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {simulationResult.blocked ? 'REQUEST BLOCKED BY SHIELDBLOCK' : 'REQUEST ALLOWED (NO MATCH)'}
              </p>
              {simulationResult.matchedRule && (
                <p className="text-xs text-slate-300 mt-0.5">
                  Matched Rule ID #{simulationResult.matchedRule.id} with filter <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">{simulationResult.matchedRule.condition.urlFilter}</code>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rules Explorer Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">DeclarativeNetRequest Rules Explorer</h2>
            <p className="text-sm text-slate-500 mt-0.5">Inspect active rule definitions for ads, trackers, and annoyances.</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRulesetType('ads_rules')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                rulesetType === 'ads_rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ads Rules
            </button>
            <button
              onClick={() => setRulesetType('privacy_rules')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                rulesetType === 'privacy_rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privacy Rules
            </button>
            <button
              onClick={() => setRulesetType('annoyances_rules')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                rulesetType === 'annoyances_rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annoyances
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rule filters or rule IDs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Rules Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center py-12 text-slate-400 text-sm">Loading rules...</p>
            ) : filteredRules.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No rules found matching search.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">URL Filter</th>
                    <th className="p-3.5">Resource Types</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-semibold text-slate-700">#{rule.id}</td>
                      <td className="p-3.5">
                        <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                          {rule.action.type}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-xs text-indigo-600">{rule.condition.urlFilter}</td>
                      <td className="p-3.5 text-xs text-slate-500">
                        {rule.condition.resourceTypes?.join(', ') || 'All'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
