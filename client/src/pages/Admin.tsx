import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bracelet');
  const [size, setSize] = useState('medium');
  const [colors, setColors] = useState('pastel');
  const [pattern, setPattern] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [status, setStatus] = useState('');
  const [imageSvg, setImageSvg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // read uploaded file and convert to SVG string if necessary
  async function handleFile(file?: File) {
    if (!file) return;
    const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
    if (isSvg) {
      const text = await file.text();
      setImageSvg(text);
      return;
    }

    // for raster images, embed them into a simple SVG wrapper as data URL
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(String(reader.result));
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

    // create an SVG that embeds the raster image and scales to 300x300
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'>\n  <rect width='100%' height='100%' fill='none'/>\n  <image href='${dataUrl}' x='0' y='0' width='100%' height='100%' preserveAspectRatio='xMidYMid meet'/></svg>`;
    setImageSvg(svg);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const doc = {
        title,
        description,
        category,
        size,
        colors: colors.split(',').map(c => c.trim()).filter(Boolean),
        pattern,
        price: typeof price === 'number' ? price : parseFloat(String(price) || '0'),
        imageSvg,
        createdAt: new Date()
      };

      await axios.post('/api/items', doc);
      setStatus('Saved');
      // reset
      setTitle('');
      setDescription('');
      setPattern('');
      setPrice('');
      setColors('');
      setImageSvg(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error(err);
      setStatus('Error saving item');
    }
  }

  return (
    <div className="page">
      <h2 className="section-title">Admin — Add Bracelet</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="form-row">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label>Category</label>
            <input value={category} onChange={e => setCategory(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Size</label>
            <select value={size} onChange={e => setSize(e.target.value)}>
              <option>small</option>
              <option>medium</option>
              <option>large</option>
              <option>custom</option>
            </select>
          </div>

          <div className="form-row">
            <label>Colors (comma separated)</label>
            <input value={colors} onChange={e => setColors(e.target.value)} placeholder="gold, cream" />
          </div>

          <div className="form-row">
            <label>Pattern</label>
            <input value={pattern} onChange={e => setPattern(e.target.value)} />
          </div>

          <div className="form-row">
            <label>Price (USD)</label>
            <input type="number" step="0.01" value={price as any} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div className="form-row">
          <label>Upload image (SVG or raster)</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} />
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
          <button type="submit" className="cta">Save Item</button>
          <div style={{color:'#666'}}>{status}</div>
        </div>
      </form>

      <div style={{marginTop:20}}>
        <h3>Preview</h3>
        {imageSvg ? (
          <div className="svg-preview" dangerouslySetInnerHTML={{ __html: imageSvg }} />
        ) : (
          <p>No image uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
