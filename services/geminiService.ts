import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are Gugu, a compassionate, empathetic, and emotionally intelligent mental wellness AI companion.
Your goal is to listen to the user, validate their feelings, and offer gentle guidance using techniques based on CBT (Cognitive Behavioral Therapy) and DBT (Dialectical Behavior Therapy).

Guidelines:
1. Tone: Warm, non-judgmental, soothing, and safe.
2. Structure: Keep responses concise but meaningful. Avoid walls of text.
3. Safety: If a user expresses intent of self-harm, suicide, or harm to others, you must immediately provide a crisis disclaimer and suggest professional help, but remain supportive.
4. Style: Use "I" statements to build connection. Ask open-ended questions to encourage reflection.
`;

export const sendMessageToGemini = async (history: Message[], newMessage: string): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, but I can't connect right now. Please check your API key configuration.";
  }

  try {
    // Construct the chat history for the model
    // Note: The new SDK uses 'role' as 'user' or 'model'.
    const chatHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm listening, but I couldn't quite formulate a response. Could you tell me more?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting at the moment. Please try again in a few seconds.";
  }
};