// app/components/ProductBundle.tsx
import React from 'react';
import { useFetcher } from '@remix-run/react';
import { ProductCard } from '~/components/ProductCard'; // Assuming ProductCard can display bundle items

export function ProductBundle({ bundle }) {
  const fetcher = useFetcher();

  const handleAddBundleToCart = () => {
    if (!bundle.products || bundle.products.length === 0) {
      return;
    }

    const lines = bundle.products.map(product => ({
      merchandiseId: product.id, // Assuming product.id is the merchandiseId
      quantity: 1, // Assuming quantity is 1 for each bundle item
    }));

    fetcher.submit(
      { lines: JSON.stringify(lines) },
      { method: 'post', action: '/cart', encType: 'application/json' } // Use /cart action
    );
  };

  if (!bundle || !bundle.name) {
    return null;
  }

  return (
    <div className="product-bundle">
      <h3>{bundle.name}</h3>
      <p>{bundle.description}</p>

      {bundle.products && bundle.products.length > 0 && (
        <div className="bundle-products">
          {bundle.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {bundle.originalPrice > 0 && bundle.bundlePrice > 0 && (
        <div className="bundle-pricing">
          <p className="original-price">€{bundle.originalPrice.toFixed(2)}</p>
          <p className="bundle-price">€{bundle.bundlePrice.toFixed(2)}</p>
          {bundle.discount > 0 && (
            <p className="savings">Save {bundle.discount}%!</p>
          )}
        </div>
      )}

      <button className="btn btn-secondary" onClick={handleAddBundleToCart}>
        Add Bundle to Cart
      </button>
    </div>
  );
}
