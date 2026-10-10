import { computed } from 'vue';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import useNotify from 'src/modules/shared/composables/useNotify';
import useHandlerErrors from 'src/modules/shared/composables/useHandlerErrors';
import useVueQuery from 'src/modules/shared/composables/useVueQuery';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/organizationApi';
import type { CategoryPayload, CategorySummary } from '../interfaces/organization';

const CATEGORIES_KEY = ['categories'];

export const SUGGESTED_CATEGORY_KEYS = [
  'hardware',
  'software',
  'network',
  'access',
  'email',
  'printing',
  'businessSystems',
  'other',
] as const;

export const useCategories = () => {
  const { t } = useI18n();

  const { data, isFetching } = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const categories = computed(() => data.value ?? []);

  const categoryOptions = computed(() =>
    categories.value
      .filter((category) => category.isActive)
      .map((category) => ({ value: category.id, label: category.name })),
  );

  const allCategoryOptions = computed(() =>
    categories.value.map((category) => ({ value: category.id, label: category.name })),
  );

  const categoryLabel = (category?: CategorySummary | null) =>
    category?.name ?? t('categories.none');

  return { categories, categoryOptions, allCategoryOptions, categoryLabel, isFetching };
};

export const useCategoryMutations = () => {
  const { t } = useI18n();
  const { successNotify } = useNotify();
  const { handleApiResponseError } = useHandlerErrors();
  const { invalidQuery } = useVueQuery();

  const invalidateCategories = () => invalidQuery({ queryKey: CATEGORIES_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: (category) => {
      successNotify(t('categories.notify.created', { name: category.name }));
      invalidateCategories();
    },
    onError: handleApiResponseError,
  });

  const createManyMutation = useMutation({
    mutationFn: async (payloads: CategoryPayload[]) => {
      for (const payload of payloads) await createCategory(payload);
      return payloads.length;
    },
    onSuccess: (count) => {
      successNotify(t('categories.notify.suggestedAdded', { n: count }));
      invalidateCategories();
    },
    onError: (error) => {
      invalidateCategories();
      handleApiResponseError(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoryPayload> }) =>
      updateCategory(id, payload),
    onSuccess: (category) => {
      successNotify(t('categories.notify.updated', { name: category.name }));
      invalidateCategories();
    },
    onError: handleApiResponseError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: (category) => {
      successNotify(t('categories.notify.deleted', { name: category.name }));
      invalidateCategories();
    },
    onError: handleApiResponseError,
  });

  return { createMutation, createManyMutation, updateMutation, deleteMutation };
};
