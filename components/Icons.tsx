import React from 'react';

export const HeartPulse = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);

export const Ambulance = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 10h4" />
    <path d="M12 8v4" />
    <path d="M19 17v-7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7" />
    <path d="M14 5h-4a2 2 0 0 0-2 2v2h8V7a2 2 0 0 0-2-2Z" />
    <circle cx="7" cy="17" r="3" />
    <circle cx="17" cy="17" r="3" />
  </svg>
);

export const Stethoscope = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.8 2.3A.3.3 0 0 1 5 2h14a.3.3 0 0 1 .2.3v3.4a3 3 0 0 1-3 3v8c0 3.3-2.7 6-6 6s-6-2.7-6-6v-8a3 3 0 0 1-3-3V2.3z" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const Loader = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} animate-spin`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const BrainCircuit = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.474 3.5 3.5 0 0 0-2.5 3.512t.003 2.016a4.986 4.986 0 0 0-1.5 3.248 3 3 0 0 0 4.997 2.25 5 5 0 0 0 5-1 5 5 0 0 0 5 1 3 3 0 0 0 4.997-2.25 4.985 4.985 0 0 0-1.5-3.248 3.5 3.5 0 0 0 .003-2.016 3.5 3.5 0 0 0-2.5-3.512A3 3 0 0 0 12 5Z" />
    <path d="M12 10v4" />
    <path d="M12 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    <path d="M8.5 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    <path d="M15.5 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
  </svg>
);
