// app/services/vertexai/recommendations.server.ts
import { Retail } from '@google-cloud/retail';

export async function getRecommendations(productId: string, type: string) {
  const client = new Retail.PredictionServiceClient();
  const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const request = {
    placement: `projects/${PROJECT_ID}/locations/global/catalogs/default_catalog/placements/default_recommendation_${type}`,
    userEvent: {
      eventType: 'detail-page-view',
      visitorId: 'anonymous', // Replace with actual user ID if available
      productDetails: [{
        product: {
          id: productId
        }
      }]
    },
    pageSize: 5,
  };

  const [response] = await client.predict(request);
  return response.results?.map((result: any) => result.product);
}
