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
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // For filter dropdowns
  const beadTypes = ['Choker', 'Bracelet', 'Necklace'];
  // Static top 10 main colors
  const beadColors = [
    'Red', 'Blue', 'Yellow', 'Black', 'White', 'Green', 'Purple', 'Pink', 'Orange', 'Brown'
  ];
  const beadSizes = [
    'Small (6")',
    'Medium (7")',
    'Large (8")',
    'X-Large (10")',
    'Custom'
  ];

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/items')
      .then((r) => setItems(r.data.results || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Filter logic
  const filtered = items.filter(it => {
    // Only apply search if at least 3 characters, case-insensitive
    if (search.length >= 3) {
      const searchLower = search.toLowerCase();
      const titleLower = it.title?.toLowerCase() || '';
      const descLower = it.description?.toLowerCase() || '';
      if (!(titleLower.includes(searchLower) || descLower.includes(searchLower))) return false;
    }
    if (type && it.category !== type) return false;
    // Color filter: case-insensitive match
    if (color && !((it.colors || []).some(c => c?.toLowerCase() === color.toLowerCase()))) return false;
    if (size && it.size !== size) return false;
    return true;
  });

  return (
    <div className="page">
      <h2 className="section-title">Shop Bracelets</h2>
      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={type} onChange={e => setType(e.target.value)} className="filter-select">
          <option value="">All Types</option>
          {beadTypes.map(t => (
            <option key={t} value={t.toLowerCase()} style={{ textTransform: 'capitalize' }}>
              {t}
            </option>
          ))}
        </select>
        <select value={color} onChange={e => setColor(e.target.value)} className="filter-select">
          <option value="">All Colors</option>
          {beadColors.map(c => (
            <option key={c} value={c.toLowerCase()} style={{ textTransform: 'capitalize' }}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select value={size} onChange={e => setSize(e.target.value)} className="filter-select">
          <option value="">All Sizes</option>
          {beadSizes.map(s => (
            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
              {s}
            </option>
          ))}
        </select>
        {(type || color || size || search) && (
          <button
            className="filter-clear"
            onClick={() => {
              setType('');
              setColor('');
              setSize('');
              setSearch('');
              setRefreshKey(k => k + 1);
            }}
          >
            Clear
          </button>
        )}
      </div>
      {loading && <p>Loading...</p>}
      <div className="product-grid">
        {filtered.map((it) => (
          <BraceletCard key={it.id} item={it} />
        ))}
        {filtered.length === 0 && !loading && <div style={{padding:32,textAlign:'center',width:'100%'}}>No items found.</div>}
      </div>
    </div>
  );
}
