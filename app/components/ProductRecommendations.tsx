// app/components/ProductRecommendations.tsx
import { useEffect, useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { ProductCard } from '~/components/ProductCard';

export function ProductRecommendations({ productId, type = 'similar-items' }) {
  const fetcher = useFetcher();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (productId) {
      fetcher.load(`/api/recommendations?productId=${productId}&type=${type}`);
    }
  }, [productId, type]);

  useEffect(() => {
    if (fetcher.data?.recommendations) {
      setRecommendations(fetcher.data.recommendations);
    }
  }, [fetcher.data]);

  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="recommendations">
      <h2>You May Also Like</h2>
      <div className="product-grid">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
