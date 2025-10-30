import React from 'react';
import CartLogoWithFirework from './components/CartLogoWithFirework';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Items from './pages/Items';
import Search from './pages/Search';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Logo from './components/Logo';
export default function App() {
  return (
    <div className="app-container">
      <header className="site-header">
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/items">Shop Bracelets</Link>
          <Link to="/about">Our Story</Link>
        </div>
        <div className="logo-wrap">
          <Logo />
        </div>
        <div style={{width:120}} />
        <div style={{marginLeft:12, position: 'relative'}}>
          <CartLogoWithFirework />
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/items" element={<Items />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </div>
  );
}
