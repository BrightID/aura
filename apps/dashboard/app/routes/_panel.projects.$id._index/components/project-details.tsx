export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 lg:px-6">
      <div className="flex flex-col gap-4">
        <a-skeleton className="h-4 w-20" />
        <div className="flex items-center gap-3">
          <a-skeleton className="size-12 rounded-lg" />
          <div className="space-y-2">
            <a-skeleton className="h-6 w-48" />
            <a-skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <a-skeleton className="h-10 w-full max-w-md" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
        <a-skeleton className="h-24" />
        <a-skeleton className="h-24" />
        <a-skeleton className="h-24" />
        <a-skeleton className="h-24" />
      </div>
    </div>
  );
}
