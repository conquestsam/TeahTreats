'use client';

import { Button, NumberInput, SimpleGrid, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useCustomerBundlePreviewMutation } from '@/hooks/CustomerBundle/useCustomerBundlePreview';

export function CustomerBundleContent() {
  const [participantCount, setParticipantCount] = useState(6);
  const [budgetTargetCents, setBudgetTargetCents] = useState(5000);
  const previewMutation = useCustomerBundlePreviewMutation();
  const preview = previewMutation.data;

  const inputStyles = {
    input: {
      background: 'var(--tt-surface)',
      border: '1px solid rgba(184, 147, 62, 0.15)',
      color: 'var(--tt-cream)',
      '&:focus': { borderColor: 'var(--tt-gold)', boxShadow: '0 0 0 2px rgba(184, 147, 62, 0.12)' }
    },
    label: { color: 'var(--tt-cream-muted)', fontSize: '0.78rem', fontWeight: 600 }
  };

  return (
    <div>
      <div className="tt-page-header" style={{ background: 'var(--tt-black)' }}>
        <div className="tt-container">
          <p className="tt-eyebrow" style={{ marginBottom: 10 }}>Bundles</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: 10 }}>
            Snack bundle ideas
          </h1>
          <p className="tt-body" style={{ maxWidth: 560 }}>
            Generate a backend suggestion from active snacks. Final pricing is checked again in cart and checkout.
          </p>
          <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20, marginTop: 12, display: 'inline-block' }}>No AI</span>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        <Stack gap="xl">
          <div className="tt-panel" style={{ padding: 24 }}>
            <Stack gap="md">
              <Text fw={850} style={{ color: 'var(--tt-cream)' }}>Step 1: Choose a simple target</Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <NumberInput label="People" min={1} value={participantCount} onChange={(value) => setParticipantCount(Number(value) || 1)} styles={inputStyles} />
                <NumberInput label="Budget" min={0} value={budgetTargetCents} onChange={(value) => setBudgetTargetCents(Number(value) || 0)} styles={inputStyles} />
              </SimpleGrid>
              <Button
                className="tt-btn-primary"
                loading={previewMutation.isPending}
                onClick={() => previewMutation.mutate({ participantCount, budgetTargetCents })}
                styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none' } }}
              >
                Generate Bundle
              </Button>
            </Stack>
          </div>

          {previewMutation.isError ? (
            <div className="tt-state-card" style={{ padding: 32, textAlign: 'center' }}>
              <h3 className="tt-editorial" style={{ fontSize: '1.05rem', marginBottom: 6 }}>Bundle unavailable</h3>
              <p className="tt-body" style={{ fontSize: '0.85rem' }}>Try again with a smaller target.</p>
            </div>
          ) : preview ? (
            <div className="tt-panel" style={{ padding: 24 }}>
              <Stack gap="md">
                <Text fw={900} style={{ color: 'var(--tt-cream)', fontFamily: 'var(--tt-font-editorial)' }}>{preview.title}</Text>
                <Text style={{ color: 'var(--tt-gold)' }}>Estimated total: ${(preview.subtotalCents / 100).toFixed(2)}</Text>
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  {preview.items.map((item) => (
                    <div key={item.skuId} className="tt-panel-elevated" style={{ padding: 16, borderRadius: 12 }}>
                      <Text fw={850} style={{ color: 'var(--tt-cream)' }}>{item.productName}</Text>
                      <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>{item.skuName} x {item.quantity}</Text>
                    </div>
                  ))}
                </SimpleGrid>
              </Stack>
            </div>
          ) : null}
        </Stack>
      </div>
    </div>
  );
}
