// components/forstudents/HeroSection.tsx
import React, { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';

const HeroSection: React.FC = () => {
  const [universityEmail, setUniversityEmail] = useState('');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isInputHovered, setIsInputHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('.edu');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(universityEmail)) {
      setEmailError('Please enter a valid university email (.edu)');
      return;
    }
    setEmailError('');
    setShowWaitlist(true);
  };

  const isValidEmail = universityEmail ? validateEmail(universityEmail) : true;

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="flex flex-col items-center pt-32 mt-32 w-full text-center max-w-[968px] mx-auto px-8 relative z-10">
          <h1 className="text-6xl md:text-7xl font-semibold text-white font-montserrat-alternates italic max-md:max-w-full max-md:text-5xl max-sm:text-4xl leading-tight">
            Your Research Journey<br />Starts Here
          </h1>
          
          <p className="mt-14 text-xl md:text-2xl text-white font-montserrat max-md:mt-12 max-md:max-w-full">
            Fruition is an AI-powered platform that streamlines the connection between students and faculty on university research projects.
          </p>
          
          <div className="mt-10 w-full max-w-[690px] mx-auto">
            {/* Desktop form (hidden on small screens) */}
            <form onSubmit={handleSubmit} className="relative hidden sm:block">
              <div 
                className="rounded-lg overflow-hidden"
                style={{
                  boxShadow: isInputHovered || isButtonHovered 
                    ? "0 0 35px rgba(168, 85, 247, 0.6)" 
                    : "0 0 25px rgba(168, 85, 247, 0.4)"
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your university email"
                  className={`w-full px-6 py-5 text-xl text-black border-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-montserrat placeholder-gray-400 pr-36 ${!isValidEmail ? 'border-red-500' : ''}`}
                  value={universityEmail}
                  onChange={(e) => {
                    setUniversityEmail(e.target.value);
                    setEmailError('');
                  }}
                  required
                  onMouseEnter={() => setIsInputHovered(true)}
                  onMouseLeave={() => setIsInputHovered(false)}
                />
                <button
                  type="submit"
                  disabled={!universityEmail || !isValidEmail}
                  className="absolute right-0 top-0 bottom-0 px-8 h-full text-xl font-semibold text-white bg-purple-950 hover:bg-purple-900 transition-all font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                >
                  Get Started
                </button>
              </div>
            </form>
            
            {/* Mobile form (visible only on small screens) */}
            <form onSubmit={handleSubmit} className="sm:hidden">
              <div 
                className="rounded-lg overflow-hidden"
                style={{
                  boxShadow: isInputHovered || isButtonHovered 
                    ? "0 0 35px rgba(168, 85, 247, 0.6)" 
                    : "0 0 25px rgba(168, 85, 247, 0.4)"
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your university email"
                  className={`w-full px-4 py-4 text-base text-black border-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-montserrat placeholder-gray-400 ${!isValidEmail ? 'border-red-500' : ''}`}
                  value={universityEmail}
                  onChange={(e) => {
                    setUniversityEmail(e.target.value);
                    setEmailError('');
                  }}
                  required
                  onMouseEnter={() => setIsInputHovered(true)}
                  onMouseLeave={() => setIsInputHovered(false)}
                />
              </div>
              <button
                type="submit"
                disabled={!universityEmail || !isValidEmail}
                className="w-full mt-3 px-8 py-4 text-base font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all font-montserrat disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
              >
                Get Started
              </button>
            </form>
          </div>
          
          {emailError && (
            <div className="mt-2 text-red-400 text-sm font-semibold">
              {emailError}
            </div>
          )}
        </div>
      </div>

      <WaitlistDialog 
        isOpen={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        source="getStarted"
        prefilledEmail={universityEmail}
      />
    </>
  );
};

export default HeroSection;