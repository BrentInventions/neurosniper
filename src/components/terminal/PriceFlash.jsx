import React, { useEffect, useRef, useState } from 'react';

/**
 * Wraps a value and flashes green/red when it changes.
 */
export default function PriceFlash({ value, children, className = '' }) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (prevRef.current === undefined || prevRef.current === value) {
      prevRef.current = value;
      return;
    }
    const direction = value > prevRef.current ? 'green' : 'red';
    setFlash(direction);
    prevRef.current = value;
    const t = setTimeout(() => setFlash(null), 800);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span
      className={`inline-block px-1 rounded transition-colors ${
        flash === 'green' ? 'flash-green' : flash === 'red' ? 'flash-red' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
}