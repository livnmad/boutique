import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Bracelet from '../components/Bracelet';
import beadFactsData from '../data/beadFacts.json';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface BeadFact {
  id: number;
  fact: string;
  emoji: string;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [beadFacts, setBeadFacts] = useState<BeadFact[]>([]);
  const [beadImages, setBeadImages] = useState<string[]>([]);
  const colorfulBeadedBracelet = '/images/beads_6.png';
  const customPatternDesign = '/images/beads_7.png';
  const friendshipBracelets = '/images/beads_1.png';
  useEffect(() => {
    loadRandomReviews();
    loadRandomFacts();
    loadRandomBeadImages();
  }, []);

  function loadRandomBeadImages() {
    // Get all bead images (beads_1.png through beads_7.png)
    const allImages = [
      '/images/beads_1.png',
      '/images/beads_2.png',
      '/images/beads_3.png',
      '/images/beads_4.png',
      '/images/beads_5.png',
      '/images/beads_6.png',
      '/images/beads_7.png'
    ];
    
    // Shuffle and take 4 random images
    const shuffled = allImages.sort(() => 0.5 - Math.random());
    setBeadImages(shuffled.slice(0, 4));
  }

  function loadRandomFacts() {
    // Get 3 random facts from the JSON file
    const shuffled = [...beadFactsData].sort(() => 0.5 - Math.random());
    setBeadFacts(shuffled.slice(0, 3));
  }

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
            {beadImages.map((imgSrc, idx) => (
              <div key={idx} className="bracelet-card">
                <img src={imgSrc} alt={`Beads ${idx + 1}`} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
              </div>
            ))}
          </div>

          <h1 className="hero-title">Cute, Custom, and Crafted with Care.</h1>
          <p className="hero-sub">Hi — I'm Olivia. I'm 11 years old and I love making things, especially bracelets. My family just moved for my dad's work, so I've been spending my time crafting colorful bracelets for other people to enjoy. I make all kinds — custom sizes and patterns are totally welcome!</p>
          <a className="cta" href="/items">Shop Now</a>
        </div>
      </section>

      <section className="fun-facts-section">
        <h2 className="section-title">Fun Bead Facts! 🌈</h2>
        <div className="facts-grid">
          {beadFacts.map((fact) => (
            <div key={fact.id} className="fact-card">
              <div className="fact-emoji">{fact.emoji}</div>
              <p className="fact-text">{fact.fact}</p>
            </div>
          ))}
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
              <img src={colorfulBeadedBracelet} alt="Colorful Beaded Bracelet" className="footer-image" />
              <p className="placeholder-text">Colorful Beaded Bracelet</p>
            </div>
          </div>
          <div className="gallery-item">
            <div className="placeholder-image">
              <img src={customPatternDesign} alt="Custom Pattern Design" className="footer-image" />
              <p className="placeholder-text">Custom Pattern Design</p>
            </div>
          </div>
          <div className="gallery-item">
            <div className="placeholder-image">
              <img src={friendshipBracelets} alt="Friendship Bracelets" className="footer-image" />
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
