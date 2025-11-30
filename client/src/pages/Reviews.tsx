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

  // Generic reviews to fill up to 3
  const genericReviews: Review[] = [
    {
      id: 'g1',
      name: 'Happy Customer',
      rating: 5,
      comment: 'Beautiful bracelet, great quality and fast shipping!',
      date: new Date().toISOString(),
    },
    {
      id: 'g2',
      name: 'Bracelet Fan',
      rating: 5,
      comment: 'My daughter loves her new bracelet. Thank you Olivia!',
      date: new Date().toISOString(),
    },
    {
      id: 'g3',
      name: 'Gift Giver',
      rating: 4,
      comment: 'Perfect gift, will order again!',
      date: new Date().toISOString(),
    },
    {
      id: 'g4',
      name: 'Bead Lover',
      rating: 5,
      comment: 'The colors are so vibrant and fun!',
      date: new Date().toISOString(),
    },
    {
      id: 'g5',
      name: 'Repeat Buyer',
      rating: 5,
      comment: 'Second time ordering, always impressed!',
      date: new Date().toISOString(),
    },
    {
      id: 'g6',
      name: 'Birthday Mom',
      rating: 5,
      comment: 'Bought for my child’s birthday—she wears it every day!',
      date: new Date().toISOString(),
    },
    {
      id: 'g7',
      name: 'Fashionista',
      rating: 4,
      comment: 'Trendy and cute, matches all my outfits.',
      date: new Date().toISOString(),
    },
    {
      id: 'g8',
      name: 'Custom Order Fan',
      rating: 5,
      comment: 'Loved being able to pick my own colors!',
      date: new Date().toISOString(),
    },
    {
      id: 'g9',
      name: 'Gift Recipient',
      rating: 5,
      comment: 'Received as a gift—so special and well made.',
      date: new Date().toISOString(),
    },
    {
      id: 'g10',
      name: 'Supportive Aunt',
      rating: 5,
      comment: 'My niece was thrilled. Thank you for the fast shipping!',
      date: new Date().toISOString(),
    },
    {
      id: 'g11',
      name: 'First Time Buyer',
      rating: 4,
      comment: 'Easy ordering process and great communication.',
      date: new Date().toISOString(),
    },
    {
      id: 'g12',
      name: 'Charity Supporter',
      rating: 5,
      comment: 'Love that a portion goes to charity. Beautiful work!',
      date: new Date().toISOString(),
    },
    {
      id: 'g13',
      name: 'Quick Shopper',
      rating: 5,
      comment: 'Arrived quickly and looks even better in person!',
      date: new Date().toISOString(),
    },
  ];

  let displayReviews = reviews;
  if (reviews.length < 3) {
    displayReviews = [...reviews, ...genericReviews.slice(0, 3 - reviews.length)];
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
            {displayReviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this item!</p>
            ) : (
              displayReviews.map(review => (
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