import { ModalSortItem } from 'components/Shared/Modal/ModalSortItem';
import { SortCategoryId } from 'hooks/useFilterAndSort';
import {
  AuraSelectedSort,
  AuraSortId,
  AuraSortOptions,
  useCategorizeAuraSortOptions,
} from 'hooks/useSorts';
import * as React from 'react';
import { useCallback } from 'react';

//TODO: merge this with FiltersModal
export function SortsModal<T>({
  sorts,
  selectedSort,
  setSelectedSort,
  testidPrefix,
  includeLastConnectionFilter = true,
}: {
  sorts: AuraSortOptions<T>;
  selectedSort: AuraSelectedSort<T> | null;
  setSelectedSort: (id: AuraSortId, ascending?: boolean) => void;
  testidPrefix?: string;
  includeLastConnectionFilter?: boolean;
}) {
  const res = useCategorizeAuraSortOptions(sorts);

  const filteredCategories = React.useMemo(() => {
    if (includeLastConnectionFilter) return res;

    return {
      ...res,
      Default: res.Default?.filter((item) => item.title !== 'Last Connected'),
    };
  }, [res, includeLastConnectionFilter]);

  const isSelectedSort = useCallback(
    (id: AuraSortId, ascending: boolean) => {
      return (
        selectedSort?.id === id &&
        ascending ===
          (selectedSort.defaultAscending !== selectedSort.isReversed)
      );
    },
    [selectedSort],
  );
  return (
    <div className="w-full flex flex-col gap-5">
      {(Object.keys(filteredCategories) as SortCategoryId[]).map((category) => (
        <div className="flex flex-col gap-3" key={category}>
          {category !== SortCategoryId.Default && (
            <p className="text-black2">{category}</p>
          )}
          {filteredCategories[category]?.map((item) => (
            <div key={item.id}>
              <p className="text-black2 dark:text-gray-100 pb-2">
                {item.title}
              </p>
              <div className="flex flex-row gap-2">
                <ModalSortItem
                  testidPrefix={testidPrefix}
                  item={item}
                  isSelectedSort={isSelectedSort}
                  setSelectedSort={setSelectedSort}
                  isAscending={item.defaultAscending}
                />
                {!item.justDefaultDirection && (
                  <ModalSortItem
                    testidPrefix={testidPrefix}
                    item={item}
                    isSelectedSort={isSelectedSort}
                    setSelectedSort={setSelectedSort}
                    isAscending={!item.defaultAscending}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
