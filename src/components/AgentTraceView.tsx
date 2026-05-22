/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TraceStep, AgentId } from '../types';
import { Terminal, Lightbulb, CheckCircle, ChevronDown, ChevronRight, Play, Eye } from 'lucide-react';

interface AgentTraceViewProps {
  trace: TraceStep[];
  isGenerating: boolean;
}

export const AgentTraceView: React.FC<AgentTraceViewProps> = ({ trace, isGenerating }) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeStep = trace.find(t => t.id === selectedStepId) || trace[trace.length - 1];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs text-zinc-300" id="trace-view-container">
      {/* Terminal Title Header bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between" id="trace-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-semibold text-zinc-200 tracking-wider text-[11px] uppercase">
            Multi-Agent Cognitive Trace Log
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500/80 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]" id="trace-split-grid">
        {/* Left Column: Trace Step Feed */}
        <div className="lg:col-span-5 border-r border-zinc-900 overflow-y-auto p-4 space-y-3 max-h-[600px]" id="trace-sidebar-feed">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Cognitive Path ({trace.length} steps)
            </span>
            {isGenerating && (
              <span className="text-[10px] text-purple-400 animate-pulse">
                Running Pipeline...
              </span>
            )}
          </div>

          {trace.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 space-y-2" id="trace-empty-state">
              <Play className="w-5 h-5 mx-auto animate-bounce" />
              <p className="text-[11px]">Deploy and run high-IQ agents to generate live trace log.</p>
            </div>
          ) : (
            trace.map((step, idx) => {
              const isSelected = activeStep?.id === step.id;
              const isCollapsed = !!collapsedSteps[step.id];

              return (
                <div
                  key={step.id}
                  id={`trace-step-${step.id}`}
                  className={`border rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-purple-900/50 shadow-md shadow-purple-950/10'
                      : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                  }`}
                  onClick={() => setSelectedStepId(step.id)}
                >
                  {/* Step Header */}
                  <div className="p-3 flex items-center justify-between gap-2" id={`step-head-${step.id}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-zinc-500 font-mono">0{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-200 truncate text-[11px]">
                          {step.agentName}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {step.action}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] text-zinc-600 font-mono">{step.timestamp}</span>
                      <button
                        id={`collapse-btn-${step.id}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(step.id);
                        }}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5"
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Mini Thoughts Preview */}
                  {!isCollapsed && (
                    <div className="px-3 pb-3 pt-1 border-t border-zinc-900/40 text-[11px] space-y-2 bg-zinc-900/10" id={`step-body-collapsed-${step.id}`}>
                      <div className="flex items-start gap-1 text-purple-400 font-sans italic bg-purple-950/10 p-2 rounded border border-purple-900/20">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <p className="line-clamp-2">
                          &ldquo;{step.thoughts}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Deep Step Inspector Details */}
        <div className="lg:col-span-7 bg-zinc-950 p-5 flex flex-col justify-between max-h-[600px] overflow-y-auto border-t lg:border-t-0 border-zinc-900" id="trace-inspector">
          {activeStep ? (
            <div className="space-y-5" id="inspector-content">
              {/* Active Agent Info Header label */}
              <div className="flex items-start justify-between gap-4 border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900/30">
                      Active Inspector
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono">ID: {activeStep.agentId}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 mt-1.5 font-sans">
                    {activeStep.agentName}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Action: <span className="text-cyan-400">{activeStep.action}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-zinc-600 block">EXEC TIME</span>
                  <span className="text-xs text-zinc-400 font-mono font-bold mt-1 block bg-zinc-900 px-2 py-1 rounded">
                    {activeStep.timestamp}
                  </span>
                </div>
              </div>

              {/* Cognitive Inner Thoughts of the active agent */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>Cognitive Thoughts Pattern</span>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-xl border border-purple-950/30 font-sans italic text-zinc-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 font-mono text-[9px] text-zinc-800 pointer-events-none select-none select-none">
                    THOUGHT_LOG
                  </div>
                  <p className="leading-relaxed text-[12px]">
                    &ldquo;{activeStep.thoughts}&rdquo;
                  </p>
                </div>
              </div>

              {/* Synthesized Output of the active agent */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Synthesized Knowledge Output</span>
                </div>
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl space-y-2 overflow-x-auto">
                  <pre className="text-zinc-200 text-[11px] whitespace-pre-wrap leading-relaxed font-mono">
                    {activeStep.output}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center space-y-3 py-16" id="inspector-placeholder">
              <Eye className="w-8 h-8 text-zinc-800" />
              <div>
                <p className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest font-sans">
                  Inspector Idle
                </p>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-xs mx-auto">
                  Select a specific cognitive block in the log feed on the left to inspect variables, search triggers, and full markdown logs.
                </p>
              </div>
            </div>
          )}

          {/* Quick Sandbox Warning */}
          <div className="border-t border-zinc-900/50 pt-4 mt-8 flex items-center justify-between text-[9px] text-zinc-600">
            <span>MULTI_AGENT_CHAIN: ACTIVE_SESSION</span>
            <span>PROTECTED_TRACE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
