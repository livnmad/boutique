import React, { useState } from 'react';
import axios from 'axios';

type Item = { id?: string; title?: string; description?: string };

export default function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  async function doSearch() {
    setLoading(true);
    try {
      const r = await axios.get('/api/items', { params: { q } });
      setResults(r.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Search</h2>
      <div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
        <button onClick={doSearch}>Search</button>
      </div>
      {loading && <p>Searching...</p>}
      <ul>
        {results.map(r => (
          <li key={r.id}>{r.title} — {r.description}</li>
        ))}
      </ul>
    </div>
  );
}
