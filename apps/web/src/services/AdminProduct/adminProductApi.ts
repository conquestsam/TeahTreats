import { apiFetch } from '@/lib/api/client';
import type {
  AdminProductModel,
  CreateAdminProductImageInput,
  CreateAdminProductInput,
  CreateAdminProductSkuInput,
  AdminProductImageUploadSummary,
  UpdateAdminProductImageInput,
  UpdateAdminProductInput
} from '@/types/AdminProduct/adminProductTypes';

interface ApiEnvelope<TData> {
  data: TData;
}

export function listAdminProducts() {
  return apiFetch<ApiEnvelope<AdminProductModel[]>>('/admin/catalog/products').then(
    (response) => response.data,
  );
}

export function createAdminProduct(input: CreateAdminProductInput) {
  return apiFetch<ApiEnvelope<AdminProductModel>>('/admin/catalog/products', {
    method: 'POST',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function updateAdminProduct(productId: string, input: UpdateAdminProductInput) {
  return apiFetch<ApiEnvelope<AdminProductModel>>(`/admin/catalog/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  }).then((response) => response.data);
}

export function archiveAdminProduct(productId: string) {
  return apiFetch<ApiEnvelope<AdminProductModel>>(`/admin/catalog/products/${productId}/archive`, {
    method: 'POST'
  }).then((response) => response.data);
}

export function restoreAdminProduct(productId: string) {
  return apiFetch<ApiEnvelope<AdminProductModel>>(`/admin/catalog/products/${productId}/restore`, {
    method: 'POST'
  }).then((response) => response.data);
}

export function createAdminProductSku(productId: string, input: CreateAdminProductSkuInput) {
  return apiFetch<ApiEnvelope<AdminProductModel['skus'][number]>>(
    `/admin/catalog/products/${productId}/skus`,
    {
      method: 'POST',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}

export function requestAdminProductImageUpload(productId: string, contentType: string) {
  return apiFetch<ApiEnvelope<AdminProductImageUploadSummary>>(
    `/admin/catalog/products/${productId}/images/upload`,
    {
      method: 'POST',
      body: JSON.stringify({ contentType })
    },
  ).then((response) => response.data);
}

export function createAdminProductImage(productId: string, input: CreateAdminProductImageInput) {
  return apiFetch<ApiEnvelope<AdminProductModel['images'][number]>>(
    `/admin/catalog/products/${productId}/images`,
    {
      method: 'POST',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}

export function updateAdminProductImage(
  productId: string,
  imageId: string,
  input: UpdateAdminProductImageInput,
) {
  return apiFetch<ApiEnvelope<AdminProductModel['images'][number]>>(
    `/admin/catalog/products/${productId}/images/${imageId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input)
    },
  ).then((response) => response.data);
}

export function removeAdminProductImage(productId: string, imageId: string) {
  return apiFetch<ApiEnvelope<AdminProductModel['images'][number]>>(
    `/admin/catalog/products/${productId}/images/${imageId}`,
    {
      method: 'DELETE'
    },
  ).then((response) => response.data);
}
