import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/footer.css';

const TypedLink = Link as React.ComponentType<{to: string; children: React.ReactNode}>;

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-heading">✨ Quick Links</h3>
          <ul className="footer-links">
            <li><TypedLink to="/">Home</TypedLink></li>
            <li><TypedLink to="/items">Shop Bracelets</TypedLink></li>
            <li><TypedLink to="/about">Our Story</TypedLink></li>
            <li><TypedLink to="/contact">Contact Us</TypedLink></li>
            <li><TypedLink to="/admin">Admin</TypedLink></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">💝 Handmade with Love</h3>
          <p className="footer-text">
            Every bracelet is carefully handcrafted with love and attention to detail. 
            Our custom bracelets make perfect gifts and are made to order with your 
            choice of colors, patterns, and sizes. Each piece is unique, just like you!
          </p>
          <p className="footer-email">
            📧 <a href="mailto:contact@oliviasbeadboutique.com">contact@oliviasbeadboutique.com</a>
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">🔍 Popular Searches</h3>
          <div className="keywords">
            <span className="keyword">handmade bracelets</span>
            <span className="keyword">friendship bracelets</span>
            <span className="keyword">custom jewelry</span>
            <span className="keyword">beaded bracelets</span>
            <span className="keyword">colorful bracelets</span>
            <span className="keyword">artisan bracelets</span>
            <span className="keyword">handcrafted jewelry</span>
            <span className="keyword">personalized bracelets</span>
            <span className="keyword">boho bracelets</span>
            <span className="keyword">teen jewelry</span>
            <span className="keyword">gift ideas</span>
            <span className="keyword">unique bracelets</span>
          </div>
        </div>
      </div>

      <div className="footer-graphics">
        <span className="graphic">🌸</span>
        <span className="graphic">💎</span>
        <span className="graphic">✨</span>
        <span className="graphic">🌈</span>
        <span className="graphic">⭐</span>
        <span className="graphic">💫</span>
        <span className="graphic">🎨</span>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Olivia's Bracelets. Made with ♥ by an 11-year-old artisan.</p>
      </div>
    </footer>
  );
}
