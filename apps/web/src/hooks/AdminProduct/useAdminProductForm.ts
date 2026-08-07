import { useForm } from '@mantine/form';
import {
  validateAdminProductName,
  validateAdminProductSlug
} from '@/validation/AdminProduct/adminProductValidation';

export function useAdminProductForm() {
  return useForm({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      status: 'draft',
      brand: '',
      category: '',
      tags: '',
      flavor: '',
      occasion: '',
      ingredients: '',
      allergens: '',
      nutritionFacts: '',
      dietaryLabels: '',
      isPerishable: false,
      storageInstructions: '',
      shelfLifeNotes: '',
      bundleEligible: false,
      seoTitle: '',
      seoDescription: ''
    },
    validate: {
      name: validateAdminProductName,
      slug: validateAdminProductSlug
    }
  });
}

export function useAdminProductImageForm() {
  return useForm({
    initialValues: {
      url: '',
      objectKey: '',
      storageProvider: 'cloudinary',
      contentType: 'image/jpeg',
      alt: '',
      sortOrder: 0
    },
    validate: {
      url: (value) => (value.trim().length === 0 ? 'Image URL is required.' : null),
      alt: (value) => (value.length > 160 ? 'Use 160 characters or fewer.' : null),
      sortOrder: (value) => (value < 0 ? 'Sort order must be zero or greater.' : null)
    }
  });
}
