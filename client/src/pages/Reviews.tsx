import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/reviews.css';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  reviews?: Review[];
  averageRating?: number;
  inventory?: number;
  createdAt: string;
}

export default function Reviews() {
  const { itemId } = useParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [item, setItem] = useState<Item | null>(null);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (itemId) {
      loadReviews();
      loadItem();
    }
  }, [itemId]);

  async function loadReviews() {
    try {
      const response = await axios.get(`/api/items/${itemId}/reviews`);
      if (response.data.ok) {
        setReviews(response.data.reviews);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  }

  async function loadItem() {
    try {
      const response = await axios.get(`/api/items/${itemId}`);
      if (response.data.ok) {
        setItem(response.data.item);
      }
    } catch (err) {
      console.error('Error loading item:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`/api/items/${itemId}/reviews`, newReview);

      if (response.data.ok) {
        setSuccess('Review submitted successfully!');
        setNewReview({ name: '', rating: 5, comment: '' });
        loadReviews();
        loadItem(); // Reload item to get updated average rating
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error submitting review');
    }
  }

  if (!itemId) {
    return <div className="page">Select an item to view its reviews</div>;
  }

  return (
    <div className="page">
      <div className="reviews-container">
        {item && (
          <div className="item-header">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </div>
        )}

        <div className="reviews-section">
          <h3>Customer Reviews</h3>
          
          <div className="review-form">
            <h4>Write a Review</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rating:</label>
                <select
                  value={newReview.rating}
                  onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Star' : 'Stars'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Comment:</label>
                <textarea
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="cta">Submit Review</button>
            </form>
          </div>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this item!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">{review.name}</span>
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}