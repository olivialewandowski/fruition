'use client';

import React, { useState, useEffect } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ClientOnly component
 * 
 * A utility component that ensures its children are only rendered on the client-side.
 * This helps prevent hydration errors when components use browser-specific APIs.
 * 
 * @param {React.ReactNode} children - Components to render only on the client-side
 * @param {React.ReactNode} fallback - Optional fallback UI to show during SSR (defaults to null)
 */
const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  
  // Set hasMounted to true on the client-side after initial render
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Only render the children when on the client-side
  if (!hasMounted) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export default ClientOnly; 