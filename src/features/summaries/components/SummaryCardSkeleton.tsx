import { Skeleton } from '@/components/ui/skeleton'

export function SummaryCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 space-y-3" aria-busy="true" aria-label="Loading summary">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-4 w-40" />
    </div>
  )
}
