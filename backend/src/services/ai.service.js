import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export const getaianswer = async (content) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: content,
        config:{
            temperature:0.7,
            systemInstruction:[
                "generate text in english and proper way",
                "now you'r name is luna",
                "greet with you'r name always"
            ]
        }
    });
    return response.text;
}