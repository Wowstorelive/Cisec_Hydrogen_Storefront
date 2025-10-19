// app/services/vertexai/trackEvent.server.ts
import { Retail } from '@google-cloud/retail';

export async function trackUserEvent(
  eventType: string,
  userId: string | null,
  visitorId: string,
  productDetails?: any[],
  searchQuery?: string,
  cartDetails?: any,
  // Add more event-specific details as needed
) {
  const client = new Retail.UserEventServiceClient();
  const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const userEvent: any = {
    eventType,
    visitorId,
    productDetails,
    searchQuery,
    cart: cartDetails,
    // Add more fields based on eventType
  };

  if (userId) {
    userEvent.userId = userId;
  }

  await client.writeUserEvent({
    parent: `projects/${PROJECT_ID}/locations/global/catalogs/default_catalog`,
    userEvent: userEvent,
  });
}