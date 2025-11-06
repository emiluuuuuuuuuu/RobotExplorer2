import { GoogleGenAI } from "@google/genai";

// Store the client instance to reuse it across function calls.
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client.
 * This prevents the app from crashing on startup if the API key is missing or invalid.
 * @returns {GoogleGenAI} The initialized GoogleGenAI client.
 * @throws {Error} If the API_KEY environment variable is not set.
 */
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        // This error will be caught by the calling function's try-catch block.
        throw new Error("API_KEY environment variable not set.");
    }
    
    // Initialize the client and cache it for subsequent calls.
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};

export const getPartDescription = async (partName: string): Promise<string> => {
  if (!navigator.onLine) {
    throw new Error("System is offline.");
  }

  try {
    const client = getAiClient(); // Get the client just-in-time.
    const prompt = `Generate a concise, one-sentence technical description for a robot's "${partName}". Explain its primary function clearly and directly.`;
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    // Re-throw the error to be handled by the component's catch block.
    throw error;
  }
};
