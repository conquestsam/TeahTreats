'use client';

type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | string;

export function StorefrontAvailabilityBadge({ availability }: Readonly<{ availability: AvailabilityStatus }>) {
  const config: Record<string, { className: string; label: string }> = {
    in_stock: { className: 'tt-badge-in-stock', label: 'In Stock' },
    low_stock: { className: 'tt-badge-low-stock', label: 'Low Stock' },
    out_of_stock: { className: 'tt-badge-out-of-stock', label: 'Sold Out' }
  };

  const badge = config[availability] ?? { className: 'tt-badge-in-stock', label: 'In Stock' };

  return (
    <span
      className={badge.className}
      style={{ padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}
    >
      {badge.label}
    </span>
  );
}
