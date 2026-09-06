'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const storySteps = [
  { label: 'Prepare', text: 'Puff puff, meat pies, samosas, and cakes are handled as fresh food, not anonymous inventory.' },
  { label: 'Confirm', text: 'Checkout keeps prices, stock, allergens, and readiness notifications clear before you pay.' },
  { label: 'Celebrate', text: 'Party trays, office plans, and custom cakes stay simple to order and easy to share.' }
];

export function TeahTreatsBrandStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [-24, 36]);
  const numberY = useTransform(scrollYProgress, [0, 1], [28, -28]);

  return (
    <section ref={sectionRef} className="tt-section tt-section-dark tt-story-section">
      <div className="tt-container">
        <div className="tt-story-grid">
          <motion.div
            className="tt-story-media"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65 }}
          >
            <motion.img
              src="/brand/products/custom-celebration-cakes-hero.jpg"
              alt="Custom celebration cakes from TeshTreats"
              style={{ y: imageY }}
            />
            <motion.span className="tt-story-year" style={{ y: numberY }} aria-hidden="true">
              2026
            </motion.span>
          </motion.div>

          <div className="tt-story-copy">
            <motion.p
              className="tt-eyebrow"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Story
            </motion.p>
            <motion.h2
              className="tt-display"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
            >
              Food-service warmth, built into a cleaner shopping flow.
            </motion.h2>
            <motion.p
              className="tt-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
            >
              TeshTreats brings together the comfort of Nigerian party snacks, custom cakes, and signature drinks
              with the clarity customers expect online: real photos, visible prices, secure payment, and clear
              readiness updates when an order is prepared.
            </motion.p>
            <div className="tt-story-steps">
              {storySteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  className="tt-story-step"
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.22 + index * 0.08 }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.label}</h3>
                    <p>{step.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
