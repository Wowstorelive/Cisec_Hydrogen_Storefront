// app/routes/api.search.tsx
import { json } from '@remix-run/node';
import { searchProducts } from '~/services/vertexai/search.server';

export async function loader({ request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  const results = await searchProducts(query);

  return json({ results });
}
