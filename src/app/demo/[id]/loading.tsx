export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#E9EBFF] dark:bg-[#0E1130] font-sans">
      
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex w-[260px] m-4 mr-0 bg-white dark:bg-[#1A1F52] rounded-[28px] p-6 flex-col shrink-0 space-y-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 skeleton-box rounded-xl" />
          <div className="w-24 h-6 skeleton-box rounded-md" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-full h-10 skeleton-box rounded-xl" />
        ))}
      </aside>

      {/* Main Skeleton */}
      <main className="flex-1 flex flex-col min-w-0 m-4 overflow-y-auto">
        {/* Header Skeleton */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <div className="w-48 h-8 skeleton-box rounded-lg mb-2" />
            <div className="w-64 h-4 skeleton-box rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-10 skeleton-box rounded-xl" />
            <div className="w-32 h-10 skeleton-box rounded-xl" />
          </div>
        </header>

        {/* KPI Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white dark:bg-[#1A1F52] rounded-[24px] p-5 border border-transparent dark:border-[#2A3070]">
              <div className="w-24 h-4 skeleton-box rounded-md mb-4" />
              <div className="w-32 h-8 skeleton-box rounded-lg mb-2" />
              <div className="w-20 h-3 skeleton-box rounded-md" />
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 h-[300px] bg-white dark:bg-[#1A1F52] rounded-[28px] p-6 border border-transparent dark:border-[#2A3070]">
            <div className="w-48 h-6 skeleton-box rounded-md mb-6" />
            <div className="w-full h-40 skeleton-box rounded-lg" />
          </div>
          <div className="flex-1 h-[300px] bg-white dark:bg-[#1A1F52] rounded-[28px] p-6 border border-transparent dark:border-[#2A3070]">
            <div className="w-48 h-6 skeleton-box rounded-md mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-full h-8 skeleton-box rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}