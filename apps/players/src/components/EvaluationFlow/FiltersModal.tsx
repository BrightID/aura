import { ModalItem } from 'components/Shared/Modal/ModalItem';
import { FilterCategoryId } from 'hooks/useFilterAndSort';
import {
  AuraFilterId,
  AuraFilterOptions,
  useCategorizeAuraFilterOptions,
} from 'hooks/useFilters';
import { useMemo } from 'react';

export function FiltersModal<T>({
  filters,
  selectedFilterIds,
  toggleFiltersById,
  testidPrefix,
  includeConnectionFilters = true,
}: {
  filters: AuraFilterOptions<T>;
  selectedFilterIds: AuraFilterId[] | null;
  toggleFiltersById: (item: AuraFilterId[] | null) => void;
  testidPrefix?: string;
  includeConnectionFilters?: boolean;
}) {
  const res = useCategorizeAuraFilterOptions(filters);

  const filteredCategories = useMemo(() => {
    if (includeConnectionFilters) return res;

    const { 'Connection Type': _, ...rest } = res;

    return rest;
  }, [res, includeConnectionFilters]);

  return (
    <div className="w-full flex flex-col gap-5">
      {(Object.keys(filteredCategories) as FilterCategoryId[]).map(
        (category) => (
          <div className="flex flex-col gap-3" key={category}>
            <p className="text-black2 dark:text-gray-200">
              {category !== FilterCategoryId.Default && category}
            </p>
            <div className="flex flex-row flex-wrap gap-2">
              {res[category]?.map((item) => (
                <ModalItem
                  data-testid={`${testidPrefix}-option-${item.title
                    .split(' ')
                    .join('')}`}
                  key={item.id}
                  title={item.title}
                  isSelected={selectedFilterIds?.includes(item.id) ?? false}
                  onClick={() => toggleFiltersById([item.id])}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
