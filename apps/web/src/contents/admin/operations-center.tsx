'use client';

import { Badge, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { MetricCard } from '@/components/ui/metric-card';

const cards = [
  { label: 'Paid orders', value: '0', tone: 'green' },
  { label: 'Manual proofs', value: '0', tone: 'orange' },
  { label: 'Low stock alerts', value: '0', tone: 'red' },
  { label: 'Ready orders', value: '0', tone: 'blue' }
] as const;

export function OperationsCenter() {
  return (
    <div className="admin-container py-6 md:py-8">
      <Stack gap="lg">
        <Paper withBorder p="lg" className="enterprise-panel">
          <Group justify="space-between" align="start">
            <div>
              <Text size="xs" fw={700} tt="uppercase" c="green.7" lts={0.8}>
                Command center
              </Text>
              <Title order={1} className="text-2xl md:text-4xl">Realtime Operations Center</Title>
              <Text c="dimmed" size="sm" maw={560}>SSE-backed activity, payment proofs, stock warnings, and readiness events land here.</Text>
            </div>
            <Badge color="green" variant="dot" size="sm">
              SSE ready
            </Badge>
          </Group>
        </Paper>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {cards.map((card) => (
            <MetricCard key={card.label} label={card.label} value={card.value} tone={card.tone} hint="Realtime-ready metric" />
          ))}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, lg: 3 }}>
          {[
            ['Order readiness', 'Notify customers through email, SMS, WhatsApp placeholders, and SSE updates.'],
            ['Manual proof review', 'Receipts are queued for admin review without rolling back payment state.'],
            ['Inventory watch', 'Expiry-aware batches keep perishable snacks from being oversold.']
          ].map(([title, text]) => (
            <Paper key={title} withBorder p="lg" className="enterprise-panel" styles={{ root: { borderColor: 'rgba(0,0,0,0.06)' } }}>
              <Stack gap="xs">
                <Title order={3} size="h5">{title}</Title>
                <Text c="dimmed" size="sm">{text}</Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </div>
  );
}

