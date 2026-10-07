'use client';

import { useEffect, useState } from 'react';
import { incrementVisitorCount, getStoredCount } from './visitor-counter';

export function useVisitorCount() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    setCount(getStoredCount());
    incrementVisitorCount().then(setCount);
  }, []);

  return count;
}
