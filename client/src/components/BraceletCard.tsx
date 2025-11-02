import React from 'react';
import Bracelet from './Bracelet';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

type Item = {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  size?: string;
  colors?: string[];
  pattern?: string;
  price?: number;
  inventory?: number;
};

export default function BraceletCard({ item }: { item: Item }) {
  const colors = item.colors && item.colors.length ? item.colors : ['#D95B6B'];

  // map color keywords to simple hexs for the SVG (fallbacks)
  const colorMap: Record<string, string> = {
    gold: '#D4AF37',
    cream: '#F5E6D6',
    pastel: '#F7CFE8',
    rainbow: '#FFB6C1',
    blue: '#6EC5E9',
    teal: '#2AB7A9',
    multicolor: '#F4A261',
    any: '#B2E0F4'
  };

  const beadColors = item.colors && item.colors.length
    ? item.colors.map(c => colorMap[c] || c)
    : ['#FFD1DC','#FFB6C1','#9FE2BF'];

  const cart = useCart();
  const navigate = useNavigate();

  function handleAdd() {
    const ci = { id: item.id || '', title: item.title || '', price: item.price || 0, qty: 1, inventory: item.inventory };
    cart.add(ci);
    // navigate to checkout immediately after adding
    navigate('/checkout');
  }

  return (
    <div className="product-card">
      <div style={{display:'flex',justifyContent:'center',padding:12}}>
        <div style={{width:160, height:160}}>
          <Bracelet size={160} />
        </div>
      </div>
      <div style={{padding:'8px 12px'}}>
        <h3 style={{margin:'6px 0'}}>{item.title}</h3>
        <p style={{margin:'6px 0',color:'#6b5b57'}}>{item.description}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
          <small>Size: {item.size || 'n/a'}</small>
          <small>Pattern: {item.pattern || '—'}</small>
          <small>Colors: {(item.colors || []).join(', ') || '—'}</small>
        </div>
        <div test-id='Add Button' style={{marginBottom:0,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <strong>${(item.price || 0).toFixed(2)}</strong>
          <button onClick={handleAdd} className="btn-buy">Add</button>
        </div>
      </div>
    </div>
  );
}
