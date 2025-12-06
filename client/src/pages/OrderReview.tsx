import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../styles/reviews.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OrderReview() {
  const query = useQuery();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [validatedOrder, setValidatedOrder] = useState<any>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    const deepOrder = query.get('order');
    if (deepOrder) {
      setOrderIdInput(deepOrder.toUpperCase());
      validateOrder(deepOrder.toUpperCase());
    }
  }, []);

  async function validateOrder(orderId: string) {
    setError('');
    setSuccess('');
    try {
      const r = await axios.get(`/api/reviews/order/${orderId}`);
      if (r.data?.ok) {
        setValidatedOrder(r.data.order);
        setAlreadyReviewed(!!r.data.reviewed);
      }
    } catch (e: any) {
      setValidatedOrder(null);
      setAlreadyReviewed(false);
      setError('Order not found. Please check your order number.');
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const resp = await axios.post('/api/reviews/order', {
        orderId: orderIdInput.trim().toUpperCase(),
        name: form.name,
        rating: form.rating,
        comment: form.comment,
      });
      if (resp.data?.ok) {
        setSuccess('Thank you! Your review has been submitted.');
        setAlreadyReviewed(true);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error submitting review';
      setError(msg);
    }
  }

  return (
    <div className="page">
      <div className="reviews-container">
        <div className="item-header">
          <h2>Order Review</h2>
          <p>Enter your 6-character order number to leave one review for your purchase.</p>
        </div>

        <div className="review-form">
          <form onSubmit={(e)=>{ e.preventDefault(); validateOrder(orderIdInput.trim().toUpperCase()); }}>
            <div className="form-group">
              <label>Order Number:</label>
              <input
                type="text"
                value={orderIdInput}
                onChange={e=>setOrderIdInput(e.target.value.toUpperCase())}
                placeholder="e.g., AB12CD"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="cta">Validate Order</button>
          </form>
        </div>

        {validatedOrder && (
          <div className="reviews-section">
            <h3>Order #{validatedOrder.id}</h3>
            <div className="order-items" style={{marginBottom:12}}>
              {(validatedOrder.items || []).map((it: any, idx: number) => (
                <div key={idx} className="order-item">
                  <span>{it.id}</span>
                  <span className="item-qty">×{it.qty}</span>
                </div>
              ))}
            </div>

            {alreadyReviewed ? (
              <div className="success-message">A review has already been submitted for this order.</div>
            ) : (
              <div className="review-form">
                <h4>Write Your Review</h4>
                <form onSubmit={submitReview}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Rating:</label>
                    <select value={form.rating} onChange={e=>setForm({...form, rating: Number(e.target.value)})}>
                      {[5,4,3,2,1].map(n=> <option key={n} value={n}>{n} {n===1?'Star':'Stars'}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Comment:</label>
                    <textarea rows={4} value={form.comment} onChange={e=>setForm({...form, comment: e.target.value})} required />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}
                  <button type="submit" className="cta">Submit Review</button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}