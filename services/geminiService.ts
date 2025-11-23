import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameCommentary = async (score: number, causeOfDeath: string): Promise<string> => {
  try {
    const prompt = `
      You are a witty, slightly sarcastic, and retro arcade game announcer.
      The player just finished a game of Snake.
      
      Stats:
      - Score: ${score} (One point per food).
      - Cause of Death: ${causeOfDeath} (e.g., hit wall, bit self).
      
      Give a 1-sentence comment on their performance. 
      If the score is low (< 5), roast them gently. 
      If the score is high (> 20), praise them with arcade slang.
      Make it fun and memorable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Game Over!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Game Over! (Connection lost to AI mainframe)";
  }
};