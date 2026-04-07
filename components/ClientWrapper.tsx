'use client';

import { ReactNode, useEffect, useState } from 'react';

export function ClientWrapper({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client is ready
  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
