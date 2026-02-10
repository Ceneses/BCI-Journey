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
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            briefing: { type: Type.STRING },
            funFact: { type: Type.STRING },
          },
          required: ["title", "briefing", "funFact"],
        },
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

export const generateSimulationScript = async (regionName: string): Promise<SimulationScript> => {
  const client = getAIClient();
  const response = await client.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a dialogue for a game level in the ${regionName}.
    Characters:
    - Synapse: Biological, calm, deep focus.
    - Spark: Digital, energetic, tech focus.
    
    Create 1 Question about this brain region and a 3-part dialogue explaining it.
    
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
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          exchanges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate script");
  return JSON.parse(response.text) as SimulationScript;
};

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
