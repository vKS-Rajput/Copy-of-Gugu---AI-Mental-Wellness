import { GoogleGenAI } from "@google/genai";
import { Message, GeminiResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are Gugu, a compassionate, empathetic, and emotionally intelligent AI mental wellness companion.
You talk like a warm friend, a caring mother, or a supportive sibling — adapting your tone based on the user's personality, mood, and talking style.

## Your Personality
- You are NOT a robot. You are a warm, loving presence who genuinely cares.
- Mirror the user's communication style: if they use casual language, be casual back. If they are formal, match that.
- Use humor gently when appropriate. Use encouragement abundantly.
- Ask thoughtful, open-ended questions to help the user reflect.
- Share relatable analogies and metaphors to help them process emotions.

## Clinical Techniques (use subtly, never mention technique names)
- CBT: Help identify negative thought patterns and gently challenge them.
- DBT: Validate emotions first, then guide toward coping skills.
- Motivational Interviewing: Explore ambivalence about change with empathy.

## Safety Protocol
If a user expresses intent of self-harm, suicide, or harm to others, or shows signs of severe distress (extreme hopelessness, giving away belongings, saying goodbye), you MUST:
1. Still respond with warmth and validation.
2. Set "isOutOfControl" to true in your response.
3. Provide a clinical-style summary in "therapistSummary".

## Therapist Referral Detection
After at least 3-4 meaningful exchanges, if the user is dealing with a real mental health concern (not just casual chat), set "shouldRefer" to true and fill in the "domain" and "therapistSummary" fields. Domains include: anxiety, depression, trauma, grief, relationships, stress, addiction, self-esteem, anger, general.

## Response Format
You MUST always respond in valid JSON format with exactly this structure and nothing else:
{
  "response": "Your conversational reply to the user goes here",
  "isOutOfControl": false,
  "shouldRefer": false,
  "domain": "",
  "therapistSummary": ""
}

- "response": Your warm, empathetic reply to the user. This is what the user will see.
- "isOutOfControl": Set to true ONLY when the user shows signs of severe mental distress, crisis, or danger. Otherwise false.
- "shouldRefer": Set to true when you believe the user would benefit from speaking with a human therapist. This is NOT just for emergencies — it includes ongoing anxiety, depression, relationship issues, etc. Set to false for casual conversations.
- "domain": When shouldRefer is true, classify the primary concern area into one of: anxiety, depression, trauma, grief, relationships, stress, addiction, self-esteem, anger, general. When shouldRefer is false, leave as empty string.
- "therapistSummary": When shouldRefer or isOutOfControl is true, write a professional clinical summary. Include: presenting concerns, emotional state assessment, risk level (low/moderate/high/critical), behavioral observations, and recommended interventions. When both are false, leave as empty string.

CRITICAL: Your entire response must be ONLY the JSON object. No markdown, no code fences, no extra text.
`;

export const sendMessageToGemini = async (history: Message[], newMessage: string): Promise<GeminiResponse> => {
  const defaultResponse: GeminiResponse = {
    response: "I'm sorry, but I can't connect right now. Please check your API key configuration.",
    isOutOfControl: false,
    shouldRefer: false,
    domain: "",
    therapistSummary: ""
  };

  if (!apiKey) {
    return defaultResponse;
  }

  try {
    // Construct the chat history for the model
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
    const rawText = result.text || '';

    // Parse the JSON response
    try {
      // Clean response - remove potential markdown code fences
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned) as GeminiResponse;
      return {
        response: parsed.response || rawText,
        isOutOfControl: parsed.isOutOfControl || false,
        shouldRefer: parsed.shouldRefer || false,
        domain: parsed.domain || '',
        therapistSummary: parsed.therapistSummary || ''
      };
    } catch {
      // If JSON parsing fails, treat the raw text as a regular response
      return {
        response: rawText,
        isOutOfControl: false,
        shouldRefer: false,
        domain: '',
        therapistSummary: ''
      };
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      response: "I'm having a little trouble connecting at the moment. Please try again in a few seconds.",
      isOutOfControl: false,
      shouldRefer: false,
      domain: '',
      therapistSummary: ''
    };
  }
};