import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/admin.css';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  colors: string[];
  pattern: string;
  price: number;
  inventory: number;
  imageSvg: string | null;
  createdAt: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('bracelet');
  const [size, setSize] = useState('medium');
  const [colors, setColors] = useState('pastel');
  const [pattern, setPattern] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [inventory, setInventory] = useState<number>(0);
  const [status, setStatus] = useState('');
  const [imageSvg, setImageSvg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      if (response.data.ok) {
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsBlocked(true);
        setLoginError('Access blocked due to multiple failed login attempts.');
      } else {
        setLoginError(err.response?.data?.message || 'Invalid credentials');
      }
      setPassword('');
    }
  }

  if (isBlocked) {
    return (
      <div className="page">
        <div className="login-container">
          <div className="login-blocked">
            <h2>Access Blocked</h2>
            <p>Your IP address has been blocked due to multiple failed login attempts.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <div className="login-container">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Admin Login</h2>
            {loginError && <div className="login-error">{loginError}</div>}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
        </div>
      </div>
    );
  }

  async function loadItems() {
    try {
      const response = await axios.get('/api/items');
      if (response.data.ok) {
        setItems(response.data.results);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await axios.delete(`/api/items/${id}`);
      if (response.data.ok) {
        setStatus('Item deleted successfully!');
        await loadItems();
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      setStatus('Error deleting item');
    }
  }

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
        inventory,
        imageSvg,
        ...(editingItem ? {} : { createdAt: new Date() })
      };

      if (editingItem) {
        await axios.put(`/api/items/${editingItem}`, doc);
        setStatus('Updated');
        setEditingItem(null);
      } else {
        await axios.post('/api/items', doc);
        setStatus('Saved');
      }

      // Refresh the items list
      await loadItems();
      
      // reset form
      setTitle('');
      setDescription('');
      setPattern('');
      setPrice('');
      setColors('');
      setImageSvg(null);
      setInventory(0);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error(err);
      setStatus(editingItem ? 'Error updating item' : 'Error saving item');
    }
  }

  return (
    <div className="page">
      <h2 className="section-title">Admin Dashboard</h2>
      
      <div className="admin-sections">
        <div className="existing-items">
          <h3>Existing Items</h3>
          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className="item-row">
                <div className="item-info">
                  <strong>{item.title}</strong>
                  <span>${item.price}</span>
                  <span>Stock: {item.inventory || 0}</span>
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button 
                    onClick={() => {
                      setEditingItem(item.id);
                      setTitle(item.title);
                      setDescription(item.description);
                      setCategory(item.category);
                      setSize(item.size);
                      setColors(item.colors.join(', '));
                      setPattern(item.pattern);
                      setPrice(item.price);
                      setInventory(item.inventory || 0);
                      setImageSvg(item.imageSvg);
                    }}
                    className="edit-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="delete-button"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="item-form">
          <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
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

              <div className="form-row">
                <label>Inventory</label>
                <input 
                  type="number" 
                  min="0" 
                  value={inventory} 
                  onChange={e => setInventory(Number(e.target.value))} 
                />
              </div>
            </div>

            <div className="form-row">
              <label>Upload image (SVG or raster)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} />
            </div>

            <div style={{display:'flex',gap:12,alignItems:'center',marginTop:8}}>
              <button type="submit" className="cta">{editingItem ? 'Update Item' : 'Save Item'}</button>
              {editingItem && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingItem(null);
                    setTitle('');
                    setDescription('');
                    setPattern('');
                    setPrice('');
                    setColors('');
                    setImageSvg(null);
                    setInventory(0);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="secondary"
                >
                  Cancel Edit
                </button>
              )}
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
      </div>
    </div>
  );
}
