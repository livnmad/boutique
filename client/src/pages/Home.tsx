import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Bracelet from '../components/Bracelet';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadRandomReviews();
  }, []);

  async function loadRandomReviews() {
    try {
      const response = await axios.get('/api/items');
      if (response.data.ok) {
        // Collect all reviews from all items
        const allReviews: Review[] = [];
        response.data.results.forEach((item: any) => {
          if (item.reviews && item.reviews.length > 0) {
            allReviews.push(...item.reviews);
          }
        });
        
        // Shuffle and take 3 random reviews
        const shuffled = allReviews.sort(() => 0.5 - Math.random());
        setReviews(shuffled.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  }

  return (
    <div className="page">
      <section className="hero-full">
        <div className="hero-content">
          <div className="bracelet-row">
            <div className="bracelet-card"><Bracelet size={96} /></div>
            <div className="bracelet-card"><Bracelet size={96} /></div>
            <div className="bracelet-card"><Bracelet size={96} /></div>
            <div className="bracelet-card"><Bracelet size={96} /></div>
          </div>

          <h1 className="hero-title">Cute, Custom, and Crafted with Care.</h1>
          <p className="hero-sub">Hi — I'm Olivia. I'm 11 years old and I love making things, especially bracelets. My family just moved for my dad's work, so I've been spending my time crafting colorful bracelets for other people to enjoy. I make all kinds — custom sizes and patterns are totally welcome!</p>
          <a className="cta" href="/items">Shop Now</a>
        </div>
      </section>

      <section className="reviews-showcase">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="reviews-grid">
          {reviews.length > 0 ? (
            reviews.map((review, idx) => (
              <div key={idx} className="review-highlight">
                <div className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className="review-text">"{review.comment}"</p>
                <p className="review-author">— {review.name}</p>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <p>Be the first to leave a review!</p>
            </div>
          )}
        </div>
      </section>

      <section className="gallery-section">
        <h2 className="section-title">Our Handcrafted Bracelets</h2>
        <div className="gallery-grid">
          <div className="gallery-item">
            <div className="placeholder-image">
              <Bracelet size={240} />
              <p className="placeholder-text">Colorful Beaded Bracelet</p>
            </div>
          </div>
          <div className="gallery-item">
            <div className="placeholder-image">
              <Bracelet size={240} />
              <p className="placeholder-text">Custom Pattern Design</p>
            </div>
          </div>
          <div className="gallery-item">
            <div className="placeholder-image">
              <Bracelet size={240} />
              <p className="placeholder-text">Friendship Bracelets</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Handmade with Heart — A Portion Donated to Charity ♥</h2>
      </section>
    </div>
  );
}
