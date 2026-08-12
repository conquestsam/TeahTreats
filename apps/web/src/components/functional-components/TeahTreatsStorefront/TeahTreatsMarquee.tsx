'use client';

const items = [
  'Signature Zobo', 'Puff Puff Tray', 'Meat Pie Tray', 'Mini Samosa',
  'Spring Rolls', 'Scotch Egg Bites', 'Party Snack Combo', 'Custom Cakes',
  'Photo Cakes', 'Birthday Cakes', 'Office Trays', 'Fresh Pickup'
];

export function TeahTreatsMarquee() {
  const doubled = [...items, ...items];

  return (
    <div className="tt-marquee">
      <div className="tt-marquee-track">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} style={{ display: 'contents' }}>
            <span className="tt-marquee-item">{item}</span>
            <span className="tt-marquee-dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
