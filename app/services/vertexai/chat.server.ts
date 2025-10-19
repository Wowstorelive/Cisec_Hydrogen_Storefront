// app/services/vertexai/chat.server.ts
import { VertexAI } from '@google-cloud/vertexai';

export async function getChatResponse(message, context) {
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1'
  });

  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-pro'
  });

  const chat = model.startChat({
    history: context.history || [],
    systemInstruction: `
      You are a helpful shopping assistant for Wow Store, an e-commerce site
      specializing in lifestyle products, women's fashion, jewelry, and home essentials.

      Your role:
      - Help customers find products
      - Answer questions about products, shipping, returns
      - Suggest complementary items
      - Be friendly and create "wow moments"

      Store policies:
      - Free shipping on orders €69+
      - 15-day free returns
      - 24/7 customer support
    `
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}
