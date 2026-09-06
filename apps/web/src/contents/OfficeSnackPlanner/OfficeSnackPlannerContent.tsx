'use client';

import { Button, NumberInput, SimpleGrid, Stack, TagsInput, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useOfficeSnackPlannerMutation } from '@/hooks/OfficeSnackPlanner/useOfficeSnackPlannerMutation';

export function OfficeSnackPlannerContent() {
  const [name, setName] = useState('Office snack plan');
  const [participantCount, setParticipantCount] = useState(12);
  const [budgetTargetCents, setBudgetTargetCents] = useState(9000);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [preferredTags, setPreferredTags] = useState<string[]>([]);
  const planMutation = useOfficeSnackPlannerMutation();
  const plan = planMutation.data;

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
          <p className="tt-eyebrow" style={{ marginBottom: 10 }}>Office Snacks</p>
          <h1 className="tt-display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', marginBottom: 10 }}>
            Office snack planner
          </h1>
          <p className="tt-body" style={{ maxWidth: 560 }}>
            Create one simple plan from budget, team size, and snack preferences.
          </p>
          <span className="tt-badge-gold" style={{ padding: '4px 12px', borderRadius: 20, marginTop: 12, display: 'inline-block' }}>Suggestion only</span>
        </div>
      </div>

      <div className="tt-container" style={{ paddingBlock: '32px 56px' }}>
        <Stack gap="xl">
          <div className="tt-panel" style={{ padding: 24 }}>
            <Stack gap="md">
              <Text fw={850} style={{ color: 'var(--tt-cream)' }}>Step 1: Plan basics</Text>
              <TextInput label="Plan name" value={name} onChange={(event) => setName(event.currentTarget.value)} styles={inputStyles} />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <NumberInput label="People" min={1} value={participantCount} onChange={(value) => setParticipantCount(Number(value) || 1)} styles={inputStyles} />
                <NumberInput label="Budget" min={100} value={budgetTargetCents} onChange={(value) => setBudgetTargetCents(Number(value) || 100)} styles={inputStyles} />
              </SimpleGrid>
              <TagsInput label="Categories" value={preferredCategories} onChange={setPreferredCategories} styles={inputStyles} />
              <TagsInput label="Tags" value={preferredTags} onChange={setPreferredTags} styles={inputStyles} />
              <Button
                loading={planMutation.isPending}
                onClick={() => planMutation.mutate({ name, participantCount, budgetTargetCents, preferredCategories, preferredTags })}
                styles={{ root: { background: 'linear-gradient(135deg, var(--tt-crimson), var(--tt-crimson-deep))', border: 'none' } }}
              >
                Generate Plan
              </Button>
            </Stack>
          </div>

          {planMutation.isError ? (
            <div className="tt-state-card" style={{ padding: 32, textAlign: 'center' }}>
              <h3 className="tt-editorial" style={{ fontSize: '1.05rem', marginBottom: 6 }}>Plan unavailable</h3>
              <p className="tt-body" style={{ fontSize: '0.85rem' }}>Try fewer filters or a larger budget.</p>
            </div>
          ) : plan ? (
            <div className="tt-panel" style={{ padding: 24 }}>
              <Stack gap="sm">
                <Text fw={900} style={{ color: 'var(--tt-cream)', fontFamily: 'var(--tt-font-editorial)' }}>{plan.name}</Text>
                <Text style={{ color: 'var(--tt-gold)' }}>{plan.participantCount} people | ${(plan.budgetTargetCents / 100).toFixed(2)} target</Text>
                <Text size="sm" style={{ color: 'var(--tt-cream-dim)' }}>Suggestion saved as a draft foundation.</Text>
              </Stack>
            </div>
          ) : null}
        </Stack>
      </div>
    </div>
  );
}
