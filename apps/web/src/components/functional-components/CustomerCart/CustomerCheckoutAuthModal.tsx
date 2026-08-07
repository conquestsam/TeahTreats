import { Button, Group, Modal, Stack, Text } from '@mantine/core';

export function CustomerCheckoutAuthModal({
  opened,
  onClose
}: {
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Sign In First" centered>
      <Stack gap="md">
        <Text size="sm">Sign in or create an account before checkout.</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Keep Shopping
          </Button>
          <Button component="a" href="/signup" variant="light">
            Create Account
          </Button>
          <Button component="a" href="/login">
            Sign In
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
