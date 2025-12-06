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
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this item!</p>
            ) : (
              <>
                {reviews.map(review => (
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
                ))}
              </>
            )}
          </div>
          <div style={{margin:'12px 0 0'}}>
            <a href="/order-review" className="cta">Leave a Review (Order Required)</a>
          </div>
        </div>
      </div>
    </div>
  );
}