import { GoogleGenAI } from "@google/genai";
import { IndianLanguage } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only when needed to avoid issues if key is missing during initial load (though it should be there)
const getAiClient = () => {
  if (!apiKey) {
    console.warn("API Key is missing!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const translateName = async (text: string, targetLanguage: IndianLanguage): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return text;

  try {
    const prompt = `Translate the name or phrase "${text}" into ${targetLanguage} script. Return ONLY the translated text, no explanation.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export const generateFamilyHistory = async (members: any[], language: IndianLanguage): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI service unavailable.";

    try {
        const prompt = `Based on the following family tree structure, write a short, poetic summary of the family legacy in ${language} language. Keep it under 100 words. Structure: ${JSON.stringify(members.map(m => ({name: m.name, relation: m.relationType})))}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text?.trim() || "";
    } catch (e) {
        console.error(e);
        return "";
    }
}
