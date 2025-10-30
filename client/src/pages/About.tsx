import React from 'react';
import Logo from '../components/Logo';
import Bracelet from '../components/Bracelet';

export default function About() {
  return (
    <div className="page">
      <h2 className="section-title">About Olivia</h2>

      <div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{flex:'1 1 360px'}}>
          <div style={{maxWidth:520,marginBottom:12}}>
            {/* larger logo version */}
            <Logo />
          </div>

          <p>
            Hi — I’m Olivia. I’m 11 years old and I love making things, especially bracelets. My family recently moved for my dad’s work, which meant saying goodbye to some friends. Making bracelets helps me feel close to people — I enjoy picking colors and patterns and I love making custom sizes so everyone can have a bracelet that fits just right.
          </p>

          <p>
            I make all kinds: bright, pastel, patterned, and silly ones too. If you want a custom design or a special size, tell me and I’ll make it with extra care. A portion of each sale goes to charity because I want to share the love.
          </p>
        </div>

        <aside style={{flex:'0 0 360px',display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <div style={{background:'#fff',padding:16,borderRadius:12}}>
            {/* big bracelet svg */}
            <Bracelet size={260} />
          </div>

          <div style={{display:'flex',gap:8}}>
            <Bracelet size={86} />
            <Bracelet size={86} />
            <Bracelet size={86} />
          </div>
        </aside>
      </div>
    </div>
  );
}
