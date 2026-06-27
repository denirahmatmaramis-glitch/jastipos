'use client';

import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

export default function Modal({ title, subtitle, onClose, children, maxWidth = 460 }: Props) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center animate-fadein"
      style={{ background: 'rgba(15,12,46,.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-[20px] md:rounded-2xl shadow-[0_-10px_40px_rgba(15,12,46,.25)] md:shadow-[0_30px_60px_rgba(15,12,46,.4)] max-h-[85vh] md:max-h-[90vh] overflow-y-auto jp-scroll animate-slideup"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-2.5 pb-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#d1d5db]" />
        </div>
        <div className="flex items-start justify-between gap-3 p-4 md:p-5 pb-3 border-b border-[#f1f5f9] sticky top-0 bg-white md:rounded-t-2xl">
          <div>
            <h3 className="m-0 text-[16px] font-extrabold tracking-tight">{title}</h3>
            {subtitle && <p className="m-0 mt-0.5 text-[#64748b] text-[12.5px]">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-[#94a3b8] hover:text-[#0f172a] cursor-pointer p-1 transition-colors shrink-0" title="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="p-4 md:p-5 pb-6 md:pb-5">{children}</div>
      </div>
    </div>
  );
}
