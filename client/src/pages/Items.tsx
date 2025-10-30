import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BraceletCard from '../components/BraceletCard';

type Item = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  size?: string;
  colors?: string[];
  pattern?: string;
  price?: number;
};

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/items')
      .then((r) => setItems(r.data.results || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h2 className="section-title">Shop Bracelets</h2>
      {loading && <p>Loading...</p>}

      <div className="product-grid">
        {items.map((it) => (
          <BraceletCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}
