import { GoogleGenAI, Type, FunctionDeclaration, Schema } from "@google/genai";
import { TriageResult, LogisticsResult, LogisticsAction, ClinicalResult, TriageLevel } from "../types";
import { SevaPathTools } from "./tools";

// --- Agent 1: Triage (Speed & Classification) ---
export const runTriageAgent = async (symptoms: string, age: number, gender: string): Promise<TriageResult> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      level: { type: Type.STRING, enum: ["Green", "Yellow", "Red"] },
      condition: { type: Type.STRING },
      reasoning: { type: Type.STRING },
      confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
    },
    required: ["level", "condition", "reasoning", "confidence"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Patient Profile: ${age} year old ${gender}.
    Symptoms: ${symptoms}.
    
    You are SevaPath TriageBot. Analyze symptoms and determine urgency.
    - Green: Non-urgent, self-care.
    - Yellow: Urgent, needs medical attention within 24hrs.
    - Red: Emergency, immediate action required.
    
    Output strictly in JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Triage Agent");
  return JSON.parse(text) as TriageResult;
};

// --- Agent 2: Logistics (Tool Use & Operations) ---
export const runLogisticsAgent = async (triage: TriageResult, location: string, patientId: string): Promise<LogisticsResult> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Define Tools
  const findFacilityTool: FunctionDeclaration = {
    name: "findNearestFacility",
    description: "Finds the nearest medical facility based on location and type.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { type: Type.STRING },
        facilityType: { type: Type.STRING, description: "e.g., 'hospital', 'clinic', 'lab'" },
      },
      required: ["location", "facilityType"],
    },
  };

  const bookLabTool: FunctionDeclaration = {
    name: "bookHomeLab",
    description: "Books a home sample collection for lab tests.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        testType: { type: Type.STRING, description: "e.g., 'CBC', 'Dengue Panel'" },
        patientId: { type: Type.STRING },
      },
      required: ["testType", "patientId"],
    },
  };

  // Initial Prompt
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      tools: [{ functionDeclarations: [findFacilityTool, bookLabTool] }],
      temperature: 0.2, 
      systemInstruction: `You are LogisticsBot. 
      Triage Result: ${triage.level} - ${triage.condition}.
      Location: ${location}. Patient ID: ${patientId}.
      
      If Triage is Yellow or Red:
      1. Suggest relevant lab tests if infection is suspected (e.g., Dengue, Malaria, Viral).
      2. Call bookHomeLab for these tests.
      3. Call findNearestFacility to find a clinic or hospital.
      
      If Triage is Green:
      1. Only find a local pharmacy or clinic.
      
      Execute tools as needed.`
    }
  });

  let response = await chat.sendMessage({ message: "Proceed with logistics." });
  const actions: LogisticsAction[] = [];

  // Handle Function Calling Loop
  // We limit loop to 5 to prevent infinite loops
  let loops = 0;
  while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall) && loops < 5) {
    loops++;
    const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall).map(p => p.functionCall!);
    
    const functionResponses = [];

    for (const call of functionCalls) {
      let result = "";
      
      if (call.name === "findNearestFacility") {
        const args = call.args as any;
        result = SevaPathTools.findNearestFacility(args.location, args.facilityType);
        actions.push({
          type: 'FACILITY_FOUND',
          description: `Located ${args.facilityType}`,
          details: result,
          timestamp: new Date().toLocaleTimeString()
        });
      } else if (call.name === "bookHomeLab") {
        const args = call.args as any;
        result = SevaPathTools.bookHomeLab(args.testType, args.patientId);
        actions.push({
          type: 'LAB_BOOKED',
          description: `Booked ${args.testType}`,
          details: result,
          timestamp: new Date().toLocaleTimeString()
        });
      }

      functionResponses.push({
        name: call.name,
        response: { result: result }
      });
    }

    // Send tool responses back to model
    response = await chat.sendMessage({
        message: functionResponses.map(r => ({ functionResponse: r }))
    });
  }

  return {
    actions,
    summary: response.text || "Logistics coordination complete."
  };
};

// --- Agent 3: Clinical (Reasoning & Grounding) ---
export const runClinicalAgent = async (triage: TriageResult, logistics: LogisticsResult): Promise<ClinicalResult> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Using Pro model for reasoning + Search Grounding
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      Patient Condition: ${triage.condition} (${triage.level}).
      Triage Reasoning: ${triage.reasoning}.
      Logistics Actions Taken: ${logistics.actions.map(a => a.description).join(", ")}.
      
      Generate a Clinical Decision Support advisory for the attending doctor.
      - Include best practice guidelines (Search if needed).
      - Recommend next clinical steps.
      - Keep it professional and structured Markdown.
    `,
    config: {
      tools: [{ googleSearch: {} }], // Grounding enabled
      temperature: 0.4,
    }
  });

  // Extract Grounding Metadata
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const guidelinesFound: string[] = [];
  
  groundingChunks.forEach(chunk => {
      if (chunk.web?.uri) {
          guidelinesFound.push(chunk.web.title || chunk.web.uri);
      }
  });

  return {
    advisory: response.text || "No advisory generated.",
    guidelinesFound
  };
};