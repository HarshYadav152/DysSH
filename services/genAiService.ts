import { GoogleGenAI, Type } from "@google/genai";
import { PROMPT_HANDWRITING, PROMPT_TEXTBOOK } from "../constants";

export const generateAnalysis = async (
    apiKey: string,
    base64Image: string,
    mode: 'TEXTBOOK' | 'HANDWRITING'
): Promise<string> => {
    const client = new GoogleGenAI({ apiKey });
    const prompt = mode === 'TEXTBOOK' ? PROMPT_TEXTBOOK : PROMPT_HANDWRITING;
    const modelId = 'gemini-2.5-flash';

    try {
        const response = await client.models.generateContent({
            model: modelId,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            }
        });

        return response.text || "I couldn't analyze that image clearly. Try taking another picture with better lighting!";
    } catch (error) {
        console.error("GenAI Error:", error);
        return "Oops! I had trouble connecting to my brain. Please check your internet or API key.";
    }
};
