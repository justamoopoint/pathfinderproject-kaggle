import React, { useState, useRef, useEffect } from 'react';
import { AgentType, WorkflowState, TriageResult, LogisticsResult, ClinicalResult, TriageLevel } from './types';
import { runTriageAgent, runLogisticsAgent, runClinicalAgent } from './services/geminiService';
import { AgentCard } from './components/AgentCard';
import { HeartPulse, Ambulance, Stethoscope, BrainCircuit } from './components/Icons';

const App: React.FC = () => {
  // --- State ---
  const [input, setInput] = useState("Patient has high fever (103F), severe body ache, and rash for 2 days. Complains of pain behind eyes. Lives in rural area.");
  const [location, setLocation] = useState("Kampur Village, Sector 4");
  
  // Workflow State
  const [workflow, setWorkflow] = useState<WorkflowState>({
    triage: { status: 'IDLE' },
    logistics: { status: 'IDLE' },
    clinical: { status: 'IDLE' }
  });
  
  // Results State
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [logisticsResult, setLogisticsResult] = useState<LogisticsResult | null>(null);
  const [clinicalResult, setClinicalResult] = useState<ClinicalResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetWorkflow = () => {
    setWorkflow({
      triage: { status: 'IDLE' },
      logistics: { status: 'IDLE' },
      clinical: { status: 'IDLE' }
    });
    setTriageResult(null);
    setLogisticsResult(null);
    setClinicalResult(null);
    setError(null);
  };

  const handleRunSimulation = async () => {
    resetWorkflow();
    if (!process.env.API_KEY) {
        setError("Please provide a valid Gemini API Key in the environment to run the simulation.");
        return;
    }
    
    try {
      // 1. TRIAGE AGENT
      setWorkflow(prev => ({ ...prev, triage: { status: 'THINKING' } }));
      const tResult = await runTriageAgent(input, 45, "Male");
      setTriageResult(tResult);
      setWorkflow(prev => ({ ...prev, triage: { status: 'COMPLETED' } }));

      // 2. LOGISTICS AGENT
      setWorkflow(prev => ({ ...prev, logistics: { status: 'THINKING' } }));
      const lResult = await runLogisticsAgent(tResult, location, "PAT-8821");
      setLogisticsResult(lResult);
      setWorkflow(prev => ({ ...prev, logistics: { status: 'COMPLETED' } }));

      // 3. CLINICAL AGENT
      setWorkflow(prev => ({ ...prev, clinical: { status: 'THINKING' } }));
      const cResult = await runClinicalAgent(tResult, lResult);
      setClinicalResult(cResult);
      setWorkflow(prev => ({ ...prev, clinical: { status: 'COMPLETED' } }));

      scrollToBottom();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      // Mark current step as error
      setWorkflow(prev => {
          const newState = { ...prev };
          if (prev.triage.status === 'THINKING') newState.triage.status = 'ERROR';
          else if (prev.logistics.status === 'THINKING') newState.logistics.status = 'ERROR';
          else if (prev.clinical.status === 'THINKING') newState.clinical.status = 'ERROR';
          return newState;
      });
    }
  };

  const getLevelColor = (level?: TriageLevel) => {
    switch (level) {
      case TriageLevel.GREEN: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case TriageLevel.YELLOW: return 'bg-amber-100 text-amber-800 border-amber-200';
      case TriageLevel.RED: return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-700 rounded-lg flex items-center justify-center text-white shadow-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">SevaPath <span className="font-light text-slate-500">AI</span></h1>
              <p className="text-xs text-slate-500 font-mono">ADK-Powered Triage System</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-slate-500 hover:text-medical-600 transition-colors"
          >
            Reset Session
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Input & Configuration */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Input Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-medical-500"></span>
              Patient Intake
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reported Symptoms</label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-200 focus:border-medical-500 outline-none transition-all text-sm h-32 resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe symptoms..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (GPS Mock)</label>
                <input 
                  type="text"
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-200 focus:border-medical-500 outline-none transition-all text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button 
                onClick={handleRunSimulation}
                disabled={workflow.triage.status === 'THINKING' || workflow.logistics.status === 'THINKING'}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {(workflow.triage.status === 'THINKING' || workflow.logistics.status === 'THINKING') ? (
                    <>Running Swarm <BrainCircuit className="w-4 h-4 animate-pulse" /></>
                ) : (
                    'Activate Agents'
                )}
              </button>
            </div>
          </div>

          {/* Agent Status Overview */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Swarm Status</h3>
            <AgentCard 
              type={AgentType.TRIAGE} 
              state={workflow.triage} 
              icon={<HeartPulse className="w-5 h-5" />}
              title="TriageBot"
              description="Flash Model • Symptom Analysis"
            />
            <AgentCard 
              type={AgentType.LOGISTICS} 
              state={workflow.logistics} 
              icon={<Ambulance className="w-5 h-5" />}
              title="LogisticsBot"
              description="Flash Model • Tool Use • Resource Alloc"
            />
            <AgentCard 
              type={AgentType.CLINICAL} 
              state={workflow.clinical} 
              icon={<Stethoscope className="w-5 h-5" />}
              title="ClinicalBot"
              description="Pro Model • Reasoning • Grounding"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Workflow Visualization & Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
              <div className="mt-1 text-red-500">⚠️</div>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Welcome State */}
          {workflow.triage.status === 'IDLE' && !triageResult && !error && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <BrainCircuit className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-700">Ready to Initialize</h3>
              <p className="text-slate-500 max-w-md mt-2">
                Enter patient details and activate the agent swarm. The system will coordinate triage, logistics, and clinical advice autonomously.
              </p>
            </div>
          )}

          {/* 1. Triage Results */}
          {triageResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-medical-600" />
                  <span className="text-sm font-semibold text-slate-700">Triage Assessment</span>
                </div>
                <span className="text-xs font-mono text-slate-400">latency: 420ms</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{triageResult.condition}</h2>
                        <p className="text-slate-600 text-sm">{triageResult.reasoning}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${getLevelColor(triageResult.level)} flex flex-col items-center`}>
                        <span className="text-xs font-bold uppercase tracking-wider">Priority</span>
                        <span className="text-xl font-bold">{triageResult.level}</span>
                    </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                    <div 
                        className="bg-slate-800 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${triageResult.confidence}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Confidence Score</span>
                    <span>{triageResult.confidence}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Logistics Results */}
          {logisticsResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up delay-100">
               <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-medical-600" />
                  <span className="text-sm font-semibold text-slate-700">Logistics Actions</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Tools Executed: {logisticsResult.actions.length}</span>
              </div>
              <div className="p-6">
                {logisticsResult.actions.length === 0 ? (
                    <p className="text-slate-500 italic">No specific logistics actions required for this triage level.</p>
                ) : (
                    <div className="space-y-4">
                        {logisticsResult.actions.map((action, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="mt-1">
                                    {action.type === 'FACILITY_FOUND' ? (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">{action.description}</h4>
                                    <p className="text-sm text-slate-600 mt-1">{action.details}</p>
                                    <span className="text-xs text-slate-400 mt-2 block">{action.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 font-medium">Agent Summary:</p>
                    <p className="text-sm text-slate-500 mt-1">{logisticsResult.summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Clinical Results */}
          {clinicalResult && (
             <div className="bg-white rounded-xl shadow-sm border border-medical-100 overflow-hidden animate-fade-in-up delay-200">
                <div className="bg-gradient-to-r from-medical-50 to-white px-6 py-3 border-b border-medical-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-medical-600" />
                        <span className="text-sm font-semibold text-slate-700">Clinical Decision Support</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                         <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                         <span className="text-xs font-medium text-slate-600">Grounding Active</span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="prose prose-sm prose-slate max-w-none">
                        <div className="whitespace-pre-line leading-relaxed text-slate-700">
                            {clinicalResult.advisory}
                        </div>
                    </div>

                    {clinicalResult.guidelinesFound.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence / Guidelines Found</p>
                            <ul className="space-y-1">
                                {clinicalResult.guidelinesFound.map((source, i) => (
                                    <li key={i} className="text-xs text-blue-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                                        <a href="#" className="hover:underline truncate max-w-md block">{source}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />

        </div>
      </main>
      
      {/* CSS for simple animations */}
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default App;