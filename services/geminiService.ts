import { GoogleGenAI, Modality } from "@google/genai";

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

export const getTextToSpeech = async (text: string): Promise<string | null> => {
    // Do not attempt to generate speech if we are offline, the AI isn't configured.
    // Audio is non-critical, so we can just return null instead of throwing.
    if (!navigator.onLine || !ai) {
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A friendly, clear voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            // This can happen if the API returns a valid response but no audio data.
            console.warn("No audio data returned from API.");
            return null;
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null; // Return null on any error
    }
};