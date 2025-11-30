import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  // Order number passed via state
  const orderNumber = location.state?.orderNumber;

  React.useEffect(() => {
    if (!orderNumber) {
      // If no order number, redirect to home
      navigate('/', { replace: true });
    }
  }, [orderNumber, navigate]);

  if (!orderNumber) return null;

  return (
    <div className="page" style={{textAlign:'center',marginTop:60}}>
      <h2 className="section-title">Thank You for Your Purchase!</h2>
      <div style={{fontSize:22,margin:'24px 0'}}>Your order number is <strong>#{orderNumber}</strong></div>
      <div style={{fontSize:18,marginBottom:32}}>We'll let you know when your order ships.</div>
      <button className="cta" onClick={()=>navigate('/')}>Back to Home</button>
    </div>
  );
}
