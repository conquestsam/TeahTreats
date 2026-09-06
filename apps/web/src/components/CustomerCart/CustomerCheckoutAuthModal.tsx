import { Button, Group, Modal, Stack, Text } from '@mantine/core';

export function CustomerCheckoutAuthModal({
  opened,
  onClose,
  onContinueAsGuest
}: {
  opened: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Continue Checkout" centered>
      <Stack gap="md">
        <Text size="sm">
          You can place this order as a guest. Sign in only if you want saved details, order history, and rewards.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Keep Shopping
          </Button>
          <Button component="a" href="/login" variant="light">
            Sign In
          </Button>
          <Button onClick={onContinueAsGuest}>
            Continue as Guest
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
