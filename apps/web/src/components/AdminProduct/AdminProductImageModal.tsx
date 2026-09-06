'use client';

import { Button, FileInput, Group, Image, Modal, NumberInput, Paper, Stack, Text, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useState } from 'react';
import type { AdminProductImageModel } from '@/types/AdminProduct/adminProductTypes';

type ImageForm = UseFormReturnType<{
  url: string;
  objectKey: string;
  storageProvider: string;
  contentType: string;
  alt: string;
  sortOrder: number;
}>;

export function AdminProductImageModal({
  mode,
  opened,
  image,
  form,
  loading,
  uploadLoading,
  onClose,
  onUploadFile,
  onSubmit
}: Readonly<{
  mode: 'create' | 'edit';
  opened: boolean;
  image: AdminProductImageModel | null;
  form: ImageForm;
  loading: boolean;
  uploadLoading: boolean;
  onClose: () => void;
  onUploadFile: (file: File) => void;
  onSubmit: () => void;
}>) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <Modal opened={opened} onClose={onClose} title={mode === 'create' ? 'Add Photo' : 'Edit Photo'} size="md">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          {mode === 'create' ? (
            <>
              <Text size="sm" c="dimmed">
                Choose a clear product photo for this menu item.
              </Text>
              <Group align="end" wrap="nowrap">
                <FileInput
                  label="Photo"
                  placeholder="Choose JPG, PNG, or WebP"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="flex-1"
                  value={file}
                  onChange={(nextFile) => {
                    setFile(nextFile);
                    if (nextFile?.type) {
                      form.setFieldValue('contentType', nextFile.type);
                    }
                  }}
                />
                <Button
                  variant="light"
                  loading={uploadLoading}
                  disabled={!file}
                  onClick={() => {
                    if (file) {
                      onUploadFile(file);
                    }
                  }}
                >
                  Upload
                </Button>
              </Group>
              {form.values.url ? (
                <Paper withBorder p="xs">
                  <Image src={form.values.url} alt={form.values.alt || 'Product image preview'} h={180} fit="cover" radius="md" />
                </Paper>
              ) : null}
            </>
          ) : (
            <Text size="sm" c="dimmed">
              Update how this photo appears for customers.
            </Text>
          )}
          <TextInput label="Display text" placeholder="Fresh meat pie on a tray" {...form.getInputProps('alt')} />
          <NumberInput label="Photo order" min={0} {...form.getInputProps('sortOrder')} />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={mode === 'create' && !form.values.url}>
              Save Photo
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
