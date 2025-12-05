import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, ChatMessage, AIResponseData, FoodLogEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We define the schema for the AI's response to ensure we get structured data for the app
// AND a conversational response for the chat UI.
const aiResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "A friendly, conversational response in the requested language. YOU MUST explicitly list the nutritional breakdown (Calories, Protein, Carbs, Fat) in this text so the user reads it directly.",
    },
    food_entry: {
      type: Type.OBJECT,
      nullable: true,
      description: "If the user mentions eating food, extract the nutritional data. If not, return null.",
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER, description: "Estimated protein in grams. Make an educated estimate based on ingredients, do not return 0 unless it's water." },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER },
        meal_type_suggestion: { type: Type.STRING, description: "Suggest: Breakfast, Lunch, Dinner, or Snack" }
      },
    },
    activity_entry: {
      type: Type.OBJECT,
      nullable: true,
      description: "If the user mentions performing a physical activity or exercise, estimate the calories burned. If not, return null.",
      properties: {
        name: { type: Type.STRING },
        calories_burned: { type: Type.NUMBER },
      },
    },
    daily_motivation: {
      type: Type.STRING,
      description: "A personalized, encouraging motivational quote or message based on their goal and progress.",
    },
    next_meal_suggestion: {
      type: Type.STRING,
      description: "A specific suggestion for their next meal based on what they have eaten so far and their remaining macros.",
    },
    food_analysis: {
      type: Type.ARRAY,
      description: "List of analysis for the foods mentioned in this specific message (if any).",
      items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            nutritional_highlight: { type: Type.STRING, description: "Brief highlight of key nutrients (e.g., 'High in fiber', 'Rich in Vitamin C')." },
            health_impact: { type: Type.STRING, description: "Short explanation of how this food affects the body (e.g., 'Boosts immunity', 'Provides sustained energy')." },
        }
      }
    },
    suggestion: {
      type: Type.STRING,
      description: "A short, actionable tip for the immediate future.",
    },
    sentiment: {
      type: Type.STRING,
      enum: ["positive", "neutral", "constructive"],
      description: "The tone of the critique.",
    }
  },
  required: ["reply", "suggestion", "sentiment", "daily_motivation", "next_meal_suggestion"],
};

export const analyzeMessage = async (
  message: string,
  base64Image: string | undefined,
  history: ChatMessage[],
  userProfile: UserProfile,
  dailyLogs: FoodLogEntry[]
): Promise<AIResponseData> => {
  
  const currentCalories = dailyLogs.reduce((acc, item) => acc + item.calories, 0);
  const targetCalories = userProfile.customCalorieTarget || userProfile.tdee;
  const lang = userProfile.language === 'id' ? 'Indonesian' : 'English';

  const systemInstruction = `
    You are NutriTrack AI, a highly intelligent, empathetic, and professional nutritionist. 
    User Profile: Age ${userProfile.age}, ${userProfile.gender}, Weight ${userProfile.weight}kg, Goal: ${userProfile.goal}.
    Daily Status: Consumed ${currentCalories} / ${targetCalories} kcal.
    Language: Reply strictly in ${lang}.
    
    Your Task:
    1. Analyze the user's input (text or image).
    2. If food is detected:
       - Estimate nutrition strictly (Calories, PROTEIN, Carbs, Fat).
       - IMPORTANT: In the 'reply' text, you MUST explicitly state the detailed values (e.g., "Contains approx 500 kcal, 25g Protein, ...") so the user sees the breakdown in the chat.
       - Provide a "food_analysis" for each item explaining its benefits/impact.
       - Ensure PROTEIN is never missed if the food contains it (e.g., meat, eggs, beans, rice).
    3. If activity is detected, estimate calories burned.
    4. Provide "daily_motivation" to keep them going.
    5. Suggest a "next_meal_suggestion" balancing their remaining macros.
    6. Maintain a friendly, non-judgmental tone. If they overeat, be kind but constructive.
    
    Output JSON format as defined in the schema.
  `;

  // Build content parts
  const parts: any[] = [];
  
  if (base64Image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    });
  }
  
  parts.push({ text: message });

  const recentHistory = history.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'AI'}: ${h.text}`).join('\n');
  const fullPrompt = `
    Previous Conversation:
    ${recentHistory}

    Current User Input:
    ${message}
  `;

  if (!base64Image) {
    // Text only request
    parts[0] = { text: fullPrompt };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: aiResponseSchema,
        temperature: 0.7, 
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("No response from AI");
    
    return JSON.parse(textResponse) as AIResponseData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: userProfile.language === 'id' ? "Maaf, saya mengalami kesalahan koneksi." : "Sorry, I encountered a connection error.",
      food_entry: null,
      activity_entry: null,
      suggestion: "",
      daily_motivation: userProfile.language === 'id' ? "Tetap semangat!" : "Keep going!",
      next_meal_suggestion: "",
      food_analysis: [],
      sentiment: "neutral"
    };
  }
};