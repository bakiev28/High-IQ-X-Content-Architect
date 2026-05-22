/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AgentConfig, AgentId } from '../types';
import { ShieldCheck, Search, Database, PenTool, ClipboardCheck, Edit3, Share2, Sparkles, AlertCircle } from 'lucide-react';

interface AgentSelectorsProps {
  agents: AgentConfig[];
  toggleAgent: (id: AgentId) => void;
  topic: string;
  setTopic: (val: string) => void;
  sourceUrl: string;
  setSourceUrl: (val: string) => void;
  format: 'tweet' | 'thread' | 'essay';
  setFormat: (val: 'tweet' | 'thread' | 'essay') => void;
  tone: string;
  setTone: (val: string) => void;
  isGenerating: boolean;
  onRunPipeline: () => void;
  errorMsg: string | null;
  onLoadPreset: (presetId: string) => void;
  presets: any[];
}

const AGENT_ICONS: Record<AgentId, React.ReactNode> = {
  researcher: <Database className="w-4 h-4 text-emerald-400" />,
  searcher: <Search className="w-4 h-4 text-cyan-400" />,
  structurer: <ShieldCheck className="w-4 h-4 text-purple-400" />,
  copywriter: <PenTool className="w-4 h-4 text-pink-400" />,
  factchecker: <ClipboardCheck className="w-4 h-4 text-amber-400" />,
  editor: <Edit3 className="w-4 h-4 text-indigo-400" />,
  distribution: <Share2 className="w-4 h-4 text-sky-400" />
};

export const AgentSelectors: React.FC<AgentSelectorsProps> = ({
  agents,
  toggleAgent,
  topic,
  setTopic,
  sourceUrl,
  setSourceUrl,
  format,
  setFormat,
  tone,
  setTone,
  isGenerating,
  onRunPipeline,
  errorMsg,
  onLoadPreset,
  presets
}) => {
  return (
    <div className="space-y-6" id="agent-selectors-container">
      {/* Target Content Input */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4" id="target-input-card">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-100 font-sans">
            Research Canvas
          </h2>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-zinc-400">
            Core Topic, Hypothesis, or arXiv ID
          </label>
          <textarea
            id="topic-textarea"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans transition"
            rows={3}
            placeholder="e.g. Superconducting qubits wire and thermal bottlenecks, or feed in raw paragraphs from a tech blog... "
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-medium text-zinc-400">
            Reference Document URL / arXiv Link (Optional)
          </label>
          <input
            id="source-url-input"
            type="text"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans transition"
            placeholder="e.g., https://arxiv.org/abs/2412.00000"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        {/* Templates Quick Actions */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Load High-IQ Knowledge Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => onLoadPreset(preset.id)}
                type="button"
                className="bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-700 px-3 py-1.5 rounded-md hover:bg-zinc-900 transition font-mono truncate max-w-full"
                title={preset.topic}
              >
                🔬 Quantum Scaling
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model parameters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4" id="config-parameters-card">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-100 font-sans">
          Formatting & Style Bounds
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-400">X Format</span>
            <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg" id="format-toggle-group">
              <button
                id="format-tweet-btn"
                type="button"
                onClick={() => setFormat('tweet')}
                className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition ${format === 'tweet' ? 'bg-zinc-800 text-purple-400 border border-purple-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Single Tweet
              </button>
              <button
                id="format-thread-btn"
                type="button"
                onClick={() => setFormat('thread')}
                className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition ${format === 'thread' ? 'bg-zinc-800 text-purple-400 border border-purple-900/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Thread
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-400">Tone Profile</span>
            <select
              id="tone-picker"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
            >
              <option value="Analytical, High-IQ, Monospace Accents">Hard Analytical</option>
              <option value="Cynical, Pragmatic Tech-Critic">Cynical Tech Vet</option>
              <option value="Academic, Peer-Review Quality">Rigorous Academic</option>
              <option value="SaaS founder, High Leveraged Ideas">Founder Playbook</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enabled Agents Checklist */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4" id="agents-config-card">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-100 font-sans">
            Deploy Specialist Agents
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">Multi-Agent Chain</span>
        </div>

        <div className="space-y-3" id="agents-checklist">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => !isGenerating && toggleAgent(agent.id)}
              className={`flex items-start gap-3 p-2.5 rounded-lg border text-left cursor-pointer transition select-none ${
                agent.enabled
                  ? 'bg-zinc-950 border-purple-900/40 text-zinc-200 hover:bg-zinc-900'
                  : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800/40 text-zinc-500'
              }`}
              id={`agent-card-${agent.id}`}
            >
              <div className="mt-1 flex-shrink-0" id={`agent-icon-wrapper-${agent.id}`}>
                {AGENT_ICONS[agent.id]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold block ${agent.enabled ? 'text-zinc-200' : 'text-zinc-500'}`}>
                    {agent.name}
                  </span>
                  <span className="text-[8px] tracking-wider uppercase bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 font-mono scale-90 origin-right">
                    {agent.id}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                  {agent.role}
                </p>
              </div>
              <div className="flex items-center justify-center self-center" id={`agent-check-wrapper-${agent.id}`}>
                <div
                  className={`w-3.5 h-3.5 rounded border transition flex items-center justify-center ${
                    agent.enabled
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-zinc-700'
                  }`}
                >
                  {agent.enabled && <span className="text-[8px]">✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Engine Trigger Button */}
      <div className="space-y-3">
        {errorMsg && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 flex gap-2" id="error-box">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-normal font-sans">
              {errorMsg}
            </p>
          </div>
        )}

        <button
          id="run-pipeline-btn"
          type="button"
          onClick={onRunPipeline}
          disabled={isGenerating || !topic.trim()}
          className={`w-full font-mono text-xs uppercase tracking-widest font-semibold py-3.5 rounded-xl border flex items-center justify-center gap-2 transition focus:outline-none ${
            isGenerating
              ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
              : topic.trim()
              ? 'bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 border-purple-700/50 text-white shadow-lg shadow-purple-950/20'
              : 'bg-zinc-950 border-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
              Trace Pipeline Active...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              Compile High-IQ Core
            </>
          )}
        </button>
      </div>
    </div>
  );
};
