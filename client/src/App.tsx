import React from 'react';
import CartLogoWithFirework from './components/CartLogoWithFirework';
import type { RouteProps } from 'react-router-dom';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Items from './pages/Items';
import Search from './pages/Search';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Logo from './components/Logo';
import Footer from './components/Footer';
import './styles/product.css';

// Type assertion to fix React Router type issues
const TypedRoute = Route as React.ComponentType<RouteProps>;
const TypedLink = Link as React.ComponentType<{to: string; children: React.ReactNode; className?: string}>;
const TypedRoutes = Routes as React.ComponentType<{children: React.ReactNode}>;
export default function App() {
  return (
    <div className="app-container">
      <header className="site-header">
        <div className="header-top">
          <div className="logo-left">
            <Logo />
          </div>
        </div>
        <div className="header-bottom">
          <div className="nav-links">
            <TypedLink to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </TypedLink>
            <TypedLink to="/items" className="nav-link">
              <span className="nav-icon">✨</span>
              <span>Shop</span>
            </TypedLink>
            <TypedLink to="/about" className="nav-link">
              <span className="nav-icon">💜</span>
              <span>Story</span>
            </TypedLink>
            <TypedLink to="/contact" className="nav-link">
              <span className="nav-icon">💌</span>
              <span>Contact</span>
            </TypedLink>
            <TypedLink to="/checkout" className="nav-link nav-link-cart">
              <span className="nav-icon">🛒</span>
              <span>Cart</span>
            </TypedLink>
          </div>
        </div>
      </header>

      <main>
        <TypedRoutes>
          <TypedRoute path="/" element={<Home />} />
          <TypedRoute path="/about" element={<About />} />
          <TypedRoute path="/items" element={<Items />} />
          <TypedRoute path="/search" element={<Search />} />
          <TypedRoute path="/admin" element={<Admin />} />
          <TypedRoute path="/checkout" element={<Checkout />} />
          <TypedRoute path="/reviews/:itemId" element={<Reviews />} />
          <TypedRoute path="/contact" element={<Contact />} />
        </TypedRoutes>
      </main>

      <Footer />
    </div>
  );
}
