'use client';

const items = [
  'Artisan Cookies', 'Chocolate Truffles', 'Meat Pies', 'Nut Mix',
  'Dried Fruit', 'Sweet Chips', 'Party Pack', 'Office Box',
  'Gift Bundle', 'Protein Bites', 'Trail Mix', 'Granola Clusters'
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
