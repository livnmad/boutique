import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const cart = useCart();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.items.reduce((s: number, it: any) => s + (it.price || 0) * it.qty, 0);

  async function submit() {
    if (!cart.items.length) return;
    setLoading(true);
    try {
      const payload = {
        items: cart.items.map((i: any) => ({ id: i.id, qty: i.qty })),
        buyer: { name, email, address, city, state: stateVal, zip, phone, subscribe }
      };
      await axios.post('/api/orders', payload);
      cart.clear();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || 'Order failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page checkout-container">
      <h2 className="section-title">Checkout</h2>
      <div style={{display:'flex',gap:20,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{flex:'1 1 580px'}} className="checkout-items">
          <h3>Items</h3>
          {cart.items.map((it: any) => (
            <div key={it.id} className="checkout-item">
              <div style={{flex:'0 0 80px'}}>
                {/* placeholder thumbnail */}
                <div style={{width:72,height:72,borderRadius:8,background:'#fff6f2',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="#ffd1dc"/></svg>
                </div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{it.title}</div>
                <div style={{color:'#666'}}>${(it.price||0).toFixed(2)}</div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button disabled={it.qty<=1} onClick={() => cart.updateQty(it.id, Math.max(1, it.qty-1))}>-</button>
                <div>{it.qty}</div>
                <button disabled={typeof it.inventory==='number' && it.qty>=it.inventory} onClick={() => cart.updateQty(it.id, it.qty+1)}>+</button>
                <button onClick={() => cart.remove(it.id)}>Remove</button>
              </div>
            </div>
          ))}

          <div style={{marginTop:12}}>
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{width:360}} className="checkout-summary">
          <h3>Shipping & Contact</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div className="form-field"><label>Name</label><input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div className="form-field"><label>Email</label><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
            <div className="form-field"><label>Address</label><input placeholder="Street address" value={address} onChange={e=>setAddress(e.target.value)} /></div>
            <div className="form-grid-two">
              <div className="form-field"><label>City</label><input value={city} onChange={e=>setCity(e.target.value)} /></div>
              <div className="form-field"><label>State</label><input value={stateVal} onChange={e=>setStateVal(e.target.value)} /></div>
            </div>
            <div className="form-grid-two">
              <div className="form-field"><label>ZIP</label><input value={zip} onChange={e=>setZip(e.target.value)} /></div>
              <div className="form-field"><label>Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} /></div>
            </div>

            <label className="subscribe-row"><input type="checkbox" checked={subscribe} onChange={e=>setSubscribe(e.target.checked)} /> <span>Subscribe to promotions & updates about the charity</span></label>

            <button className="cta" onClick={submit} disabled={loading}>{loading? 'Placing...':'Place Order'}</button>
            <button style={{marginTop:8}} onClick={()=>navigate(-1)}>Back to shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}
