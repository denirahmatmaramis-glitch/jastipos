'use client';

import { useState, useEffect } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  className?: string;
  placeholder?: string;
}

function formatNum(n: number): string {
  if (!n) return '';
  return n.toLocaleString('id-ID');
}

function parseNum(s: string): number {
  return parseInt(s.replace(/\D/g, ''), 10) || 0;
}

export default function NumInput({ value, onChange, className, placeholder }: Props) {
  const [display, setDisplay] = useState(() => formatNum(value));

  useEffect(() => {
    setDisplay(formatNum(value));
  }, [value]);

  const handleChange = (raw: string) => {
    const num = parseNum(raw);
    setDisplay(formatNum(num));
    onChange(num);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={e => handleChange(e.target.value)}
      onFocus={e => e.target.select()}
      className={className}
      placeholder={placeholder}
    />
  );
}
