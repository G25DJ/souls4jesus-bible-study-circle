
import { GoogleGenAI, Type } from "@google/genai";
import { DailyVerse, StudyPlan } from "../types";

// Always use the prescribed initialization format.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyVerse = async (theme?: string): Promise<DailyVerse> => {
  const prompt = theme 
    ? `Provide a comforting Bible verse and a short reflection about "${theme}".`
    : `Provide a meaningful daily Bible verse and a short spiritual reflection for today.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reference: { type: Type.STRING },
          text: { type: Type.STRING },
          reflection: { type: Type.STRING },
          prayer: { type: Type.STRING },
        },
        required: ["reference", "text", "reflection", "prayer"],
      },
    },
  });

  // Extracting text from response.text property (not a method).
  return JSON.parse(response.text || '{}');
};

export const generateStudyPlan = async (topic: string): Promise<StudyPlan> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Create a comprehensive 7-day Bible study plan on the topic of "${topic}". Each day should include a specific scripture and a practical action step.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          overview: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                scripture: { type: Type.STRING },
                focus: { type: Type.STRING },
                actionStep: { type: Type.STRING },
              },
              required: ["day", "title", "scripture", "focus", "actionStep"],
            },
          },
        },
        required: ["topic", "overview", "days"],
      },
    },
  });

  // Extracting text from response.text property (not a method).
  return JSON.parse(response.text || '{}');
};

export const askBibleQuestion = async (question: string, context?: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a helpful and wise Bible study assistant. Please answer this question from a biblical perspective: "${question}". ${context ? `Consider the following context: ${context}` : ''}`,
    config: {
      temperature: 0.7,
    },
  });
  // Extracting text from response.text property (not a method).
  return response.text || "I'm sorry, I couldn't process that question right now.";
};
