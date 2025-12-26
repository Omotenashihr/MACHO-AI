import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FoodAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isFood: { type: Type.BOOLEAN, description: "True if the image/document contains ANY food item." },
    name: { type: Type.STRING, description: "Short name of the food item found (in Japanese)." },
    calories: { type: Type.INTEGER, description: "Estimated total calories (kcal)." },
    protein_g: { type: Type.INTEGER, description: "Estimated protein in grams." },
    fat_g: { type: Type.INTEGER, description: "Estimated fat in grams." },
    carbs_g: { type: Type.INTEGER, description: "Estimated carbohydrates in grams." },
    sugar_g: { type: Type.INTEGER, description: "Estimated sugar content in grams." },
    isUnhealthy: { type: Type.BOOLEAN, description: "True if high in sugar, highly processed, contains many additives, or is 'junk food'." },
    reasoning: { type: Type.STRING, description: "Short comment from the perspective of a fitness coach character (in Japanese)." },
  },
  required: ["isFood", "name", "calories", "protein_g", "fat_g", "carbs_g", "sugar_g", "isUnhealthy", "reasoning"],
};

export const analyzeFoodImage = async (base64Data: string, mimeType: string): Promise<FoodAnalysis> => {
  try {
    const modelId = "gemini-2.0-flash";

    const isPdf = mimeType === 'application/pdf';
    const promptText = isPdf 
        ? "あなたはフィットネス栄養士です。このドキュメント（メニュー、レシピ、食事リスト）を分析してください。食品（カレーやシチューなどの複合料理も含む）を特定し、栄養価を要約してください。nameとreasoningは必ず日本語で出力してください。"
        : "あなたはフィットネス栄養士です。この画像を分析してください。それが食べ物かどうか判定してください。重要：生の食材（野菜、肉）、単純な調理品（ステーキ）、複雑な料理（カレー、シチュー、スープ）など、あらゆる種類の食品を認識してください。表示されている部分の合計栄養成分（カロリー、タンパク質、脂質、炭水化物）を推定してください。ジャンクフードやお菓子、添加物の多そうな加工食品の場合は isUnhealthy を true にしてください。JSONを返してください。nameとreasoningは必ず日本語で出力してください。";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const result = JSON.parse(jsonText) as FoodAnalysis;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      isFood: false,
      name: "不明な物体",
      calories: 0,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
      sugar_g: 0,
      isUnhealthy: false,
      reasoning: "解析できませんでした。別の画像を試してください。",
    };
  }
};