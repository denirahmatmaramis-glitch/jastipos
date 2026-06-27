'use client';

export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#eef0f6] rounded-[14px] p-4">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-6 w-32 mb-2" />
      <div className="skeleton h-2.5 w-20" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-[#eef0f6] rounded-[14px] p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="skeleton h-3.5 w-28 mb-2" />
              <div className="skeleton h-3 w-36 mb-1.5" />
              <div className="skeleton h-2.5 w-24" />
            </div>
            <div className="skeleton h-5 w-20 rounded-md" />
          </div>
          <div className="flex gap-1.5 mt-3">
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <>
      <div className="skeleton h-[120px] rounded-2xl mb-3" />
      <div className="flex gap-2 mb-3 overflow-hidden">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-[52px] w-[90px] rounded-[12px] shrink-0" />)}
      </div>
      <div className="bg-white border border-[#eef0f6] rounded-2xl p-4">
        <div className="skeleton h-4 w-28 mb-4" />
        <SkeletonList count={3} />
      </div>
    </>
  );
}
