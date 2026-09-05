export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <a-skeleton className="h-8 w-32 mb-4" />
          <div className="flex items-center gap-4">
            <a-skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2">
              <a-skeleton className="h-6 w-48" />
              <a-skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <a-skeleton className="h-10 w-96 mb-6" />
        <div className="grid gap-6 md:grid-cols-3">
          <a-skeleton className="h-32" />
          <a-skeleton className="h-32" />
          <a-skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
