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
      
      ${questionPrompt}.
      
      Target Audience:
      - Students aged 12-14.
      - Keep explanations simple, vivid, and easy to digest.
      - Use metaphors suitable for this age group (e.g., computer networks, city traffic, school systems).

      Visual Instructions:
      - The 'imagePrompt' should be a vivid, interesting description that visualizes the specific scientific facts being discussed in that exchange.
      - Avoid generic "futuristic" descriptions. Instead, describe specific biological or technological processes in action (e.g., "A neuron firing an electrical impulse like a lightning bolt," or "Data packets traveling through a glowing fiber optic cable").
      - Make the images exciting and memorable for young teenagers.

      Output JSON format:
      {
        "question": "The question title",
        "exchanges": [
          { "speaker": "Synapse", "text": "...", "imagePrompt": "Detailed description of biological process..." },
          { "speaker": "Spark", "text": "...", "imagePrompt": "Detailed description of technological process..." },
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

export const generateLessonSummary = async (question: string, regionName: string): Promise<string[]> => {
  try {
    const client = getAIClient();

    if (!process.env.API_KEY) {
      return [
        "Neural Link Offline: Cannot retrieve live data.",
        "Local archives are available for basic review.",
        "Please check your connection to the central cortex."
      ];
    }

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 key educational takeaways for a student asking: "${question}" in the context of the "${regionName}" brain region.
      
      Return a JSON array of strings, e.g., ["Point 1", "Point 2", "Point 3"].
      Keep each point concise (under 15 words) and easy to understand for a young audience.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) throw new Error("No response from AI");

    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    if (Array.isArray(parsed)) {
      return parsed as string[];
    } else if (parsed.takeaways && Array.isArray(parsed.takeaways)) {
      return parsed.takeaways as string[];
    } else {
      // Fallback if structure is weird
      return [
        "The brain is complex and amazing.",
        "Each part has a special job.",
        "Keep exploring to learn more!"
      ];
    }

  } catch (error) {
    console.error("Error generating lesson summary:", error);
    return [
      "Error retrieving data from the bio-digital network.",
      "Signal interference detected in this sector.",
      "Try accessing the node again later."
    ];
  }
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-3
  explanation: string;
}

export const generateNeuronQuiz = async (
  question: string,
  regionName: string,
  summaryPoints: string[]
): Promise<QuizQuestion[]> => {
  try {
    const client = getAIClient();

    if (!process.env.API_KEY) {
      // Fallback Static Quiz
      return [
        {
          question: "What is the primary function of this brain region?",
          options: ["Processing visual information", "Controlling movement", "Storing memories", "Regulating heartbeat"],
          correctAnswer: 0,
          explanation: "Simulation Mode: Offline fallback data."
        },
        {
          question: "Which character explains the biological aspects?",
          options: ["Spark", "Synapse", "Neuron", "Cortex"],
          correctAnswer: 1,
          explanation: "Synapse is the biological expert."
        },
        {
          question: "Which character explains the technical aspects?",
          options: ["Spark", "Synapse", "Axon", "Dendrite"],
          correctAnswer: 0,
          explanation: "Spark is the digital/tech expert."
        },
        {
          question: "True or False: The brain uses electricity.",
          options: ["True", "False", "Only when sleeping", "Never"],
          correctAnswer: 0,
          explanation: "Neurons communicate via electrical signals."
        },
        {
          question: "What did you learn from the summary?",
          options: ["Nothing", "Something cool", "The summary points", "Everything"],
          correctAnswer: 2,
          explanation: "Review the summary to reinforce learning."
        }
      ];
    }

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a 5-question multiple-choice quiz about "${question}" in relation to the "${regionName}".
      
      Context:
      - Summary Points: ${JSON.stringify(summaryPoints)}
      - Dialogue Context: Synapse (biology) and Spark (tech) discussed this.
      
      Requirements:
      - Questions 1-3 should test the Summary Points provided.
      - Questions 4-5 should be about the general concept or the characters (Synapse/Spark).
      - Target audience: Young students.
      - Return ONLY a JSON array of objects.
      
      JSON Structure:
      [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Index of correct option (0-3)
          "explanation": "Brief explanation of why it's correct"
        }
      ]`,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) throw new Error("No response from AI");

    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    if (Array.isArray(parsed)) {
      return parsed as QuizQuestion[];
    } else if (parsed.quiz && Array.isArray(parsed.quiz)) {
      return parsed.quiz as QuizQuestion[];
    } else {
      throw new Error("Invalid quiz format");
    }

  } catch (error) {
    console.error("Error generating quiz:", error);
    // Return fallback on error
    return [
      {
        question: "Connection disrupted. What should you do?",
        options: ["Panic", "Try again later", "Reboot", "Call Spark"],
        correctAnswer: 1,
        explanation: "Neural link unstable."
      }
    ] as QuizQuestion[];
  }
};
