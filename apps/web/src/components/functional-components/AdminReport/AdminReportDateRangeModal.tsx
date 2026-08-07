import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import type { AdminReportDateRangeInput } from '@/types/AdminReport/adminReportTypes';

export function AdminReportDateRangeModal({
  opened,
  draft,
  onChange,
  onClose,
  onApply,
  onClear
}: {
  opened: boolean;
  draft: AdminReportDateRangeInput;
  onChange: (range: AdminReportDateRangeInput) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Date Range" centered>
      <Stack>
        <TextInput
          label="From"
          type="date"
          value={draft.from ?? ''}
          onChange={(event) => onChange({ ...draft, from: event.currentTarget.value })}
        />
        <TextInput
          label="To"
          type="date"
          value={draft.to ?? ''}
          onChange={(event) => onChange({ ...draft, to: event.currentTarget.value })}
        />
        <Group justify="space-between">
          <Button variant="subtle" onClick={onClear}>
            Clear
          </Button>
          <Group>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onApply}>
              Apply
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
