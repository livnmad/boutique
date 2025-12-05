import React from 'react';
import Logo from '../components/Logo';
// Using real product images instead of SVG bracelets

export default function About() {
  return (
    <div className="page">
      <h2 className="section-title">About Olivia</h2>

      <div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{flex:'1 1 360px'}}>
          <p>
            Hello! I'm a young bracelet maker who loves getting creative with colors, beads, and fun designs. Crafting has become one of my favorite hobbies — especially after a recent move to a brand-new place. It's a way for me to stay connected, make new friends, and share a little happiness with others.
            <br/>
            <br/>
            I create all kinds of bracelets: bold and bright, soft pastels, playful patterns, and even some with a silly twist. Each piece is made by hand, and I can adjust sizes or design something completely custom so that it fits just right and matches your style perfectly.
            <br/>
            <br/>
            Every bracelet is made with care, and a portion of each sale goes toward helping others, because spreading kindness is just as important as making something beautiful. I hope one of my creations brings a smile to your day!
          </p>
          <p>
            I make all kinds: bright, pastel, patterned, and silly ones too. If you want a custom design or a special size, tell me and I’ll make it with extra care. A portion of each sale goes to charity because I want to share the love.
          </p>
        </div>
        <aside style={{flex:'0 0 360px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{background:'#fff',padding:16,borderRadius:12, width: '100%', display:'flex', justifyContent:'center'}}>
            {/* hero product image */}
            <img data-test-id="about-hero-image" src="/images/beads_6.png" alt="Featured Bracelet" style={{width: '100%', maxWidth: 320, height: 'auto', objectFit: 'contain', borderRadius: 12}} />
          </div>

          <div style={{display:'flex',gap:8}}>
            <img data-test-id="about-image-1" src="/images/beads_2.png" alt="Bracelet Style 1" style={{width: 100, height: 100, objectFit: 'cover', borderRadius: 8}} />
            <img data-test-id="about-image-2" src="/images/beads_4.png" alt="Bracelet Style 2" style={{width: 100, height: 100, objectFit: 'cover', borderRadius: 8}} />
            <img data-test-id="about-image-3" src="/images/beads_1.png" alt="Bracelet Style 3" style={{width: 100, height: 100, objectFit: 'cover', borderRadius: 8}} />
          </div>
        </aside>
      </div>
    </div>
  );
}
