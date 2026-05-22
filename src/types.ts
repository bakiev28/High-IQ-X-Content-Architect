/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentId = 
  | 'researcher' 
  | 'searcher' 
  | 'structurer' 
  | 'copywriter' 
  | 'factchecker' 
  | 'editor' 
  | 'distribution';

export interface AgentConfig {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  enabled: boolean;
}

export interface TraceStep {
  id: string;
  agentId: AgentId;
  agentName: string;
  action: string;
  thoughts: string;
  output: string;
  timestamp: string; // ISO string or simple time
}

export interface EvaluationScore {
  metric: string;
  score: number; // 0 - 100
  feedback: string;
}

export interface DraftItem {
  id: string;
  heading?: string;
  content: string;
  characterCount: number;
}

export interface GenerationResult {
  topic: string;
  sourceText?: string;
  sourceUrl?: string;
  agentsRun: AgentId[];
  trace: TraceStep[];
  outline: string;
  drafts: DraftItem[];
  evaluation: EvaluationScore[];
  generalFeedback: string;
  factCheckerReport: string;
  distributionStrategy: {
    hookIdeas: string[];
    outboundIdeas: string[];
    suggestedTimes: string[];
    replyTemplates: string[];
  };
}

export interface WorkflowSession {
  id: string;
  createdAt: string;
  topic: string;
  format: 'tweet' | 'thread' | 'essay';
  tone: string;
  result?: GenerationResult;
}
