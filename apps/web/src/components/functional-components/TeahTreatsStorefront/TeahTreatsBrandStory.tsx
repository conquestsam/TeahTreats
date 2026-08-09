'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const storySteps = [
  { label: 'Source', text: 'We choose snacks with clear ingredients, strong flavor, and honest shelf-life.' },
  { label: 'Check', text: 'Perishable treats are handled with expiry awareness before they reach checkout.' },
  { label: 'Curate', text: 'Bundles, office plans, and personal picks all come from the same trusted catalog.' }
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
              src="https://images.unsplash.com/photo-1571826945830-5423b80a986c?q=80&w=1400&auto=format&fit=crop"
              alt="Premium assorted snacks"
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
              Built for snacks that deserve better handling.
            </motion.h2>
            <motion.p
              className="tt-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
            >
              TeahTreats started from a simple frustration: great snacks are often sold with weak freshness control,
              unclear allergen notes, and stressful ordering. We built the store around real-time availability,
              expiry-aware inventory, clear checkout, and thoughtful notifications.
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
