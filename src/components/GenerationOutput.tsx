/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { GenerationResult, DraftItem, EvaluationScore } from '../types';
import { Copy, Check, Edit2, CheckCircle2, ShieldAlert, Award, AlignLeft, Calendar, Lightbulb, Users, ListFilter, AlertTriangle, FileSpreadsheet, Share } from 'lucide-react';

interface GenerationOutputProps {
  result: GenerationResult;
  onUpdateDraft: (id: string, newContent: string) => void;
}

export const GenerationOutput: React.FC<GenerationOutputProps> = ({ result, onUpdateDraft }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'playbook' | 'factcheck'>('content');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [editStates, setEditStates] = useState<Record<string, boolean>>({});
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [globalCopied, setGlobalCopied] = useState(false);

  const handleCopySingle = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleCopyAll = async () => {
    const fullText = result.drafts.map((d, index) => {
      return result.drafts.length > 1 ? `[${index + 1}/${result.drafts.length}]\n${d.content}` : d.content;
    }).join('\n\n---\n\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setGlobalCopied(true);
      setTimeout(() => setGlobalCopied(false), 2000);
    } catch (e) {
      console.error("Copy all failed", e);
    }
  };

  const toggleEditMode = (id: string, currentVal: string) => {
    if (editStates[id]) {
      // Save changes
      onUpdateDraft(id, editedTexts[id] ?? currentVal);
      setEditStates(prev => ({ ...prev, [id]: false }));
    } else {
      // Enter edit mode
      setEditedTexts(prev => ({ ...prev, [id]: currentVal }));
      setEditStates(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleTextChange = (id: string, val: string) => {
    setEditedTexts(prev => ({ ...prev, [id]: val }));
  };

  // Score badge background coloring
  const getScoreColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400', progress: 'stroke-emerald-400', text: 'text-emerald-400' };
    if (score >= 75) return { bg: 'bg-purple-950/40 border-purple-900/60 text-purple-400', progress: 'stroke-purple-400', text: 'text-purple-400' };
    return { bg: 'bg-orange-950/40 border-orange-900/60 text-orange-400', progress: 'stroke-orange-400', text: 'text-orange-400' };
  };

  return (
    <div className="space-y-6" id="output-root">
      {/* Content Quality Index Indicators Scorecard */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5" id="scorecard-container">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider font-sans">
              Algorithmic Quality Audit Scorecard
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Anti-AI-Slop Pipeline Verified</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="metric-grid">
          {result.evaluation.map((metric) => {
            const styles = getScoreColor(metric.score);
            const radius = 24;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (metric.score / 100) * circumference;

            return (
              <div
                key={metric.metric}
                id={`metric-card-${metric.metric.replace(/\s+/g, '-').toLowerCase()}`}
                className={`border rounded-lg p-3 flex flex-col justify-between hover:bg-zinc-950 transition ${styles.bg}`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                    {metric.metric}
                  </span>
                  
                  {/* Circular Radial Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        className="stroke-zinc-800 fill-none"
                        strokeWidth="3"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        className={`fill-none transition-all duration-1000 ${styles.progress}`}
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-xs font-bold font-mono text-zinc-100">
                      {metric.score}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 leading-snug mt-2 pt-2 border-t border-zinc-800/50">
                  {metric.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800" id="tabs-navigation">
        <button
          id="tab-content-btn"
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg font-mono tracking-wider transition ${
            activeTab === 'content'
              ? 'bg-zinc-800 text-purple-400 border border-purple-900/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <AlignLeft className="w-4 h-4" />
          Content Draft
        </button>
        <button
          id="tab-factcheck-btn"
          type="button"
          onClick={() => setActiveTab('factcheck')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg font-mono tracking-wider transition ${
            activeTab === 'factcheck'
              ? 'bg-zinc-800 text-amber-400 border border-amber-900/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Intellectual Rigor & Facts
        </button>
        <button
          id="tab-playbook-btn"
          type="button"
          onClick={() => setActiveTab('playbook')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg font-mono tracking-wider transition ${
            activeTab === 'playbook'
              ? 'bg-zinc-800 text-cyan-400 border border-cyan-900/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Share className="w-4 h-4" />
          Distribution Playbook
        </button>
      </div>

      {/* TAB 1: Real-time Content Draft & Editor */}
      {activeTab === 'content' && (
        <div className="space-y-4" id="target-content-list">
          <div className="flex justify-between items-center bg-zinc-950 p-1" id="global-action-row">
            <span className="text-[10px] text-zinc-500 font-mono">
              PRO OUTPUT: {result.drafts.length} SECTIONS
            </span>
            <button
              id="copy-all-draft-btn"
              type="button"
              onClick={handleCopyAll}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition font-mono hover:text-white"
            >
              {globalCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied Entire Thread!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Full Thread
                </>
              )}
            </button>
          </div>

          <div className="space-y-4" id="tweet-items-stack">
            {result.drafts.map((draft, idx) => {
              const textToAnalyze = editStates[draft.id] ? (editedTexts[draft.id] ?? draft.content) : draft.content;
              const charCount = textToAnalyze.length;
              const isOverLimit = charCount > 280;

              return (
                <div
                  key={draft.id}
                  id={`draft-block-${draft.id}`}
                  className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden hover:border-zinc-800 transition relative"
                >
                  {/* Custom Header for Single Tweet preview */}
                  <div className="flex justify-between items-center bg-zinc-900/50 px-4 py-3 border-b border-zinc-900" id={`draft-block-header-${draft.id}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                        X
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-200 block">
                          {draft.heading || `Tweet ${idx + 1}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      {/* Character indicator limits */}
                      <span className={`px-2 py-0.5 rounded font-bold ${isOverLimit ? 'bg-red-950/60 text-red-400 border border-red-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                        {charCount} / 280 chars
                      </span>

                      {/* Tool Controls */}
                      <button
                        id={`edit-draft-btn-${draft.id}`}
                        type="button"
                        onClick={() => toggleEditMode(draft.id, draft.content)}
                        className={`p-1.5 rounded transition ${
                          editStates[draft.id]
                            ? 'bg-purple-950 text-purple-300 border border-purple-900/40'
                            : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title={editStates[draft.id] ? "Save Edits" : "Edit Draft"}
                      >
                        {editStates[draft.id] ? (
                          <span className="text-[10px] font-bold px-1 uppercase">Save</span>
                        ) : (
                          <Edit2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        id={`copy-single-draft-btn-${draft.id}`}
                        type="button"
                        onClick={() => handleCopySingle(draft.id, textToAnalyze)}
                        className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition"
                        title="Copy Tweet"
                      >
                        {copiedStates[draft.id] ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body area */}
                  <div className="p-4 bg-zinc-950" id={`draft-block-body-${draft.id}`}>
                    {editStates[draft.id] ? (
                      <textarea
                        id={`draft-textarea-${draft.id}`}
                        className="w-full bg-zinc-900 border border-purple-900/30 rounded-lg p-3 text-sm text-zinc-100 font-sans focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                        rows={4}
                        value={editedTexts[draft.id] ?? ''}
                        onChange={(e) => handleTextChange(draft.id, e.target.value)}
                      />
                    ) : (
                      <p className="text-zinc-200 text-sm font-sans leading-relaxed whitespace-pre-wrap select-text selection:bg-purple-900">
                        {draft.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {result.generalFeedback && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2 mt-4" id="editor-feedback-card">
              <span className="text-[10px] uppercase tracking-wider text-purple-400 font-mono font-bold block">
                Stylist & Anti-Slop Changes Notes
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {result.generalFeedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Intellectual Rigor & Fact Checker Reports */}
      {activeTab === 'factcheck' && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4" id="factcheck-tab-content">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-sm font-bold text-zinc-200 font-sans">
                Veritas Fact-Check Intelligence Feed
              </h4>
              <p className="text-[10px] text-zinc-500">Scanning claims, formulas, and metric citations against academic groundings</p>
            </div>
          </div>

          <div className="space-y-4" id="factchecker-claims-report">
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-300">Rigorous Reference Control Mode</p>
                <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                  The factchecker agent verifies every claim, operating temperature, formula threshold, and company statistic against the fetched background academic articles to isolate potential model hallucinations.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-500 uppercase block">
                Detailed Veritas Verification Audit Report:
              </span>
              <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-4">
                <pre className="text-[11.5px] whitespace-pre-wrap leading-relaxed font-mono text-zinc-300">
                  {result.factCheckerReport}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Advanced Distribution Playbook */}
      {activeTab === 'playbook' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="playbook-tab-content">
          {/* Column A: Hook Multipliers */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Lightbulb className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Viral Hook Split Alternatives
              </h4>
            </div>

            <ul className="space-y-3">
              {result.distributionStrategy.hookIdeas.map((idea, idx) => (
                <li key={idx} className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex gap-2" id={`hook-idea-${idx}`}>
                  <span className="font-mono text-purple-400 text-xs shrink-0 font-bold">ALT 0{idx + 1}:</span>
                  <p className="text-zinc-300 text-xs leading-relaxed font-sans font-medium select-all">
                    {idea}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Column B: Tactical Deployment Timing & Outbounds */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Launch Windows & Channels
              </h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono block">Optimal Algorithmic Times</span>
                <div className="flex flex-wrap gap-2">
                  {result.distributionStrategy.suggestedTimes.map((time, idx) => (
                    <span key={idx} className="bg-cyan-950/40 border border-cyan-900/50 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded">
                      ⏰ {time}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono block">Outbound Propagation Areas</span>
                <ul className="space-y-2 text-xs text-zinc-400 list-disc list-inside">
                  {result.distributionStrategy.outboundIdeas.map((idea, idx) => (
                    <li key={idx} className="leading-relaxed font-sans">{idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Seed Replies */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4 md:col-span-2">
            <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <Users className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Conversation Seed Repliers
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.distributionStrategy.replyTemplates.map((reply, idx) => (
                <div key={idx} className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-1.5" id={`reply-template-${idx}`}>
                  <span className="text-[9px] uppercase text-zinc-500 font-semibold font-mono">
                    Thread-Stopper/Followup 0{idx + 1}
                  </span>
                  <p className="text-zinc-300 text-xs font-sans leading-relaxed select-all">
                    {reply}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
