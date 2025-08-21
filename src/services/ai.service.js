import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({});

export const textgenerator = async (content) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: content
    });

    return response.text;
}

export const texttovector = async (content) => {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings[0].values
}