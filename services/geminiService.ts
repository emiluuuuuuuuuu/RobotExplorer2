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

const OFFLINE_MESSAGE = "System analysis unavailable. Connection to network is required.";
const API_ERROR_MESSAGE_PREFIX = "Failed to retrieve technical specifications";

export const getPartDescription = async (partName: string): Promise<string> => {
  if (!navigator.onLine || !ai) {
    return OFFLINE_MESSAGE;
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
    return `${API_ERROR_MESSAGE_PREFIX} for ${partName}. The connection to the central database may be compromised.`;
  }
};

export const getTextToSpeech = async (text: string): Promise<string | null> => {
    // Do not attempt to generate speech if we are offline, the AI isn't configured,
    // or if the text is an error/offline message.
    if (!navigator.onLine || !ai || text === OFFLINE_MESSAGE || text.startsWith(API_ERROR_MESSAGE_PREFIX)) {
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