import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Skeleton className="w-10 h-10" rounded="full" />
      </div>

      {/* Status card skeleton */}
      <Card>
        <Skeleton className="h-5 w-24 mb-4" rounded="sm" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10" rounded="full" />
          <div>
            <Skeleton className="h-5 w-40" rounded="sm" />
            <Skeleton className="h-4 w-28 mt-1" rounded="sm" />
          </div>
        </div>
      </Card>

      {/* Connections skeleton */}
      <div>
        <Skeleton className="h-6 w-44 mb-3" rounded="sm" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="sm">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12" rounded="full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-20" rounded="sm" />
                  <Skeleton className="h-4 w-16 mt-1" rounded="sm" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
