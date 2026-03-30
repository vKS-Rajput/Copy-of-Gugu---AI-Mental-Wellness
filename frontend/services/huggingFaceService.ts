import { Message, GeminiResponse } from "../types";

const apiKey = import.meta.env.VITE_HF_API_KEY || '';
const modelId = import.meta.env.VITE_HF_MODEL_ID || 'meta-llama/Llama-3.1-8B-Instruct';

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
- "shouldRefer": Set to true when you believe the user would benefit from speaking with a human therapist. Set to false for casual conversations.
- "domain": When shouldRefer is true, classify the primary concern area. When shouldRefer is false, leave as empty string.
- "therapistSummary": When shouldRefer or isOutOfControl is true, write a professional clinical summary. When both are false, leave as empty string.

CRITICAL: Your entire response must be ONLY the JSON object. No markdown, no code fences, no extra text.
`;

export const sendMessageToHF = async (history: Message[], newMessage: string): Promise<GeminiResponse> => {
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
        // Build messages array in OpenAI-compatible format
        const messages: Array<{ role: string; content: string }> = [
            { role: 'system', content: SYSTEM_INSTRUCTION }
        ];

        // Add chat history
        for (const msg of history) {
            if (msg.role === 'user') {
                messages.push({ role: 'user', content: msg.text });
            } else if (msg.role === 'model') {
                messages.push({ role: 'assistant', content: msg.text });
            }
        }

        // Add the new user message
        messages.push({ role: 'user', content: newMessage });

        // Use the new HF Inference Providers endpoint (OpenAI-compatible)
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages,
                max_tokens: 800,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`HF API Error ${response.status}: ${errBody}`);
        }

        const data = await response.json();
        let rawText = '';

        // OpenAI-compatible response format
        if (data.choices && data.choices.length > 0) {
            rawText = data.choices[0].message?.content || '';
        } else {
            rawText = JSON.stringify(data);
        }

        // Parse the JSON response from the model
        try {
            let cleaned = rawText.trim();

            // Extract JSON object from the response
            const startIdx = cleaned.indexOf('{');
            const endIdx = cleaned.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                cleaned = cleaned.substring(startIdx, endIdx + 1);
            }

            const parsed = JSON.parse(cleaned) as GeminiResponse;
            return {
                response: parsed.response || '...',
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
        console.error("Hugging Face API Error:", error);
        return {
            response: "I'm having a little trouble connecting to my Hugging Face model at the moment. Please try again.",
            isOutOfControl: false,
            shouldRefer: false,
            domain: '',
            therapistSummary: ''
        };
    }
};
