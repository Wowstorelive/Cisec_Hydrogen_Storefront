// app/components/ProductCard.tsx
import React from 'react';
import { Link } from '@remix-run/react';

export function ProductCard({ product }: { product: any }) {
  return (
    <div className="product-card">
      <Link to={`/products/${product.handle}`}>
        <img src={product.images?.[0]?.uri} alt={product.title} />
        <h3>{product.title}</h3>
        {product.attributes?.vendor?.text?.[0] && (
          <p className="vendor">{product.attributes.vendor.text[0]}</p>
        )}
        <p>{product.description}</p>
        <p className="price">€{product.priceInfo?.price}</p>
      </Link>
    </div>
  );
}
