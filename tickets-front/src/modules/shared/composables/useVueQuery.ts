import type { InvalidateQueryFilters } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

const useVueQuery = () => {
  const queryClient = useQueryClient();

  const invalidQuery = (filters: InvalidateQueryFilters) => {
    void queryClient.invalidateQueries(filters);
  };

  const removeAllQueries = () => {
    queryClient.removeQueries();
  };

  return { invalidQuery, removeAllQueries };
};

export default useVueQuery;
