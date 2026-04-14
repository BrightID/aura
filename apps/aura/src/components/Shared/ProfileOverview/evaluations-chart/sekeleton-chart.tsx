import { Skeleton } from '@/components/ui/skeleton';

const SkeletonChart = () => (
  <div className="mb-12 h-52 w-full">
    <div className="flex h-full flex-col">
      <div className="my-2 flex justify-end gap-2 sm:mb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-6 rounded-md" />
        ))}
      </div>
      <div className="relative flex-1">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default SkeletonChart;
