import React from 'react';
import Bracelet from '../components/Bracelet';

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-left">
          <div className="bracelet-row">
            <div className="bracelet-card"><Bracelet size={96} /></div>
            <div className="bracelet-card"><Bracelet size={96} /></div>
            <div className="bracelet-card"><Bracelet size={96} /></div>
            <div className="bracelet-card"><Bracelet size={96} /></div>
          </div>

          <h1 className="hero-title">Cute, Custom, and Crafted with Care.</h1>
          <p className="hero-sub">Hi — I’m Olivia. I’m 11 years old and I love making things, especially bracelets. My family just moved for my dad’s work, so I’ve been spending my time crafting colorful bracelets for other people to enjoy. I make all kinds — custom sizes and patterns are totally welcome!</p>
          <a className="cta" href="/items">Shop Now</a>
        </div>

        <aside>
          <div className="shop-by">
            <h3 style={{marginTop:0}}>Shop by Size</h3>
            <div style={{marginTop:8}}>
              <button className="size-btn">Small</button>
              <button className="size-btn">Medium</button>
              <button className="size-btn">Large</button>
            </div>
            <div style={{marginTop:12}}>
              <div style={{background:'#fff',padding:12,borderRadius:8}}>
                <Bracelet size={160} />
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <h2 className="section-title">Handmade with Heart — A Portion Donated to Charity ♥</h2>
      </section>
    </div>
  );
}
