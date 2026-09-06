import { Paper, Stack, Text } from '@mantine/core';

interface AdminReportBarListProps {
  title: string;
  items: Array<{ label: string; value: number; hint?: string }>;
  valueLabel?: (value: number) => string;
}

export function AdminReportBarList({ title, items, valueLabel = String }: AdminReportBarListProps) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <Paper withBorder p="lg" className="enterprise-panel h-full">
      <Stack gap="md">
        <Text fw={900}>{title}</Text>
        {items.length === 0 ? (
          <Text size="sm" c="dimmed">No data yet.</Text>
        ) : (
          items.map((item) => (
            <Stack key={item.label} gap={5}>
              <div className="flex items-center justify-between gap-3">
                <Text size="sm" fw={700} className="truncate">
                  {item.label}
                </Text>
                <Text size="sm" c="dimmed">
                  {valueLabel(item.value)}
                </Text>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-green-700"
                  style={{ width: `${Math.max(4, Math.round((item.value / max) * 100))}%` }}
                />
              </div>
              {item.hint ? (
                <Text size="xs" c="dimmed">
                  {item.hint}
                </Text>
              ) : null}
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}
