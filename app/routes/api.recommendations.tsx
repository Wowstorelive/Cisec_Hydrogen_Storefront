// app/routes/api.recommendations.tsx
import { json } from '@remix-run/node';
import { getRecommendations } from '~/services/vertexai/recommendations.server';

export async function loader({ request }) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const type = url.searchParams.get('type') || 'similar-items'; // Default to similar-items

  if (!productId) {
    return json({ error: 'productId is required' }, { status: 400 });
  }

  const recommendations = await getRecommendations(productId, type);

  return json({ recommendations });
}
