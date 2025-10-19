// app/services/vertexai/indexProducts.server.ts
import { Retail } from '@google-cloud/retail';

export async function indexProductsToVertexAI(products) {
  const client = new Retail.ProductServiceClient();
  const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;

  const formattedProducts = products.map(product => ({
    name: `projects/${PROJECT_ID}/locations/global/catalogs/default_catalog/branches/default_branch/products/${product.id}`,
    id: product.id,
    title: product.title,
    description: product.description,
    categories: product.productType ? [product.productType] : [],
    priceInfo: {
      price: parseFloat(product.variants[0].price),
      currencyCode: 'EUR'
    },
    availability: product.availableForSale ? 'IN_STOCK' : 'OUT_OF_STOCK',
    images: product.images.map(img => ({ uri: img.url })),
    attributes: {
      vendor: { text: [product.vendor] },
      tags: { text: product.tags }
    }
  }));

  // Batch import products
  await client.importProducts({
    parent: `projects/${PROJECT_ID}/locations/global/catalogs/default_catalog/branches/default_branch`,
    inputConfig: {
      productInlineSource: {
        products: formattedProducts
      }
    }
  });
}
