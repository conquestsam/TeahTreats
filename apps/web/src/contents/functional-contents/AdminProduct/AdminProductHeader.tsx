import { Button, Group, Select, SegmentedControl, TextInput } from '@mantine/core';

export interface AdminProductHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  categories: string[];
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onCreate: () => void;
}

export function AdminProductHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  viewMode,
  onViewModeChange,
  onCreate
}: AdminProductHeaderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="tt-editorial" style={{ fontSize: '1.8rem', margin: 0, color: 'var(--tt-cream)' }}>
            Product Catalog
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--tt-cream-muted)', margin: '4px 0 0' }}>
            Manage catalog items, pricing variants, image assets, and SEO metadata.
          </p>
        </div>

        <Button className="tt-btn-primary" onClick={onCreate} radius="md">
          + Add New Product
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'rgba(30, 30, 30, 0.6)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(184, 147, 62, 0.15)' }}>
        <Group gap="sm" wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
          <TextInput
            placeholder="Search by name, brand, or slug..."
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
            size="sm"
            style={{ width: 260, minWidth: 200 }}
            styles={{ input: { background: 'var(--tt-black)', color: 'var(--tt-cream)', borderColor: 'rgba(184, 147, 62, 0.2)' } }}
          />

          <Select
            placeholder="Filter Category"
            value={categoryFilter}
            onChange={(val) => onCategoryFilterChange(val ?? 'all')}
            data={[{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c, label: c }))]}
            size="sm"
            style={{ width: 180 }}
            styles={{ input: { background: 'var(--tt-black)', color: 'var(--tt-cream)', borderColor: 'rgba(184, 147, 62, 0.2)' } }}
          />

          <SegmentedControl
            value={statusFilter}
            onChange={onStatusFilterChange}
            size="sm"
            data={[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Draft', value: 'draft' },
              { label: 'Archived', value: 'archived' }
            ]}
            styles={{
              root: { background: 'var(--tt-black)', border: '1px solid rgba(184, 147, 62, 0.2)' },
              label: { color: 'var(--tt-cream-muted)', fontSize: '0.78rem' },
              indicator: { background: 'rgba(184, 147, 62, 0.25)' }
            }}
          />
        </Group>

        <SegmentedControl
          value={viewMode}
          onChange={(val) => onViewModeChange(val as 'table' | 'grid')}
          size="sm"
          data={[
            { label: 'Table', value: 'table' },
            { label: 'Grid', value: 'grid' }
          ]}
          styles={{
            root: { background: 'var(--tt-black)', border: '1px solid rgba(184, 147, 62, 0.2)' },
            label: { color: 'var(--tt-cream-muted)', fontSize: '0.78rem' },
            indicator: { background: 'var(--tt-gold-muted)' }
          }}
        />
      </div>
    </div>
  );
}
