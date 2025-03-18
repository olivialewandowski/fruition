// components/forstudents/Header.tsx
import React, { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';

const Header: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleWaitlistClick = () => {
    setShowWaitlist(true);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 py-3 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(38, 0, 72, 0.85)' }}
      >
        <div className="flex flex-wrap gap-5 justify-between items-center w-full text-center max-w-[1196px] max-md:max-w-full max-sm:gap-2.5 max-sm:px-2.5 max-sm:py-0">
          <div 
            className="flex gap-2 text-5xl tracking-tighter whitespace-nowrap max-md:text-4xl max-sm:gap-2 max-sm:text-3xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4bd5e806446735fa68cb2fa7eca801e28d3bcd740d2c1d07ea4f00314a61d0ad?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
              className="object-contain shrink-0 aspect-[0.76] w-[36px] max-sm:w-8"
              alt="Fruition Logo"
            />
            <div 
              className="self-center font-montserrat-alternates italic font-bold tracking-tighter basis-auto text-white max-md:text-4xl max-sm:text-3xl"
              style={{ 
                textShadow: isHovered ? "0 0 8px rgba(255,255,255,0.7)" : "none" 
              }}
            >
              fruition
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleWaitlistClick}
            className="flex items-center justify-center px-7 h-11 text-lg font-bold tracking-tighter bg-white text-black rounded-[40px] font-montserrat max-md:px-4 max-sm:text-base max-sm:px-3 max-sm:h-9 relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              boxShadow: isHovered 
                ? "0 0 25px 5px rgba(147, 51, 234, 0.7)" 
                : "0 0 10px 0px rgba(147, 51, 234, 0.2)",
              transition: "all 0.3s ease"
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-300 to-pink-200 opacity-0"
              style={{ 
                opacity: isHovered ? 0.3 : 0,
                transition: "opacity 0.3s ease" 
              }}
            />
            <span className="relative z-10">
              Join the Waitlist
            </span>
          </button>
        </div>
      </header>

      <WaitlistDialog 
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        source="waitlist"
      />
    </>
  );
};

export default Header;