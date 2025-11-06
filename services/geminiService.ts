import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is always present.
  console.warn("API_KEY environment variable not set.");
}

// We check for API_KEY existence before initializing.
// If the key is missing, we create a "dummy" ai object
// that will allow the app to run without crashing, and our offline checks will handle the rest.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getPartDescription = async (partName: string): Promise<string> => {
  if (!navigator.onLine || !ai) {
    // Throw an error to be caught by the calling component.
    // This is more robust than returning a magic string.
    throw new Error("System is offline or API key is missing.");
  }

  try {
    const prompt = `Generate a concise, one-sentence technical description for a robot's "${partName}". Explain its primary function clearly and directly.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    // Re-throw the error to be handled by the component's catch block
    throw error;
  }
};