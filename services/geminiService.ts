
import { GoogleGenAI, Type } from "@google/genai";
import { DailyVerse, StudyPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_VERSES: DailyVerse[] = [
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
    reflection: "In moments of weakness, remember that your strength doesn't come from your own reserves, but from the infinite grace of God. You are never alone in your struggles.",
    prayer: "Lord, help me to lean on Your strength today and trust in Your plan for my life."
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reflection: "We often try to figure everything out on our own. This verse reminds us that true peace comes from surrender and trusting in the divine wisdom that sees the whole map when we only see the next step.",
    prayer: "Father, I surrender my worries and my plans to You. Guide my steps and keep my heart aligned with Your will."
  },
  {
    reference: "Isaiah 41:10",
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
    reflection: "Fear is a powerful emotion, but God's presence is more powerful. Knowing that the Creator of the universe is holding your hand changes your perspective on any challenge.",
    prayer: "Heavenly Father, replace my fear with Your peace. Thank You for being my constant source of strength."
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reflection: "The world demands constant hustle, but Jesus offers a different rhythm. He invites us to lay down our heavy packs and find true soul-rest in His grace.",
    prayer: "Lord, I come to You today feeling tired. I accept Your invitation to rest and be renewed by Your Spirit."
  }
];

export const getDailyVerse = async (theme?: string): Promise<DailyVerse> => {
  const prompt = theme 
    ? `Provide a comforting Bible verse and a short reflection about "${theme}".`
    : `Provide a meaningful daily Bible verse and a short spiritual reflection for today.`;

  try {
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

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.reference || !parsed.text) throw new Error("Invalid API response");
    return parsed;
  } catch (error) {
    console.warn("Gemini API error (likely quota). Using fallback verse.", error);
    // Return a random verse from the fallback list
    const randomIndex = Math.floor(Math.random() * FALLBACK_VERSES.length);
    return FALLBACK_VERSES[randomIndex];
  }
};

export const generateStudyPlan = async (topic: string): Promise<StudyPlan> => {
  try {
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

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to generate plan", error);
    throw new Error("I'm sorry, our wisdom engine is currently resting. Please try again in a few minutes.");
  }
};

export const askBibleQuestion = async (question: string, context?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a helpful and wise Bible study assistant. Please answer this question from a biblical perspective: "${question}". ${context ? `Consider the following context: ${context}` : ''}`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "I'm sorry, I couldn't process that question right now.";
  } catch (error) {
    console.error("AskAI Error:", error);
    return "The AI assistant is currently experiencing high volume. Please search your heart and your scriptures while we reconnect the service.";
  }
};
