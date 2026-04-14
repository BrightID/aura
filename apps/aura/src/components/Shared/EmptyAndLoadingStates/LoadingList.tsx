export const LoadingList = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, key) => (
        <SimpleSubjectCardSkeleton key={key} />
      ))}
    </div>
  );
};

export const SimpleSubjectCardSkeleton = () => {
  return (
    <div className="b-4 flex w-full !flex-row items-center !justify-between gap-1 rounded-lg border bg-card p-4">
      <div className="evaluation-left flex flex-col gap-2">
        <div className="evaluation-left__top flex gap-3">
          {/* Profile picture skeleton */}
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />

          <div className="flex flex-col gap-2">
            {/* Name skeleton */}
            <div className="h-4 w-32 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />

            {/* Level and Score skeleton */}
            <div className="flex flex-col gap-1">
              <div className="h-4 w-24 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Progress bar skeleton */}
            <div className="mt-1 h-2.5 w-36 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* Connection status skeleton */}
        <div className="mt-2">
          <div className="h-4 w-40 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="flex flex-col items-end">
        <div className="h-[48px] w-[100px] animate-pulse rounded-sm bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};
