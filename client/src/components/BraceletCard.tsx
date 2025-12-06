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
  imageSvg?: string;
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

  // Helper: is SVG markup?
  function isSvg(content: string) {
    return content.trim().startsWith('<svg');
  }

  // Derive a reliable review count from available fields
  const derivedReviewCount: number = (typeof item.reviewCount === 'number' ? item.reviewCount : ((item as any).reviews && Array.isArray((item as any).reviews) ? (item as any).reviews.length : 0)) || 0;

  return (
    <div className="product-card" style={{display:'flex',flexDirection:'column',minHeight:380}}>
      <div style={{padding:'8px 12px', display:'flex', flexDirection:'column', flex:1}}>
        <h3 style={{margin:'6px 0'}}>{item.title}</h3>
        <div style={{display:'flex',justifyContent:'center',padding:12}}>
          <div data-test-id="product-image-container" style={{width:160, height:160, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', overflow:'hidden', borderRadius:16}}>
            {item.imageSvg ? (
              isSvg(item.imageSvg) ? (
                <div data-test-id="product-image-svg" style={{width:'100%', height:'100%', maxWidth:140, maxHeight:120, display:'flex', alignItems:'center', justifyContent:'center'}} dangerouslySetInnerHTML={{ __html: item.imageSvg }} />
              ) : (
                <img data-test-id="product-image" src={item.imageSvg} alt={item.title || 'Bracelet'} style={{width:'100%', height:'100%', maxWidth:140, maxHeight:120, objectFit:'contain', borderRadius:12, background:'#f8f8f8', display:'block', margin:'0 auto'}} />
              )
            ) : (
              <Bracelet data-test-id="product-image-fallback" size={140} />
            )}
          </div>
        </div>
        <p style={{margin:'6px 0',color:'#6b5b57'}}>{item.description}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8,minHeight:40,alignItems:'center'}}>
          <small>Size: {item.size || 'n/a'}</small>
          <small>Pattern: {item.pattern || '—'}</small>
          <small>Colors: {(item.colors || []).join(', ') || '—'}</small>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:10,marginBottom:0, borderTop:'1px solid #eee', paddingTop:10}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'nowrap'}}>
            {item.averageRating ? (
              <>
                <div className="rating-stars">{'★'.repeat(Math.round(item.averageRating))}{'☆'.repeat(5 - Math.round(item.averageRating))}</div>
                {derivedReviewCount > 0 ? (
                  <small style={{whiteSpace:'nowrap'}}>({derivedReviewCount})</small>
                ) : null}
              </>
            ) : (
              <small style={{whiteSpace:'nowrap'}}>No reviews yet</small>
            )}
            {derivedReviewCount > 0 ? (
              <TypedLink 
                to={`/reviews/${item.id}`} 
                style={{marginLeft:'auto',fontSize:'0.9em',color:'var(--primary-color)',whiteSpace:'nowrap'}}
              >
                View Reviews
              </TypedLink>
            ) : null}
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
