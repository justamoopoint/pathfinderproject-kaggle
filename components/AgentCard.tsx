import React from 'react';
import { AgentState, AgentType } from '../types';
import { Loader, CheckCircle, BrainCircuit } from './Icons';

interface AgentCardProps {
  type: AgentType;
  state: AgentState;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ type, state, icon, title, description }) => {
  const getBorderColor = () => {
    switch (state.status) {
      case 'THINKING': return 'border-medical-500 ring-2 ring-medical-100';
      case 'COMPLETED': return 'border-accent-500';
      case 'ERROR': return 'border-red-400';
      default: return 'border-slate-200';
    }
  };

  const getStatusText = () => {
     switch (state.status) {
      case 'THINKING': return 'Processing...';
      case 'COMPLETED': return 'Complete';
      case 'ERROR': return 'Error';
      default: return 'Waiting';
    }
  };

  return (
    <div className={`relative p-5 rounded-xl bg-white border transition-all duration-300 ${getBorderColor()} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${state.status === 'COMPLETED' ? 'bg-accent-100 text-accent-600' : 'bg-medical-100 text-medical-600'}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {state.status === 'THINKING' && <Loader className="w-4 h-4 text-medical-500" />}
            {state.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-accent-500" />}
            <span className={`text-xs font-medium ${state.status === 'THINKING' ? 'text-medical-600' : state.status === 'COMPLETED' ? 'text-accent-600' : 'text-slate-400'}`}>
                {getStatusText()}
            </span>
        </div>
      </div>
      
      {state.status === 'THINKING' && (
        <div className="mt-4">
           <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-medical-500 animate-[progressBar_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
           </div>
           <p className="mt-2 text-xs text-slate-500 font-mono flex items-center gap-1">
             <BrainCircuit className="w-3 h-3" />
             Agent is reasoning...
           </p>
        </div>
      )}

      {/* Custom Animation for progress bar */}
      <style>{`
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};