import { AuraFilterId, AuraFilterOptions } from 'hooks/useFilters';
import { AuraSelectedSort, AuraSortId, AuraSortOptions } from 'hooks/useSorts';
import { useCallback, useEffect, useMemo, useState } from 'react';

export enum SortCategoryId {
  Default = 'Default',
}

export enum FilterCategoryId {
  Default = 'Default',
  YourEvaluation = 'Your Evaluation',
  Confidence = 'Confidence',
  EvaluatorLevel = "Evaluator's level",
  Level = 'Level',
  ConnectionType = 'Connection Type',
}

export enum FilterCategoryType {
  Exclusive = 'Exclusive',
  Conjunctive = 'Conjunctive',
  Disjunctive = 'Disjunctive',
}

const filterCategories: {
  [key in FilterCategoryId]: {
    type: FilterCategoryType;
  };
} = {
  [FilterCategoryId.Default]: {
    type: FilterCategoryType.Conjunctive,
  },
  [FilterCategoryId.YourEvaluation]: {
    type: FilterCategoryType.Exclusive,
  },
  [FilterCategoryId.Level]: {
    type: FilterCategoryType.Disjunctive,
  },
  [FilterCategoryId.Confidence]: {
    type: FilterCategoryType.Disjunctive,
  },
  [FilterCategoryId.EvaluatorLevel]: {
    type: FilterCategoryType.Disjunctive,
  },
  [FilterCategoryId.ConnectionType]: {
    type: FilterCategoryType.Disjunctive,
  },
};

