// app/components/VertexSearch.tsx
import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { ProductCard } from '~/components/ProductCard'; // Import the ProductCard component

export function VertexSearch() {
  const [query, setQuery] = useState('');
  const fetcher = useFetcher();

  const handleSearch = (e) => {
    e.preventDefault();
    fetcher.load(`/api/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="vertex-search">
      <form onSubmit={handleSearch}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="search-input"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {fetcher.data?.results && (
        <div className="search-results">
          {fetcher.data.results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
