import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductQueryKey } from '@/constants/AdminProduct/adminProductConstants';
import {
  archiveAdminProduct,
  createAdminProductImage,
  createAdminProduct,
  createAdminProductSku,
  removeAdminProductImage,
  requestAdminProductImageUpload,
  restoreAdminProduct,
  updateAdminProductImage,
  updateAdminProduct
} from '@/services/AdminProduct/adminProductApi';
import type {
  AdminProductModel,
  CreateAdminProductImageInput,
  CreateAdminProductInput,
  CreateAdminProductSkuInput,
  UpdateAdminProductImageInput,
  UpdateAdminProductInput
} from '@/types/AdminProduct/adminProductTypes';

function notifySuccess(message: string) {
  notifications.show({ color: 'green', title: 'Done', message });
}

function notifyError(message: string) {
  notifications.show({ color: 'red', title: 'Action failed', message });
}

export function useAdminProductMutations(input: {
  onProductSaved: () => void;
  onProductCreated?: (product: AdminProductModel) => void;
  onSkuSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: adminProductQueryKey });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminProductInput) => createAdminProduct(payload),
    onSuccess: async (product) => {
      await invalidateProducts();
      notifySuccess('Product created.');
      if (input.onProductCreated) {
        input.onProductCreated(product);
        return;
      }
      input.onProductSaved();
    },
    onError: () => notifyError('Could not create product.')
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { productId: string; product: UpdateAdminProductInput }) =>
      updateAdminProduct(payload.productId, payload.product),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('Product updated.');
    },
    onError: () => notifyError('Could not update product.')
  });

  const archiveMutation = useMutation({
    mutationFn: (product: AdminProductModel) => archiveAdminProduct(product.id),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('Product archived.');
      input.onProductSaved();
    },
    onError: () => notifyError('Could not archive product.')
  });

  const restoreMutation = useMutation({
    mutationFn: (product: AdminProductModel) => restoreAdminProduct(product.id),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('Product restored.');
      input.onProductSaved();
    },
    onError: () => notifyError('Could not restore product.')
  });

  const skuMutation = useMutation({
    mutationFn: (payload: { productId: string; sku: CreateAdminProductSkuInput }) =>
      createAdminProductSku(payload.productId, payload.sku),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('SKU added.');
      input.onSkuSaved();
    },
    onError: () => notifyError('Could not add SKU.')
  });

  const imageUploadMutation = useMutation({
    mutationFn: (payload: { productId: string; contentType: string }) =>
      requestAdminProductImageUpload(payload.productId, payload.contentType),
    onSuccess: () => notifySuccess('Upload URL created.'),
    onError: () => notifyError('Could not create upload URL.')
  });

  const imageCreateMutation = useMutation({
    mutationFn: (payload: { productId: string; image: CreateAdminProductImageInput }) =>
      createAdminProductImage(payload.productId, payload.image),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('Image added.');
    },
    onError: () => notifyError('Could not add image.')
  });

  const imageUpdateMutation = useMutation({
    mutationFn: (payload: { productId: string; imageId: string; image: UpdateAdminProductImageInput }) =>
      updateAdminProductImage(payload.productId, payload.imageId, payload.image),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('Image updated.');
    },
    onError: () => notifyError('Could not update image.')
  });

  const imageRemoveMutation = useMutation({
    mutationFn: (payload: { productId: string; imageId: string }) =>
      removeAdminProductImage(payload.productId, payload.imageId),
    onSuccess: async () => {
      await invalidateProducts();
      notifySuccess('Image removed.');
    },
    onError: () => notifyError('Could not remove image.')
  });

  return {
    createMutation,
    updateMutation,
    archiveMutation,
    restoreMutation,
    skuMutation,
    imageUploadMutation,
    imageCreateMutation,
    imageUpdateMutation,
    imageRemoveMutation
  };
}
