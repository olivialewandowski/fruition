// Header.tsx
import React, { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';

const Header: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);

  const handleWaitlistClick = () => {
    setShowWaitlist(true);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 py-4 bg-purple-950/65 backdrop-blur-md supports-[backdrop-filter]:bg-purple-950/65">
        <div className="flex flex-wrap gap-5 justify-between items-center w-full text-center max-w-[1196px] max-md:max-w-full max-sm:gap-2.5 max-sm:px-2.5 max-sm:py-0">
          <div className="flex gap-3 text-6xl tracking-tighter text-black whitespace-nowrap max-md:text-4xl max-sm:gap-2 max-sm:text-3xl">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4bd5e806446735fa68cb2fa7eca801e28d3bcd740d2c1d07ea4f00314a61d0ad?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
              className="object-contain shrink-0 aspect-[0.76] w-[41px] max-sm:w-8"
              alt=""
            />
            <div className="self-center font-montserrat-alternates italic font-bold tracking-tighter basis-auto text-white max-md:text-4xl max-sm:text-3xl">
              fruition
            </div>
          </div>
          <button 
            type="button"
            onClick={handleWaitlistClick}
            className="flex items-center justify-center px-8 h-12 text-3xl font-bold tracking-tighter bg-white text-black rounded-[40px] hover:bg-gray-50 transition-colors duration-200 font-montserrat max-md:px-5 max-sm:text-2xl max-sm:px-4 max-sm:h-10"
          >
            Join the Waitlist
          </button>
        </div>
      </div>

      {showWaitlist && (
        <WaitlistDialog 
          isOpen={showWaitlist}
          onClose={() => setShowWaitlist(false)}
          source="waitlist"
        />
      )}
    </>
  );
};

export default Header;