// app/routes/api.bundle.tsx
import { json } from '@remix-run/node';
import { generateProductBundle } from '~/services/vertexai/generateBundle.server';

export async function action({ request }) {
  const { products, theme } = await request.json();

  if (!products || !Array.isArray(products) || products.length === 0) {
    return json({ error: 'Products array is required' }, { status: 400 });
  }

  const bundleText = await generateProductBundle(products, theme);

  // Parse the bundleText into a structured object
  // IMPORTANT: This is a basic parsing. For production, consider:
  // 1. Instructing Gemini to output a JSON object directly for easier parsing.
  // 2. Implementing more robust parsing logic to handle variations in Gemini's text output.
  const bundle = parseBundleText(bundleText);

  return json({ bundle });
}

function parseBundleText(text: string) {
  const bundle: any = {};
  const lines = text.split('\n').filter(line => line.trim() !== '');

  lines.forEach(line => {
    if (line.startsWith('1. Bundle name:')) {
      bundle.name = line.replace('1. Bundle name:', '').trim();
    } else if (line.startsWith('2. Bundle description:')) {
      bundle.description = line.replace('2. Bundle description:', '').trim();
    } else if (line.startsWith('3. Why these items work together')) {
      // This line is a header, the next lines will be the explanation
      // For simplicity, we'll just add the next line as explanation
      // In a real scenario, you might want to parse multiple lines
    } else if (line.startsWith('4. Suggested discount percentage:')) {
      bundle.discount = parseFloat(line.replace('4. Suggested discount percentage:', '').trim());
    }
  });

  // Placeholder for products, originalPrice, bundlePrice
  // These would need to be calculated based on the actual products in the bundle
  bundle.products = [];
  bundle.originalPrice = 0;
  bundle.bundlePrice = 0;

  return bundle;
}
