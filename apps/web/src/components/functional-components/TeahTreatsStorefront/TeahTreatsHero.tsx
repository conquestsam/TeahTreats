'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { motion } from 'motion/react';

export function TeahTreatsHero() {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      heroRef.current.querySelectorAll('[data-hero-anim]'),
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }
    );
  }, []);

  const stats = [
    { value: '500+', label: 'Curated Snacks' },
    { value: '24h', label: 'Freshness Check' },
    { value: 'Free', label: 'Pickup Ready' }
  ];

  return (
    <section className="tt-hero" ref={heroRef}>
      <div className="tt-hero-bg">
        <img
          src="/hero-snacks.png"
          alt="Premium curated snacks on dark slate"
          loading="eager"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="tt-hero-overlay" />
      <div className="tt-hero-content">
        <div className="tt-container" style={{ paddingBlock: '48px' }}>
          <div style={{ maxWidth: 720 }}>
            <p data-hero-anim className="tt-eyebrow" style={{ marginBottom: 16, opacity: 0 }}>
              Premium Snack Commerce
            </p>
            <h1
              data-hero-anim
              className="tt-display"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)', marginBottom: 20, opacity: 0 }}
            >
              Snacks crafted for every craving, curated for every moment.
            </h1>
            <p
              data-hero-anim
              className="tt-body"
              style={{ maxWidth: 560, marginBottom: 32, fontSize: '1.05rem', opacity: 0 }}
            >
              From artisan treats to office packs — discover fresh, perishable, and shelf-stable
              snacks with real-time availability and curated bundles.
            </p>
            <motion.div
              data-hero-anim
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', opacity: 0 }}
            >
              <Link href="/products" className="tt-btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 650,
                fontSize: '0.9rem', letterSpacing: '0.02em'
              }}>
                Shop the Collection
              </Link>
              <Link href="/bundles" className="tt-btn-secondary" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 600,
                fontSize: '0.9rem', letterSpacing: '0.02em'
              }}>
                Explore Bundles
              </Link>
            </motion.div>
          </div>

          <div
            data-hero-anim
            style={{
              display: 'flex',
              gap: 0,
              marginTop: 48,
              borderTop: '1px solid rgba(184, 147, 62, 0.2)',
              paddingTop: 20,
              opacity: 0
            }}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="tt-stat" style={{
                borderRight: i < stats.length - 1 ? '1px solid rgba(184, 147, 62, 0.15)' : 'none',
                flex: 1
              }}>
                <div className="tt-stat-value">{stat.value}</div>
                <div className="tt-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
