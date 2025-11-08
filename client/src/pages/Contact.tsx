import React, { useState } from 'react';
import axios from 'axios';
import '../styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    comments: ''
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/contact', formData);
      
      if (response.data.ok) {
        setStatus('Thank you! Your message has been sent successfully.');
        setFormData({
          firstName: '',
          email: '',
          comments: ''
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="contact-container">
        <h2 className="section-title">Contact Us</h2>
        <p className="contact-intro">
          We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comments">
              Comments <span className="required">*</span>
            </label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={6}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {status && <div className="success-message">{status}</div>}

          <button 
            type="submit" 
            className="cta" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
