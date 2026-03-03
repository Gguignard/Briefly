import { Skeleton } from '@/components/ui/skeleton'

function NewsletterCardSkeleton() {
  return (
    <div className="flex items-center justify-between border rounded-lg px-4 py-3">
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-5 w-9 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}

export default function NewslettersLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* InboxAddressCard skeleton */}
      <Skeleton className="h-20 w-full rounded-lg" />

      {/* Limit banner + Add button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* Newsletter cards skeleton */}
      <div className="space-y-2">
        <NewsletterCardSkeleton />
        <NewsletterCardSkeleton />
        <NewsletterCardSkeleton />
      </div>
    </div>
  )
}
