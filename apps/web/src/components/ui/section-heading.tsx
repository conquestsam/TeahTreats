import { Stack, Text, Title } from '@mantine/core';

export function SectionHeading({
  title,
  description
}: Readonly<{ title: string; description: string }>) {
  return (
    <Stack gap={6}>
      <Title order={1}>{title}</Title>
      <Text c="dimmed" maw={720}>
        {description}
      </Text>
    </Stack>
  );
}
