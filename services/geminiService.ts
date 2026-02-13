import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { GeneratedContent, SimulationScript, Speaker } from "../types";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

// --- Phase 1: Hub Content ---

export const generateWorldBriefing = async (
  regionName: string,
  baseDescription: string
): Promise<GeneratedContent> => {
  try {
    const client = getAIClient();

    if (!process.env.API_KEY) {
      return {
        title: `Accessing ${regionName}...`,
        briefing: baseDescription,
        funFact: "API Key missing. System running in offline simulation mode."
      };
    }

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a mission briefing for the game level located in the ${regionName}.
      Base context: ${baseDescription}.
      
      Return a JSON object with:
      1. title: A cool, sci-fi title for this mission.
      2. briefing: A 2-sentence explanation of what this brain part does, using game metaphors.
      3. funFact: A "Did you know?" fact about this brain region that is surprising.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GeneratedContent;

  } catch (error) {
    console.error("Error generating briefing:", error);
    return {
      title: `Sector: ${regionName}`,
      briefing: baseDescription,
      funFact: "Neural uplink unstable. Using cached data archives."
    };
  }
};

// --- Phase 2: Simulation Content ---

export const generateSimulationScript = async (regionName: string, specificQuestion?: string): Promise<SimulationScript> => {
  try {
    const client = getAIClient();

    if (!process.env.API_KEY) {
      console.warn("API Key missing. Returning fallback simulation script.");
      return getFallbackScript(regionName);
    }

    const questionPrompt = specificQuestion
      ? `The question to answer is: "${specificQuestion}"`
      : `Create 1 Question about this brain region`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a dialogue for a game level in the ${regionName}.
      Characters:
      - Synapse: Biological, calm, deep focus.
      - Spark: Digital, energetic, tech focus.
      
      ${questionPrompt} and create a 3-part dialogue explaining it.
      
      Output JSON format:
      {
        "question": "The question title",
        "exchanges": [
          { "speaker": "Synapse", "text": "...", "imagePrompt": "Description for a 3D organic render..." },
          { "speaker": "Spark", "text": "...", "imagePrompt": "Description for a 3D digital/tech render..." },
          { "speaker": "Both", "text": "...", "imagePrompt": "Description of them combining..." }
        ]
      }`,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) throw new Error("Failed to generate script");

    // Clean up potential markdown code blocks
    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("Raw Gemini Response:", cleanText); // Debug logging

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
      console.log("Parsed JSON:", parsed); // Debug logging
    } catch (e) {
      console.error("JSON Parse Error:", e);
      throw new Error("Failed to parse JSON response");
    }

    // Handle direct array response (fallback)
    if (Array.isArray(parsed)) {
      console.warn("Received array directly instead of object. Wrapping in default structure.");
      return {
        question: `Exploration of ${regionName}`,
        exchanges: parsed
      } as SimulationScript;
    }

    // Handle nested responses (e.g. { script: {...} } or { simulation: {...} })
    if (!parsed.exchanges || !Array.isArray(parsed.exchanges)) {
      if (parsed.script && Array.isArray(parsed.script.exchanges)) {
        return parsed.script as SimulationScript;
      }
      if (parsed.simulation && Array.isArray(parsed.simulation.exchanges)) {
        return parsed.simulation as SimulationScript;
      }

      const keys = Object.keys(parsed).join(", ");
      console.error("Validation Failed. Keys:", keys);
      throw new Error(`Invalid script structure: 'exchanges' array missing or invalid. Received keys: ${keys}`);
    }

    return parsed as SimulationScript;

  } catch (error) {
    console.error("Error generating simulation script:", error);
    return getFallbackScript(regionName);
  }
};

const getFallbackScript = (regionName: string): SimulationScript => ({
  question: `Analysis of ${regionName}`,
  exchanges: [
    {
      speaker: "Synapse",
      text: `We are having trouble accessing the deep archives for ${regionName}. The neural pathways are currently blocked.`,
      imagePrompt: "Fading neural connections, organic decay, mysterious"
    },
    {
      speaker: "Spark",
      text: "I'm detecting significant signal interference. I'll attempt to reroute the connection, but for now, we're on local backup.",
      imagePrompt: "Glitching digital interface, static, repairing code"
    }
  ]
});

export const generateCharacterImage = async (prompt: string): Promise<string> => {
  const client = getAIClient();
  // Using gemini-2.5-flash-image (Nano Banana)
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High quality 3D render, futuristic, cyber-organic style. ${prompt}` }],
    },
    // No responseMimeType for image models
  });

  // Find the image part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image generated");
};

export const generateCharacterSpeech = async (text: string, speaker: Speaker): Promise<string> => {
  const client = getAIClient();

  // Synapse = Kore (Calm/Deep), Spark = Fenrir (Energetic/Fast)
  const voiceName = speaker === 'Synapse' ? 'Kore' : 'Fenrir';

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("No audio generated");
  return audioData;
};
