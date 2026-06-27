'use client';

export default function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-[80px] md:bottom-6 left-1/2 -translate-x-1/2 z-[100] toast-enter">
      <div className="flex items-center gap-2.5 bg-[#0f172a] text-white px-5 py-3 rounded-[14px] text-[13px] font-semibold shadow-[0_16px_40px_rgba(0,0,0,.35)] backdrop-blur-sm max-w-[340px]">
        <span className="w-[18px] h-[18px] rounded-full bg-[#16a34a] flex items-center justify-center text-[10px] shrink-0">&#10003;</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