export default function useFilterAndSort<T>(
  items: T[] | null,
  filters: AuraFilterOptions<T>,
  sorts: AuraSortOptions<T>,
  searchKeys?: (keyof T)[],
  localStoragePrefix?: string,
) {
  const [selectedFilterIds, setSelectedFilterIds] = useState<
    AuraFilterId[] | null
  >(null);
  const toggleFiltersById = useCallback(
    (filterIds: AuraFilterId[] | null, forceNewValue = false) => {
      setSelectedFilterIds((value) => {
        let newValue: AuraFilterId[] = [];
        if (filterIds !== null) {
          if (forceNewValue) {
            newValue = filterIds;
          } else {
            newValue = value ?? [];
            filterIds.forEach((filterId) => {
              const filter = filters.find((f) => f.id === filterId);
              if (filter) {
                newValue = newValue.includes(filterId)
                  ? newValue.filter((f) => f !== filterId)
                  : filterCategories[filter.category].type ===
                      FilterCategoryType.Exclusive
                    ? [
                        ...(value?.filter(
                          (fid) =>
                            filters.find((f) => f.id === fid)?.category !==
                            filter.category,
                        ) || []),
                        filterId,
                      ]
                    : [...(value || []), filterId];
              }
            });
          }
        }
        const newValueFinal = newValue.length > 0 ? newValue : null;
        if (localStoragePrefix) {
          if (newValueFinal !== null) {
            localStorage.setItem(
              localStoragePrefix + 'FilterIds',
              JSON.stringify(newValue),
            );
          } else {
            localStorage.removeItem(localStoragePrefix + 'FilterIds');
          }
        }
        return newValueFinal;
      });
    },
    [filters, localStoragePrefix],
  );

  const [selectedSortId, setSelectedSortId] = useState<AuraSortId | null>(null);
  const [isSortReversed, setIsSortReversed] = useState(false);

  const setSelectedSort = useCallback(
    (id: AuraSortId | null, ascending?: boolean) => {
      let sortId: AuraSortId | null = null;
      let isSortReversed = false;
      if (id) {
        const obj = sorts.find((s) => s.id === id);
        if (obj) {
          sortId = id;
          if (ascending !== undefined) {
            isSortReversed = obj.defaultAscending !== ascending;
          } else {
            isSortReversed = false;
          }
        } else {
          return;
        }
      }
      if (localStoragePrefix) {
        if (sortId !== null) {
          localStorage.setItem(localStoragePrefix + 'SortId', String(sortId));
        } else {
          localStorage.removeItem(localStoragePrefix + 'SortId');
        }
        localStorage.setItem(
          localStoragePrefix + 'IsSortReversed',
          String(isSortReversed),
        );
      }
      setSelectedSortId(sortId);
      setIsSortReversed(isSortReversed);
    },
    [localStoragePrefix, sorts],
  );

  useEffect(() => {
    if (localStoragePrefix) {
      const filterIds = localStorage.getItem(localStoragePrefix + 'FilterIds');
      try {
        if (filterIds && Array.isArray(JSON.parse(filterIds))) {
          setSelectedFilterIds(JSON.parse(filterIds));
        }
      } catch (e) {}
      const sortId = localStorage.getItem(localStoragePrefix + 'SortId');
      if (sortId) {
        setSelectedSortId(Number(sortId));
      }
      setIsSortReversed(
        localStorage.getItem(localStoragePrefix + 'IsSortReversed') === 'true',
      );
    }
  }, [localStoragePrefix]);

  const [searchString, setSearchString] = useState('');
  const selectedFilters = useMemo(
    () =>
      selectedFilterIds
        ? filters.filter((f) => selectedFilterIds.includes(f.id))
        : null,
    [filters, selectedFilterIds],
  );
  const selectedSort: AuraSelectedSort<T> | null = useMemo(() => {
    const obj = sorts.find((s) => s.id === selectedSortId);
    if (obj) {
      return {
        ...obj,
        isReversed: isSortReversed,
      };
    }
    return null;
  }, [isSortReversed, selectedSortId, sorts]);

  const itemsFiltered: T[] | null = useMemo(() => {
    if (items === null) return null;
    let result = [...items];
    if (searchString && searchKeys?.length) {
      const searchStringFinal = searchString.trim().toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) =>
          String(item[key]).toLowerCase().includes(searchStringFinal),
        ),
      );
    } else if (selectedFilters) {
      const filtersByCategory: {
        [category in FilterCategoryId]: AuraFilterOptions<T>;
      } = {
        [FilterCategoryId.Default]: [],
        [FilterCategoryId.YourEvaluation]: [],
        [FilterCategoryId.Level]: [],
        [FilterCategoryId.EvaluatorLevel]: [],
        [FilterCategoryId.ConnectionType]: [],
        [FilterCategoryId.Confidence]: [],
      };

      for (const item of selectedFilters) {
        filtersByCategory[item.category].push(item);
      }
      Object.values(FilterCategoryId).forEach((fcid) => {
        if (filtersByCategory[fcid].length > 0) {
          if (filterCategories[fcid].type === FilterCategoryType.Disjunctive) {
            let currentResult: T[] = [];
            filtersByCategory[fcid].forEach((selectedFilter) => {
              const filteredItems = result.filter(selectedFilter.func);
              currentResult = [
                ...new Set([...currentResult, ...filteredItems]),
              ];
            });
            result = [...currentResult];
          } else {
            filtersByCategory[fcid].forEach((selectedFilter) => {
              result = result.filter(selectedFilter.func);
            });
          }
        }
      });
    }
    if (selectedSort) {
      result.sort(selectedSort?.func);
    }
    return selectedSort?.isReversed ? result.reverse() : result;
  }, [items, searchString, searchKeys, selectedFilters, selectedSort]);

  const clearSort = useCallback(() => {
    setSelectedSort(null);
  }, [setSelectedSort]);

  const clearFilter = useCallback(() => {
    toggleFiltersById(null);
  }, [toggleFiltersById]);

  const clearSortAndFilter = useCallback(() => {
    clearSort();
    clearFilter();
  }, [clearFilter, clearSort]);

  return {
    selectedFilters,
    selectedSort,
    selectedFilterIds,
    toggleFiltersById,
    selectedSortId,
    setSelectedSort,
    searchString,
    setSearchString,
    itemsOriginal: items,
    itemsFiltered,
    clearSort,
    clearFilter,
    clearSortAndFilter,
  };
}
