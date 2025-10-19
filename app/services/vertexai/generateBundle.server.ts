// app/services/vertexai/generateBundle.server.ts
import { VertexAI } from '@google-cloud/vertexai';

export async function generateProductBundle(products, theme) {
  const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1'
  });

  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-pro'
  });

  const prompt = `
    Create a compelling product bundle with these items:
    ${products.map(p => `- ${p.title}: ${p.description}`).join('\n')}

    Theme: ${theme}

    Provide:
    1. Bundle name (catchy and relevant)
    2. Bundle description (2-3 sentences)
    3. Why these items work together
    4. Suggested discount percentage
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
