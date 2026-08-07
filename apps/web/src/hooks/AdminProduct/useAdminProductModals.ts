import { useState } from 'react';
import type {
  AdminProductImageModel,
  AdminProductModalMode,
  AdminProductModel
} from '@/types/AdminProduct/adminProductTypes';

export function useAdminProductModals() {
  const [mode, setMode] = useState<AdminProductModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductModel | null>(null);
  const [selectedImage, setSelectedImage] = useState<AdminProductImageModel | null>(null);

  const closeModal = () => {
    setMode(null);
    setSelectedProduct(null);
    setSelectedImage(null);
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setMode('create');
  };

  const openEdit = (product: AdminProductModel) => {
    setSelectedProduct(product);
    setMode('edit');
  };

  const openDetails = (product: AdminProductModel) => {
    setSelectedProduct(product);
    setMode('details');
  };

  const openArchive = (product: AdminProductModel) => {
    setSelectedProduct(product);
    setMode('archive');
  };

  const openCreateImage = (product: AdminProductModel) => {
    setSelectedProduct(product);
    setSelectedImage(null);
    setMode('image-create');
  };

  const openEditImage = (product: AdminProductModel, image: AdminProductImageModel) => {
    setSelectedProduct(product);
    setSelectedImage(image);
    setMode('image-edit');
  };

  const openRemoveImage = (product: AdminProductModel, image: AdminProductImageModel) => {
    setSelectedProduct(product);
    setSelectedImage(image);
    setMode('image-remove');
  };

  const openRestore = (product: AdminProductModel) => {
    setSelectedProduct(product);
    setMode('restore');
  };

  return {
    mode,
    selectedProduct,
    selectedImage,
    setSelectedProduct,
    closeModal,
    openCreate,
    openEdit,
    openDetails,
    openArchive,
    openRestore,
    openCreateImage,
    openEditImage,
    openRemoveImage
  };
}
