import { GoogleGenAI } from "@google/genai";

// Per coding guidelines, the API key is assumed to be available in the environment.
// The GoogleGenAI constructor will handle initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getPartDescription = async (partName: string): Promise<string> => {
  // Check for offline status before making an API call.
  if (!navigator.onLine) {
    throw new Error("System offline. Network connection is required for enhanced diagnostics.");
  }

  try {
    const prompt = `Generate a concise, one-sentence technical description for a robot's "${partName}". Explain its primary function clearly and directly.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    
    // Ensure the response contains text.
    if (!text) {
      throw new Error("API returned an empty response.");
    }

    return text;
  } catch (error) {
    console.error(`Error fetching description for "${partName}":`, error);
    // Re-throw a more generic error to be handled by the UI.
    // The specific error is logged to the console for debugging.
    throw new Error("Could not connect to Gemini API.");
  }
};
