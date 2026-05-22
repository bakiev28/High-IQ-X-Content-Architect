/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AgentConfig, AgentId, TraceStep, GenerationResult, WorkflowSession } from './types';
import { AgentSelectors } from './components/AgentSelectors';
import { AgentTraceView } from './components/AgentTraceView';
import { GenerationOutput } from './components/GenerationOutput';
import { Sparkles, Terminal, History, BookOpen, Layers, CheckCircle2, ChevronRight, RefreshCw, Twitter, HelpCircle, ArrowUpRight, Check } from 'lucide-react';

const INITIAL_AGENTS: AgentConfig[] = [
  { id: 'researcher', name: 'Dr. Evelyn Carter', role: 'Academic research & real-time Google search grounding', description: 'Executes live search queries on tech news, Google, and research databases.', enabled: true },
  { id: 'searcher', name: 'Aero (Discovery Specialist)', role: 'Filters metrics & atomic factual references', description: 'Isolates precise claims, quantitative measures, and code blocks to maximize idea density.', enabled: true },
  { id: 'structurer', name: 'Livia Vane', role: 'Architects outlines & structural layout flow', description: 'Creates sequential steps and logic maps to build audience retention.', enabled: true },
  { id: 'copywriter', name: 'Julian Black (Technical Writer)', role: 'Drafts high-density content with rigorous tone', description: 'Converts scientific background details into clear, compelling tech-literate sentences.', enabled: true },
  { id: 'factchecker', name: 'Veritas (Rigor Inspector)', role: 'Isolates hallucinations & audits logic accuracy', description: 'Cross-checks every calculation and numerical reference against references.', enabled: true },
  { id: 'editor', name: 'Sloane Vance (Anti-Slop Lead)', role: 'Eliminates typical AI-cliches & verifies limits', description: 'Refines the hook, purges generic promotional adjectives, and ensures strict 280-char boundaries.', enabled: true },
  { id: 'distribution', name: 'Zephyr', role: 'Formulates micro-propagation playbook', description: 'Suggests alternative titles, community references, optimal post times, and conversational replies.', enabled: true }
];

