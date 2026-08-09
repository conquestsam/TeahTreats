'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const testimonials = [
  {
    text: 'The meat pies arrived fresh and properly packed. I ordered for our Lagos founders meetup and everyone asked for the store link.',
    author: 'Adaora Nwosu',
    role: 'Founder, Lagos',
    initials: 'AN',
    stars: 5
  },
  {
    text: 'The office snack plan removed the back-and-forth from our team ordering. Clear allergens, fair pricing, and smooth checkout.',
    author: 'Tunde Adebayo',
    role: 'Operations Lead, Abuja',
    initials: 'TA',
    stars: 5
  },
  {
    text: 'I sent a TeahTreats bundle to a client in Atlanta. It felt premium, personal, and still practical enough for a busy work week.',
    author: 'Amina Bello',
    role: 'Consultant, Accra',
    initials: 'AB',
    stars: 5
  }
] as const;

const fallbackTestimonial = testimonials[0];

export function TeahTreatsTestimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  const testimonial = testimonials[active] ?? fallbackTestimonial;

  return (
    <section className="tt-section tt-section-elevated tt-testimonial-section">
      <div className="tt-container">
        <div className="tt-testimonial-shell">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="tt-testimonial-heading"
          >
            <p className="tt-eyebrow">What Customers Say</p>
            <h2 className="tt-display">Trusted by snack lovers across the diaspora.</h2>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.author}
              className="tt-testimonial-feature"
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.35 }}
            >
              <div className="tt-testimonial-stars">{'★'.repeat(testimonial.stars)}</div>
              <blockquote>{testimonial.text}</blockquote>
              <div className="tt-testimonial-person">
                <span>{testimonial.initials}</span>
                <div>
                  <strong>{testimonial.author}</strong>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="tt-testimonial-dots">
            {testimonials.map((item, index) => (
              <button
                key={item.author}
                type="button"
                className={index === active ? 'is-active' : undefined}
                onClick={() => setActive(index)}
                aria-label={`Show ${item.author} review`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
