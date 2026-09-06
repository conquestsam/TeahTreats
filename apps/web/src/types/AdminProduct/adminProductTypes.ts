import type { AdminProductSummary } from '@snacks/shared';
export type {
  AdminProductImageSummary as AdminProductImageModel,
  AdminProductImageUploadSummary,
  AdminProductSkuSummary as AdminProductSkuModel,
  AdminProductSummary as AdminProductModel,
  CreateAdminProductImageInput,
  CreateAdminProductInput,
  CreateAdminProductSkuInput,
  UpdateAdminProductImageInput,
  UpdateAdminProductInput
} from '@snacks/shared';

export type AdminProductModalMode =
  | 'create'
  | 'edit'
  | 'details'
  | 'archive'
  | 'restore'
  | 'image-create'
  | 'image-edit'
  | 'image-remove'
  | null;

export interface AdminProductActionHandlers {
  onDetails: (product: AdminProductSummary) => void;
  onEdit: (product: AdminProductSummary) => void;
  onArchive: (product: AdminProductSummary) => void;
  onRestore: (product: AdminProductSummary) => void;
}
