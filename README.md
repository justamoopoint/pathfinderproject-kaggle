SevaPath: Autonomous Rural Health Pathfinder

Powered by Gemini 2.5 Flash, Gemini 3 Pro & Google GenAI SDK

1. Project Description

The Problem

In rural and semi-urban India, the "Golden Hour" is often lost to logistics. Patients travel long distances to providers only to be told they need blood work, requiring a second trip days later. Furthermore, a global workforce shortage of 11 million healthcare workers means clinicians are overwhelmed.

Traditional apps are passive—they wait for input. To solve this, we need Agentic AI systems that can reason, act, and collaborate.

The Solution: SevaPath

SevaPath is a Level 4 Autonomous Agent Swarm built using the new @google/genai SDK. It transforms the patient journey from a series of disconnected hurdles into a streamlined, autonomous workflow.

Instead of a single chatbot, SevaPath orchestrates three specialized agents:

Triage Agent (Gemini 2.5 Flash): Uses JSON Schemas to enforce structured clinical output with ultra-low latency.

Logistics Agent (Gemini 2.5 Flash + Tools): Uses Function Calling to autonomously locate facilities and book diagnostics in a multi-turn loop.

Clinical Agent (Gemini 3 Pro + Grounding): Uses Google Search Grounding to synthesize real-time medical guidelines (NICE/Medscape) to support the doctor.

2. Architecture & Tech Stack

SevaPath utilizes a TypeScript-based orchestration layer to manage the agent swarm.

graph TD
    %% Styles
    classDef google fill:#fff,stroke:#4285F4,stroke-width:2px,color:#000
    classDef ts fill:#3178C6,stroke:#235a97,stroke-width:2px,color:#fff
    classDef tool fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000

    %% Inputs
    Patient(Patient Input) --> Orchestrator[TypeScript Orchestrator]:::ts

    %% Agent Layer
    subgraph Google_GenAI_SDK [Google GenAI SDK]
        direction TB
        
        %% Agent 1
        Triage[("Triage Agent
        Gemini 2.5 Flash
        (Structured JSON)")]:::google
        
        %% Agent 2
        Logistics[("Logistics Agent
        Gemini 2.5 Flash
        (Function Calling)")]:::google
        
        %% Agent 3
        Clinical[("Clinical Agent
        Gemini 3 Pro
        (Search Grounding)")]:::google
    end

    %% Flow
    Orchestrator --> Triage
    Triage --> |"TriageResult"| Orchestrator
    Orchestrator --> |"Triage + Location"| Logistics
    
    %% Logistics Loop
    Logistics <--> |"Execute Tools"| Tools[External Tools
    (Maps / Booking API)]:::tool
    
    Logistics --> |"LogisticsResult"| Orchestrator
    Orchestrator --> |"Full Context"| Clinical
    
    %% Grounding
    Clinical <--> |"Verify Guidelines"| Search[Google Search]:::tool

    %% Output
    Clinical --> Provider[Provider Dashboard]


Technical Implementation

SDK: @google/genai (Node.js/TypeScript).

Models:

Gemini 2.5 Flash: Optimized for speed and tool calling loops.

Gemini 3 Pro Preview: Optimized for complex clinical reasoning.

Orchestration: Custom TypeScript async/await flow managing type-safe state (TriageResult, LogisticsResult).

Deployment: Google Cloud Run (Node.js container).

3. Google AI Implementation Strategy

We leveraged the specific capabilities of the new GenAI SDK to earn the "Effective Use of Gemini" and "Tooling" bonus points.

A. Structured Output with Gemini 2.5 Flash

For the Triage Agent, we utilize Gemini's responseSchema capability. Instead of parsing messy text, we enforce a strict JSON schema:

const schema: Schema = {
  type: Type.OBJECT,
  properties: {
    level: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
    condition: { type: Type.STRING },
    confidence: { type: Type.NUMBER }
  },
  required: ["level", "condition", "confidence"]
};


This ensures 100% reliability when programmatically handling the triage level downstream.

B. The Agentic Loop with Logistics

The Logistics Agent implements a while-loop architecture to handle multi-turn function calling.

The model decides which tool to call (findNearestFacility).

Our code executes the tool.

The result is fed back to the model.

The model decides if it needs another tool (bookHomeLab) or if it's finished.
This allows for dynamic, non-linear problem solving.

C. Grounding with Gemini 3 Pro

For the Clinical Agent, we utilize the Native Google Search Grounding feature:

config: {
  tools: [{ googleSearch: {} }], // Native Grounding
  temperature: 0.4,
}


This is critical for healthcare. It ensures the AI doesn't hallucinate treatments but retrieves them from indexed, authoritative sources (Medscape, NIH, NICE) in real-time.

4. Key Features

Type-Safe Agents: Extensive use of TypeScript interfaces (TriageResult, LogisticsResult) ensures the data passing between agents is robust.

Model Specialization: We don't use one model for everything. We use Flash for speed/cost tasks and Pro for high-stakes reasoning.

Real-World Action: The system doesn't just suggest a lab test; it books it via the bookHomeLab tool definition.

5. Setup & Usage

Prerequisites

Node.js v18+

Google Cloud API Key (with access to gemini-3-pro-preview)

Installation

# 1. Clone the repo
# 2. Install dependencies
# 3. Set API Key
# 4. Run the Agent Swarm