export default function App() {
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    const saved = localStorage.getItem('high_iq_agents_config');
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
  });

  const [topic, setTopic] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [format, setFormat] = useState<'tweet' | 'thread' | 'essay'>('thread');
  const [tone, setTone] = useState('Analytical, High-IQ, Monospace Accents');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepIdx, setGenerationStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active generation results
  const [activeSession, setActiveSession] = useState<WorkflowSession | null>(null);

  // Historical generated sessions list
  const [sessions, setSessions] = useState<WorkflowSession[]>([]);

  // Presets available loaded from server or presets lists
  const [presets, setPresets] = useState<any[]>([]);

  // Selected view tab on main panel
  const [primaryTab, setPrimaryTab] = useState<'output' | 'trace' | 'history'>('output');

  // Load Presets and saved state on mount
  useEffect(() => {
    // Save agents config whenever edited
    localStorage.setItem('high_iq_agents_config', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    // Load presets from backend
    fetch('/api/presets')
      .then(res => res.json())
      .then(data => {
        if (data.presets) setPresets(data.presets);
      })
      .catch(err => console.error("Could not fetch presets", err));

    // Load static histories
    const savedSessions = localStorage.getItem('high_iq_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSession(parsed[0]);
      }
    }
  }, []);

  const toggleAgent = (id: AgentId) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  // Simulating live incremental log feed while waiting for server response
  const RUNNING_TIPS = [
    "Contacting Google Search API for grounding documents...",
    "Retrieving scholarly papers... processing metadata...",
    "Aero is extracting atomic variables, code samples, and quantitative constraints...",
    "Livia is drafting the thesis progression and sequence cuts...",
    "Julian is generating raw drafts and monospace technical formatting...",
    "Veritas is auditing statistics, numbers, and checking for hallucinations...",
    "Sloane is pruning AI clichés and checking 280-character boundary limits...",
    "Zephyr is compiling alternative hooks and outbound timing patterns..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStepIdx(prev => (prev + 1) % RUNNING_TIPS.length);
      }, 3500);
    } else {
      setGenerationStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle Preset Loader
  const handleLoadPreset = (presetId: string) => {
    const found = presets.find(p => p.id === presetId);
    if (!found) return;

    setTopic(found.topic);
    setFormat(found.format);
    setTone(found.tone);

    // Create immediate active simulated session
    const simulatedSession: WorkflowSession = {
      id: `${presetId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topic: found.topic,
      format: found.format,
      tone: found.tone,
      result: found.result
    };

    setActiveSession(simulatedSession);
    setSessions(prev => {
      const filtered = prev.filter(s => s.topic !== found.topic);
      const updated = [simulatedSession, ...filtered];
      localStorage.setItem('high_iq_sessions', JSON.stringify(updated));
      return updated;
    });
    setPrimaryTab('output');
    setErrorMsg(null);
  };

  // Execute actual multi-agent pipeline
  const runAgentPipeline = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setPrimaryTab('trace'); // Instant look inside trace terminal

    const enabledIds = agents.filter(a => a.enabled).map(a => a.id);

    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          sourceUrl,
          format,
          tone,
          enabledAgents: enabledIds
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with status code ${response.status}`);
      }

      const rawResult = await response.json();
      const generationResult: GenerationResult = rawResult.result;

      const newSession: WorkflowSession = {
        id: `sess-${Date.now()}`,
        createdAt: new Date().toISOString(),
        topic,
        format,
        tone,
        result: generationResult
      };

      setActiveSession(newSession);
      setSessions(prev => {
        const updated = [newSession, ...prev];
        localStorage.setItem('high_iq_sessions', JSON.stringify(updated));
        return updated;
      });

      setPrimaryTab('output'); // Switch to results visually

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Cognitive pipeline failed. Check console trace or update your secrets.");
      setPrimaryTab('output');
    } finally {
      setIsGenerating(false);
    }
  };

  // Callback to update modified draft items inline inside the preview editor
  const handleUpdateDraft = (id: string, newContent: string) => {
    if (!activeSession || !activeSession.result) return;

    const updatedResult: GenerationResult = {
      ...activeSession.result,
      drafts: activeSession.result.drafts.map(d => d.id === id ? { ...d, content: newContent, characterCount: newContent.length } : d)
    };

    const updatedSession: WorkflowSession = {
      ...activeSession,
      result: updatedResult
    };

    setActiveSession(updatedSession);
    setSessions(prev => {
      const updated = prev.map(s => s.id === activeSession.id ? updatedSession : s);
      localStorage.setItem('high_iq_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  // Delete session from list
  const handleDeleteSession = (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessId);
    setSessions(updated);
    localStorage.setItem('high_iq_sessions', JSON.stringify(updated));
    if (activeSession?.id === sessId) {
      setActiveSession(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-900 selection:text-white" id="main-applet-root">
      {/* Visual Top Header line */}
      <header className="bg-zinc-900 border-b border-zinc-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-md" id="master-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-950/20" id="header-logo">
            <span className="font-mono text-lg font-black text-white">X</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white font-sans">
                High-IQ X Content Architect
              </h1>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                v2.5 Full-Stack
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Multi-Agent Search Grounded Research Synthesizer
            </p>
          </div>
        </div>

        {/* Diagnostic server metrics indicator */}
        <div className="flex items-center gap-3 text-xs" id="header-status-indicators">
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-zinc-500 font-mono">Gemini 3.5-Flash Stack</span>
          </div>
          <span className="text-[10px] text-zinc-400 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md font-mono hidden md:inline-block">
            UTC: 2026-05-22 07:07
          </span>
        </div>
      </header>

      {/* Main full-scale Workspace layout */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="workspace-layout">
        
        {/* Left Column (Span 4): Research Input & Agent Stack Controllers */}
        <section className="lg:col-span-4 space-y-6" id="left-section-controllers">
          <AgentSelectors
            agents={agents}
            toggleAgent={toggleAgent}
            topic={topic}
            setTopic={setTopic}
            sourceUrl={sourceUrl}
            setSourceUrl={setSourceUrl}
            format={format}
            setFormat={setFormat}
            tone={tone}
            setTone={setTone}
            isGenerating={isGenerating}
            onRunPipeline={runAgentPipeline}
            errorMsg={errorMsg}
            onLoadPreset={handleLoadPreset}
            presets={presets}
          />
        </section>

        {/* Right Column (Span 8): Interactive Deep Screen Canvas */}
        <section className="lg:col-span-8 flex flex-col space-y-4" id="right-section-canvas">
          
          {/* Main Monitor Tabs switch controls */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2" id="canvas-actions-row">
            <div className="flex items-center gap-2" id="canvas-tab-links">
              <button
                id="view-output-tab-btn"
                type="button"
                onClick={() => setPrimaryTab('output')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${primaryTab === 'output' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                🚀 Model Output Workspace
              </button>
              <button
                id="view-trace-tab-btn"
                type="button"
                onClick={() => setPrimaryTab('trace')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${primaryTab === 'trace' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                🔬 Cognitive Trace ({activeSession?.result?.trace.length || 0})
              </button>
              <button
                id="view-history-tab-btn"
                type="button"
                onClick={() => setPrimaryTab('history')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${primaryTab === 'history' ? 'bg-zinc-900 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                📁 Historian DB ({sessions.length})
              </button>
            </div>

            {activeSession && (
              <span className="text-[10px] text-zinc-500 font-mono truncate max-w-xs text-right hidden sm:inline-block">
                Active: {activeSession.topic}
              </span>
            )}
          </div>

          {/* Running simulated state loop panel */}
          {isGenerating && (
            <div className="bg-gradient-to-r from-purple-950/20 to-zinc-950 border border-purple-900/30 rounded-xl p-5 space-y-3 relative overflow-hidden" id="ambient-processing-banner">
              <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-xs font-bold text-zinc-200 tracking-wider font-mono">
                    GENERATOR THREADING COGNITION CIRCUIT
                  </span>
                </div>
                <span className="text-[10.5px] font-mono text-purple-400 font-black">
                  WAIT_RESPONSE
                </span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-lg border border-purple-950/40">
                <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <p className="text-[11.5px] font-mono text-purple-300 shrink-1 truncate">
                  {RUNNING_TIPS[generationStepIdx]}
                </p>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                The high-IQ architect connects various agents to pull real studies, factual references, and remove cliches to craft content that commands massive respect. This usually takes 15–30 seconds.
              </p>
            </div>
          )}

          {/* Core active Viewport display container */}
          <div className="flex-1" id="primary-view-container">
            {primaryTab === 'output' && (
              activeSession?.result ? (
                <GenerationOutput
                  result={activeSession.result}
                  onUpdateDraft={handleUpdateDraft}
                />
              ) : (
                <div className="bg-zinc-900/30 border border-zinc-850/80 rounded-2xl p-10 text-center space-y-4 max-w-xl mx-auto my-12" id="canvas-empty-splash">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto text-purple-400 border border-zinc-800">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-zinc-200 font-bold text-sm uppercase tracking-wider font-sans">
                      Cognitive Engine Canvas Empty
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      Enter a topic or select one of our curated high-IQ presets on the left. Click <span className="bg-zinc-800 px-1 py-0.5 rounded text-purple-400 text-[10px] font-mono">Compile High-IQ Core</span> to kick start the multi-agent execution pipeline.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      id="load-arxiv-quantum-instant-btn"
                      type="button"
                      onClick={() => handleLoadPreset('demo-arxiv-physics')}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-[11px] text-zinc-300 px-3.5 py-2 rounded-lg transition font-mono"
                    >
                      🧪 Run Pre-loaded Quantum Loop (Precompute Demo)
                    </button>
                  </div>
                </div>
              )
            )}

            {primaryTab === 'trace' && (
              <AgentTraceView
                trace={activeSession?.result?.trace || []}
                isGenerating={isGenerating}
              />
            )}

            {primaryTab === 'history' && (
              <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-4" id="sessions-history-tab">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 font-sans uppercase">
                      Workflow Archive Database
                    </h3>
                    <p className="text-[10px] text-zinc-500">Persistent list stored in client memory stack</p>
                  </div>
                  
                  <button
                    id="clear-all-sessions-btn"
                    type="button"
                    onClick={() => {
                      if (window.confirm("Purge the content archive? This cannot be undone.")) {
                        setSessions([]);
                        localStorage.removeItem('high_iq_sessions');
                        setActiveSession(null);
                      }
                    }}
                    className="text-[10px] uppercase font-mono tracking-widest text-red-500 hover:text-red-400 transition"
                  >
                    Purge All Records
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-16 text-zinc-600 space-y-2" id="sessions-empty">
                    <History className="w-6 h-6 mx-auto opacity-40" />
                    <p className="text-xs font-mono">No previous generation sessions recorded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3" id="sessions-history-list">
                    {sessions.map((sess) => {
                      const isActive = activeSession?.id === sess.id;
                      return (
                        <div
                          key={sess.id}
                          id={`history-row-${sess.id}`}
                          onClick={() => {
                            setActiveSession(sess);
                            setPrimaryTab('output');
                          }}
                          className={`border rounded-xl p-4 cursor-pointer transition flex items-center justify-between gap-4 ${
                            isActive
                              ? 'bg-zinc-900 border-purple-900/60'
                              : 'bg-zinc-900/40 border-zinc-850/60 hover:bg-zinc-900/80 hover:border-zinc-800'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded">
                                {sess.format.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date(sess.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-zinc-200 truncate font-sans">
                              {sess.topic}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] bg-purple-950/40 text-purple-300 border border-purple-900/40 px-2 py-0.5 rounded font-mono">
                              {sess.result?.drafts.length || 0} tweets
                            </span>
                            <button
                              id={`delete-sess-btn-${sess.id}`}
                              type="button"
                              onClick={(e) => handleDeleteSession(sess.id, e)}
                              className="text-zinc-600 hover:text-red-400 font-mono text-[10px] p-1 rounded hover:bg-zinc-800"
                              title="Delete session"
                            >
                              Purge
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </section>
      </main>

      {/* Visual Workspace Sub-footer */}
      <footer className="bg-zinc-900/20 border-t border-zinc-900/70 p-4 mt-12" id="workspace-footer">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <p className="text-[10px] text-zinc-500 font-mono">
              X CONTEXT INFRASTRUCTURE STACK — SECURE LOCAL STORAGE COGNITIVE VAULT
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
            <span>DEVELOPED WITH GEMINI 3.5 FLASH</span>
            <span>PROTECTED INTENT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
