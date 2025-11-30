import React, { useState, useRef } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';
import '../styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    comments: '',
    website: '' // honeypot field
  });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Generate CAPTCHA on component mount
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
  }

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

    // Validate required fields
    let firstInvalid: HTMLInputElement | HTMLTextAreaElement | null = null;
    if (!formData.firstName) {
      setError('First name is required.');
      setModalOpen(true);
      firstInvalidRef.current = document.getElementById('firstName') as HTMLInputElement;
      setIsSubmitting(false);
      return;
    }
    if (!formData.email) {
      setError('Email is required.');
      setModalOpen(true);
      firstInvalidRef.current = document.getElementById('email') as HTMLInputElement;
      setIsSubmitting(false);
      return;
    }
    if (!formData.comments) {
      setError('Comments are required.');
      setModalOpen(true);
      firstInvalidRef.current = document.getElementById('comments') as HTMLTextAreaElement;
      setIsSubmitting(false);
      return;
    }
    // Basic email validation
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      setModalOpen(true);
      firstInvalidRef.current = document.getElementById('email') as HTMLInputElement;
      setIsSubmitting(false);
      return;
    }

    // Validate CAPTCHA
    const correctAnswer = captcha.num1 + captcha.num2;
    if (parseInt(captcha.answer) !== correctAnswer) {
      setError('Incorrect CAPTCHA answer. Please try again.');
      setIsSubmitting(false);
      generateCaptcha();
      return;
    }

    try {
      const response = await axios.post('/api/contact', formData);
      
      if (response.data.ok) {
        setStatus('Thank you! Your message has been sent successfully.');
        setFormData({
          firstName: '',
          email: '',
          comments: '',
          website: ''
        });
        generateCaptcha();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  // Focus first invalid field after modal closes
  function handleModalClose() {
    setModalOpen(false);
    setTimeout(() => {
      if (firstInvalidRef.current) {
        firstInvalidRef.current.focus();
      }
    }, 0);
  }

  return (
    <div className="page">
      <Modal open={modalOpen} onClose={handleModalClose} title="Form Error">
        {error}
      </Modal>
      <div className="contact-container">
        <h2 className="section-title">Contact Us</h2>
        <p className="contact-intro">
          We'd love to hear from you! Fill out the form below and we'll get back to you as soon as possible.
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required" title="Required">*</span>
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
              Email Address <span className="required" title="Required">*</span>
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
              Comments <span className="required" title="Required">*</span>
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

          {/* Honeypot field - hidden from users */}
          <div className="honeypot">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* CAPTCHA */}
          <div className="form-group captcha-group">
            <label htmlFor="captcha">
              Verify you're human <span className="required">*</span>
            </label>
            <div className="captcha-question">
              <span>What is {captcha.num1} + {captcha.num2}?</span>
              <input
                type="number"
                id="captcha"
                value={captcha.answer}
                onChange={(e) => setCaptcha({ ...captcha, answer: e.target.value })}
                required
                disabled={isSubmitting}
                className="captcha-input"
              />
            </div>
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
