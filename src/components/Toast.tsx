'use client';

export default function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white px-5 py-3 rounded-xl text-[13px] font-semibold z-[100] shadow-[0_12px_30px_rgba(0,0,0,.3)] animate-slideup">
      {message}
    </div>
  );
}
