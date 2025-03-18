// app/forstudents/layout.tsx
'use client';

import React from 'react';

// Force client-side rendering to prevent chunk loading issues
export default function ForStudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Montserrat+Alternates:ital,wght@0,400;0,600;0,700;1,600;1,700&display=swap');
        
        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }
        
        .font-montserrat-alternates {
          font-family: 'Montserrat Alternates', sans-serif;
        }
      `}</style>
      {children}
    </div>
  );
}