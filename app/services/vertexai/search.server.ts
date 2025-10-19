// app/services/vertexai/search.server.ts
import { Retail } from '@google-cloud/retail';

export async function searchProducts(query: string) {
  const client = new Retail.SearchServiceClient();
  const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const request = {
    placement: `projects/${PROJECT_ID}/locations/global/catalogs/default_catalog/placements/default_search`,
    query: query,
    pageSize: 10,
  };

  const [response] = await client.search(request);
  return response.results?.map((result: any) => result.product);
}
