import { FiltersModal } from 'components/EvaluationFlow/FiltersModal';
import { SortsModal } from 'components/EvaluationFlow/SortsModal';
import { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import Dropdown from 'components/Shared/Dropdown';
import { useSubjectInboundConnectionsContext } from 'contexts/SubjectInboundConnectionsContext';
import { AuraFilterId } from 'hooks/useFilters';
import { AuraSortId } from 'hooks/useSorts';
import { AuraFilterDropdownOption } from 'types';
import SubjectConnectionsHelpBody from './subject-connections-help-modal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function FilterAndSortModalBody({ subjectId }: { subjectId: string }) {
  const {
    selectedFilterIds,
    toggleFiltersById,
    selectedSort,
    setSelectedSort,
    filters,
    sorts,
  } = useSubjectInboundConnectionsContext({ subjectId });

  return (
    <div>
      <p className="font-bold text-black2 dark:text-gray-100">Filters</p>
      <Separator className="my-5" />
      <FiltersModal
        testidPrefix={'subject-filter'}
        filters={filters}
        selectedFilterIds={selectedFilterIds}
        toggleFiltersById={toggleFiltersById}
      />
      <p className="pb-1 pt-3 font-bold text-black2 dark:text-gray-100">
        Sorts
      </p>
      <Separator className="my-5" />
      <SortsModal
        testidPrefix={'subject-sort'}
        sorts={sorts}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />
    </div>
  );
}

export const ConnectionListSearch = ({ subjectId }: { subjectId: string }) => {
  const {
    itemsOriginal,
    itemsFiltered: filteredSubjects,
    searchString,
    setSearchString,
    selectedFilters,
    selectedSort,
    clearSortAndFilter,
    toggleFiltersById,
    setSelectedSort,
  } = useSubjectInboundConnectionsContext({
    subjectId,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const customViewOption = useMemo(
    () => ({
      value: -1,
      label: <p>Custom view</p>,
      filterIds: null,
      sortId: null,
      onClick: () => setIsModalOpen(true),
    }),
    [],
  );
  const defaultOption = useMemo(
    () => ({
      value: 0,
      label: <p>Smart Sort (default)</p>,
      filterIds: null,
      sortId: null,
      onClick: () => clearSortAndFilter(),
    }),
    [clearSortAndFilter],
  );
  const dropdownOptions: AuraFilterDropdownOption[] = useMemo(
    () => [
      defaultOption,
      ...[
        {
          value: 2,
          label: <p>Their Recovery</p>,
          filterIds: [AuraFilterId.TheirRecovery],
          sortId: AuraSortId.ConnectionLastUpdated,
          ascending: false,
        },
        {
          value: 3,
          label: <p>Recovery</p>,
          filterIds: [AuraFilterId.ConnectionTypeRecovery],
          sortId: AuraSortId.ConnectionLastUpdated,
          ascending: false,
        },
        {
          value: 4,
          label: <p>Already known+</p>,
          filterIds: [AuraFilterId.ConnectionTypeAlreadyKnownPlus],
          sortId: AuraSortId.ConnectionLastUpdated,
          ascending: false,
        },
      ].map((item) => ({
        ...item,
        onClick: () => {
          toggleFiltersById(item.filterIds, true);
          setSelectedSort(item.sortId, item.ascending);
        },
      })),
      customViewOption,
    ],
    [customViewOption, defaultOption, setSelectedSort, toggleFiltersById],
  );

  const selectedItem: AuraFilterDropdownOption = useMemo(() => {
    if (!selectedFilters && !selectedSort) {
      return defaultOption;
    }
    const selectedItem = dropdownOptions.find((item) => {
      const isSelectedSort =
        selectedSort?.id === item.sortId &&
        item.ascending ===
          (selectedSort.defaultAscending !== selectedSort.isReversed);
      if (!isSelectedSort) return false;
      if (!selectedFilters) return !item.filterIds;
      if (!item.filterIds) return false;
      const selectedFilterIdsSorted = selectedFilters.map((f) => f.id).sort();
      const itemFilterIdsSorted = [...item.filterIds].sort();
      for (let i = 0; i < selectedFilterIdsSorted.length; i++) {
        if (itemFilterIdsSorted[i] !== selectedFilterIdsSorted[i]) return false;
      }
      return true;
    });
    return selectedItem ?? customViewOption;
  }, [
    customViewOption,
    defaultOption,
    dropdownOptions,
    selectedFilters,
    selectedSort,
  ]);

  return (
    <>
      <div className="mb-3 mt-3 flex items-center text-lg">
        <Dropdown
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          items={dropdownOptions}
          selectedItem={selectedItem}
          onItemClick={(item) => item.onClick()}
          className="h-10 w-full"
        />
        <Dialog
          open={isModalOpen}
          onOpenChange={(value) => setIsModalOpen(value)}
        >
          <DialogContent>
            <DialogHeader className="font-semibold">
              <DialogTitle>Custom View</DialogTitle>
            </DialogHeader>
            <FilterAndSortModalBody subjectId={subjectId} />
            <DialogFooter className="mt-5">
              <Button
                variant="outline"
                onClick={() => {
                  clearSortAndFilter();
                }}
                className="w-full flex-1 px-6 py-2 sm:w-auto"
              >
                Clear
              </Button>
              <Button
                variant="secondary"
                className="w-full flex-1 px-6 py-2 sm:w-auto"
                data-testid="subject-sort-option-Confidence-ascending"
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Ok
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isHelpModalOpen}
          onOpenChange={(value) => setIsHelpModalOpen(value)}
        >
          <DialogContent>
            <DialogHeader className="font-semibold">
              <DialogTitle>Understanding Connections</DialogTitle>
            </DialogHeader>
            <SubjectConnectionsHelpBody
              selectedItemIndex={selectedItem.value}
            />
          </DialogContent>
        </Dialog>
        <img
          className="ml-3 h-5 w-5 cursor-pointer"
          src="/assets/images/SubjectProfile/evidence-info-icon.svg"
          alt="help"
          onClick={() => setIsHelpModalOpen(true)}
        />
        <span className="ml-auto flex items-center">
          (
          {filteredSubjects?.filter((e) => e.inboundConnection).length ??
            itemsOriginal?.length ??
            '...'}{' '}
          result
          {(filteredSubjects?.filter((e) => e.inboundConnection).length ??
            itemsOriginal?.length) !== 1
            ? 's'
            : ''}
          )
        </span>
      </div>
      <div className="input-wrapper-focus flex max-h-[175px] flex-1 flex-col justify-center gap-4 rounded-lg border bg-card p-1 text-card-foreground">
        <div className="card__input flex items-center gap-2 rounded px-3.5">
          <img
            className="h-4 w-4"
            src="/assets/images/Shared/search-icon.svg"
            alt=""
          />
          <input
            className="h-11 w-full bg-card text-sm font-medium text-card-foreground placeholder-black2 focus:outline-none dark:placeholder:text-gray-50"
            type="text"
            placeholder="Search in these results"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
