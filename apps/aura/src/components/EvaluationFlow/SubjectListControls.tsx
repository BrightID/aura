import { FiltersModal } from "components/EvaluationFlow/FiltersModal"
import { SortsModal } from "components/EvaluationFlow/SortsModal"
import { useSubjectsListContext } from "contexts/SubjectsListContext"
import { useMyEvaluations } from "hooks/useMyEvaluations"
import { RefreshCcwIcon, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"

import { cn } from "@/lib/utils"

import useBrightIdBackupWithAuraConnectionData from "../../hooks/useBrightIdBackupWithAuraConnectionData"
import { AuraSortId } from "../../hooks/useSorts"
import useViewMode from "../../hooks/useViewMode"
import { AuraFilterDropdownOption } from "../../types"
import { PreferredView } from "../../types/dashboard"
import Dropdown from "../Shared/Dropdown"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"

function FilterAndSortModalBody({ isPlayerMode }: { isPlayerMode: boolean }) {
  const {
    selectedFilterIds,
    toggleFiltersById,
    selectedSort,
    setSelectedSort,
    filters,
    sorts,
  } = useSubjectsListContext()

  return (
    <div>
      <p className="font-bold text-black2 dark:text-gray-100">Filters</p>
      <Separator className="my-4" />
      <FiltersModal
        includeConnectionFilters={isPlayerMode}
        testidPrefix={"subject-filter"}
        filters={filters}
        selectedFilterIds={selectedFilterIds}
        toggleFiltersById={toggleFiltersById}
      />
      <p className="pb-1 pt-3 font-bold text-black2 dark:text-gray-100">
        Sorts
      </p>
      <Separator className="my-4" />
      <SortsModal
        includeLastConnectionFilter={isPlayerMode}
        testidPrefix={"subject-sort"}
        sorts={sorts}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />
    </div>
  )
}

export const SubjectListControls = ({
  refreshBrightIdBackup,
  loading: contextLoading,
}: {
  refreshBrightIdBackup: () => void
  loading?: boolean
}) => {
  const {
    searchString,
    setSearchString,
    selectedFilters,
    selectedSort,
    clearSortAndFilter,
    toggleFiltersById,
    setSelectedSort,
  } = useSubjectsListContext()
  const { refreshOutboundRatings, loading } = useMyEvaluations()

  const brightIdBackup = useBrightIdBackupWithAuraConnectionData()

  const { currentViewMode, setPreferredView } = useViewMode()

  const [params] = useSearchParams()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const customViewOption = useMemo(
    () => ({
      value: -1,
      label: <p>Custom view</p>,
      filterIds: null,
      sortId: null,
      onClick: () => setIsModalOpen(true),
    }),
    [],
  )
  const defaultOption = useMemo(
    () => ({
      value: 0,
      label: <p>Recent connections (default)</p>,
      filterIds: null,
      sortId: null,
      onClick: () => clearSortAndFilter(),
    }),
    [clearSortAndFilter],
  )

  const dropdownOptions: AuraFilterDropdownOption[] = useMemo(() => {
    if (params.has("subjectId") || currentViewMode === PreferredView.PLAYER) {
      return [
        defaultOption,
        ...[
          {
            value: 2,
            label: <p>Recently evaluated</p>,
            filterIds: null,
            sortId: AuraSortId.ConnectionRecentEvaluation,
            ascending: false,
          },
        ].map((item) => ({
          ...item,
          onClick: () => {
            toggleFiltersById(item.filterIds, true)
            setSelectedSort(item.sortId, item.ascending)
          },
        })),
        customViewOption,
      ]
    }

    return [
      ...[
        {
          value: 2,
          label: <p>Recently evaluated (default)</p>,
          filterIds: null,
          sortId: AuraSortId.ConnectionRecentEvaluation,
          ascending: false,
        },
      ].map((item) => ({
        ...item,
        onClick: () => {
          toggleFiltersById(item.filterIds, true)
          setSelectedSort(item.sortId, item.ascending)
        },
      })),
      customViewOption,
    ]
  }, [
    currentViewMode,
    customViewOption,
    defaultOption,
    params,
    setSelectedSort,
    toggleFiltersById,
  ])

  const selectedItem: AuraFilterDropdownOption = useMemo(() => {
    if (!selectedFilters && !selectedSort) {
      if (params.has("subjectId") || currentViewMode === PreferredView.PLAYER)
        return defaultOption

      return {
        value: 2,
        label: <p>Recently evaluated (default)</p>,
        filterIds: null,
        sortId: AuraSortId.ConnectionRecentEvaluation,
        ascending: false,
        onClick: () => {
          toggleFiltersById(null, true)
          setSelectedSort(AuraSortId.ConnectionRecentEvaluation, false)
        },
      }
    }

    const selectedItem = dropdownOptions.find((item) => {
      const isSelectedSort =
        selectedSort?.id === item.sortId &&
        item.ascending ===
          (selectedSort.defaultAscending !== selectedSort.isReversed)
      if (!isSelectedSort) return false
      if (!selectedFilters) return !item.filterIds
      if (!item.filterIds) return false
      const selectedFilterIdsSorted = selectedFilters.map((f) => f.id).sort()
      const itemFilterIdsSorted = [...item.filterIds].sort()
      for (let i = 0; i < selectedFilterIdsSorted.length; i++) {
        if (itemFilterIdsSorted[i] !== selectedFilterIdsSorted[i]) return false
      }
      return true
    })
    return selectedItem ?? customViewOption
  }, [
    currentViewMode,
    customViewOption,
    defaultOption,
    dropdownOptions,
    params,
    selectedFilters,
    selectedSort,
    setSelectedSort,
    toggleFiltersById,
  ])

  useEffect(() => {
    if (params.has("subjectId") || currentViewMode === PreferredView.PLAYER) {
      // if (selectedSort?.id === AuraSortId.ConnectionRecentEvaluation)
      //   setSelectedSort(null);
      return
    }

    if (!selectedSort?.id)
      setSelectedSort(AuraSortId.ConnectionRecentEvaluation)
  }, [currentViewMode, selectedSort, params, setSelectedSort])

  useEffect(() => {
    if (!params.get("search")) {
      setSearchString("")
      return
    }

    setSearchString(params.get("search") || "")
  }, [params, setSearchString])

  const { itemsFiltered: filteredSubjects } = useSubjectsListContext()

  return (
    <>
      <div className="input-wrapper-focus flex max-h-[175px] flex-1 flex-col justify-center gap-4 rounded-lg border bg-card p-1 text-card-foreground">
        <div className="card__input flex items-center gap-2 rounded px-3.5">
          <Search className="text-stone-700" />

          <input
            className="h-11 w-full bg-transparent text-sm font-medium text-card-foreground placeholder-black2 focus:outline-none dark:placeholder:text-gray-50"
            type="text"
            data-testid="home-searchbar"
            placeholder="Subject name or ID ..."
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
      </div>
      {[
        PreferredView.MANAGER_EVALUATING_MANAGER,
        PreferredView.MANAGER_EVALUATING_TRAINER,
      ].includes(currentViewMode) && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <p className="font-semibold">
            Showing{" "}
            {currentViewMode === PreferredView.MANAGER_EVALUATING_TRAINER
              ? "Trainer "
              : "Manager "}{" "}
            evaluations
          </p>
          <a-button
            size="sm"
            onClick={() =>
              setPreferredView(
                currentViewMode === PreferredView.MANAGER_EVALUATING_TRAINER
                  ? PreferredView.MANAGER_EVALUATING_MANAGER
                  : PreferredView.MANAGER_EVALUATING_TRAINER,
              )
            }
            variant="secondary"
            className=""
          >
            {currentViewMode === PreferredView.MANAGER_EVALUATING_TRAINER
              ? "View Managers"
              : "View Trainers"}
          </a-button>
        </div>
      )}

      <div className="mb-3 mt-3 flex items-center text-lg">
        <Dropdown
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          items={dropdownOptions}
          selectedItem={selectedItem}
          onItemClick={(item) => item.onClick()}
          className="h-10"
          data-testid="home-view-select"
        />
        <Dialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          aria-labelledby="custom-view-title"
        >
          <DialogContent
            className="max-w-md sm:max-w-lg"
            aria-describedby="custom-view-description"
          >
            <DialogHeader>
              <DialogTitle
                className="text-xl font-semibold"
                data-testid="custom-view-title"
              >
                Custom View
              </DialogTitle>
              <DialogDescription
                id="custom-view-description"
                className="text-sm text-muted-foreground"
              >
                Customize your view with filters and sorting options
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-96 py-4 text-base">
              <FilterAndSortModalBody
                isPlayerMode={currentViewMode === PreferredView.PLAYER}
              />
            </ScrollArea>

            <DialogFooter>
              <a-button
                variant="outline"
                data-testid="custom-view-clear-button"
                onClick={() => {
                  clearSortAndFilter()
                }}
                className="w-full flex-1 px-6 py-2 sm:w-auto"
              >
                Clear
              </a-button>
              <a-button
                variant="secondary"
                className="w-full flex-1 px-6 py-2 sm:w-auto"
                data-testid="custom-view-ok-button"
                onClick={() => {
                  setIsModalOpen(false)
                }}
              >
                Ok
              </a-button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <span data-testid="home-subject-results" className="ml-auto">
          (
          {filteredSubjects?.length ??
            brightIdBackup?.connections.length ??
            "..."}{" "}
          result
          {(filteredSubjects?.length ?? brightIdBackup?.connections.length) !==
          1
            ? "s"
            : ""}
          )
        </span>
        <a-button
          onClick={() => {
            refreshBrightIdBackup()
            refreshOutboundRatings()
          }}
          disabled={loading || contextLoading}
          className="ml-1"
          variant="default"
          size={"icon"}
        >
          <RefreshCcwIcon
            className={cn(
              "h-3 w-3 cursor-pointer",
              (loading || contextLoading) && "animate-spin",
            )}
          />
        </a-button>
      </div>
    </>
  )
}
