export enum AgentType {
  TRIAGE = 'TRIAGE',
  LOGISTICS = 'LOGISTICS',
  CLINICAL = 'CLINICAL'
}

export enum TriageLevel {
  GREEN = 'Green',
  YELLOW = 'Yellow',
  RED = 'Red'
}

export interface TriageResult {
  level: TriageLevel;
  condition: string;
  reasoning: string;
  confidence: number;
}

export interface LogisticsAction {
  type: 'FACILITY_FOUND' | 'LAB_BOOKED';
  description: string;
  details: string;
  timestamp: string;
}

export interface LogisticsResult {
  actions: LogisticsAction[];
  summary: string;
}

export interface ClinicalResult {
  advisory: string;
  guidelinesFound: string[];
}

export interface PatientState {
  id: string;
  location: string;
  symptoms: string;
  age: number;
  gender: string;
}

export interface AgentState {
  status: 'IDLE' | 'THINKING' | 'COMPLETED' | 'ERROR';
  message?: string;
}

export interface WorkflowState {
  triage: AgentState;
  logistics: AgentState;
  clinical: AgentState;
}