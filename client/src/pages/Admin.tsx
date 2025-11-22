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

interface Order {
  id: string;
  items: Array<{ id: string; qty: number; title?: string; price?: number }>;
  buyer: { name: string; email: string };
  shipped: boolean;
  shippedAt: string | null;
  createdAt: string;
  total: number;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [view, setView] = useState<'dashboard' | 'inventory'>('dashboard');
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
      loadOrders();
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

  async function loadOrders() {
    try {
      const response = await axios.get('/api/orders');
      if (response.data.ok) {
        // Enrich orders with item details
        const enrichedOrders = response.data.orders.map((order: Order) => {
          const enrichedItems = order.items.map(orderItem => {
            const item = items.find(i => i.id === orderItem.id);
            return {
              ...orderItem,
              title: item?.title || 'Unknown Item',
              price: item?.price || 0
            };
          });
          const total = enrichedItems.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
          return { ...order, items: enrichedItems, total };
        });
        setOrders(enrichedOrders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
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

  async function toggleShipped(orderId: string, currentStatus: boolean) {
    try {
      await axios.put(`/api/orders/${orderId}`, { shipped: !currentStatus });
      await loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
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

    // create an SVG that embeds the raster image and scales to 600x600
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
    <div className="page admin-page">
      <div className="admin-header">
        <h2 className="admin-title">Admin Dashboard</h2>
        <div className="admin-nav">
          <button 
            className={`admin-nav-btn ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            📊 Orders
          </button>
          <button 
            className={`admin-nav-btn ${view === 'inventory' ? 'active' : ''}`}
            onClick={() => setView('inventory')}
          >
            📦 Inventory
          </button>
        </div>
      </div>

      {view === 'dashboard' && (
        <div className="dashboard-view">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{orders.filter(o => o.shipped).length}</div>
              <div className="stat-label">Shipped</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{orders.filter(o => !o.shipped).length}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="orders-section">
            <h3>Recent Orders</h3>
            {orders.length === 0 ? (
              <div className="empty-state">No orders yet</div>
            ) : (
              <div className="orders-grid">
                {orders.map(order => (
                  <div key={order.id} className={`order-card ${order.shipped ? 'shipped' : 'pending'}`}>
                    <div className="order-header">
                      <div>
                        <div className="order-id">Order #{order.id.slice(0, 8)}</div>
                        <div className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className={`order-status ${order.shipped ? 'shipped' : 'pending'}`}>
                        {order.shipped ? '✓ Shipped' : '○ Pending'}
                      </div>
                    </div>
                    
                    <div className="order-buyer">
                      <strong>{order.buyer?.name || 'Anonymous'}</strong>
                      <span>{order.buyer?.email || 'No email'}</span>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.title || 'Unknown'}</span>
                          <span className="item-qty">×{item.qty}</span>
                          <span className="item-price">${((item.price || 0) * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-footer">
                      <div className="order-total">Total: ${order.total.toFixed(2)}</div>
                      <button 
                        className={`ship-btn ${order.shipped ? 'unship' : 'ship'}`}
                        onClick={() => toggleShipped(order.id, order.shipped)}
                      >
                        {order.shipped ? 'Mark Unshipped' : 'Mark Shipped'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'inventory' && (
        <div className="inventory-view">
          <div className="inventory-layout">
            <div className="existing-items-section">
              <h3>Current Inventory</h3>
              <div className="items-list">
                {items.length === 0 ? (
                  <div className="empty-state">No items yet</div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="item-row">
                      <div className="item-info">
                        <strong>{item.title}</strong>
                        <span className="item-price">${item.price.toFixed(2)}</span>
                        <span className={`item-stock ${item.inventory === 0 ? 'out-of-stock' : ''}`}>
                          Stock: {item.inventory || 0}
                        </span>
                      </div>
                      <div className="item-actions">
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
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="delete-button"
                          type="button"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="item-form-section">
              <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <form className="item-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="title">Title</label>
                  <input 
                    id="title"
                    type="text"
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Rainbow Smile Bracelet"
                    required 
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="description">Description</label>
                  <textarea 
                    id="description"
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Beautiful handmade bracelet..."
                    rows={3} 
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="category">Category</label>
                    <input 
                      id="category"
                      type="text"
                      value={category} 
                      onChange={e => setCategory(e.target.value)} 
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="size">Size</label>
                    <select id="size" value={size} onChange={e => setSize(e.target.value)}>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="colors">Colors (comma separated)</label>
                    <input 
                      id="colors"
                      type="text"
                      value={colors} 
                      onChange={e => setColors(e.target.value)} 
                      placeholder="gold, cream, pink"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="pattern">Pattern</label>
                    <input 
                      id="pattern"
                      type="text"
                      value={pattern} 
                      onChange={e => setPattern(e.target.value)} 
                      placeholder="rainbow, wave, etc"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label htmlFor="price">Price (USD)</label>
                    <input 
                      id="price"
                      type="number" 
                      step="0.01" 
                      value={price as any} 
                      onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                      placeholder="9.99"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="inventory">Inventory</label>
                    <input 
                      id="inventory"
                      type="number" 
                      min="0" 
                      value={inventory} 
                      onChange={e => setInventory(Number(e.target.value))} 
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="image">Upload Image</label>
                  <input 
                    id="image"
                    ref={fileRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleFile(e.target.files?.[0])} 
                    className="file-input"
                  />
                  <div className="file-help">Accepts SVG, PNG, or JPG</div>
                </div>

                {imageSvg && (
                  <div className="image-preview">
                    <label>Preview</label>
                    <div className="svg-preview" dangerouslySetInnerHTML={{ __html: imageSvg }} />
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingItem ? '💾 Update Item' : '➕ Add Item'}
                  </button>
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
                      className="cancel-btn"
                    >
                      ✖ Cancel
                    </button>
                  )}
                </div>

                {status && <div className="form-status">{status}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
