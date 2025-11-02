import React from 'react';
import Bracelet from './Bracelet';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';

const TypedLink = Link as React.ComponentType<{to: string; children: React.ReactNode; style?: React.CSSProperties}>;

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
  averageRating?: number;
  reviewCount?: number;
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
        <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {item.averageRating ? (
              <>
                <div className="rating-stars">{'★'.repeat(Math.round(item.averageRating))}{'☆'.repeat(5 - Math.round(item.averageRating))}</div>
                <small>({item.reviewCount} reviews)</small>
              </>
            ) : (
              <small>No reviews yet</small>
            )}
            <TypedLink 
              to={`/reviews/${item.id}`} 
              style={{marginLeft:'auto',fontSize:'0.9em',color:'var(--primary-color)'}}
            >
              View Reviews
            </TypedLink>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <strong>${(item.price || 0).toFixed(2)}</strong>
              <small style={{marginLeft:8,color:item.inventory && item.inventory > 0 ? '#2ecc71' : '#e74c3c'}}>
                {item.inventory && item.inventory > 0 ? `${item.inventory} in stock` : 'Out of stock'}
              </small>
            </div>
            <button 
              onClick={handleAdd} 
              className="btn-buy" 
              disabled={!item.inventory || item.inventory <= 0}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
