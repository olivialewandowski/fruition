// HeroSection.tsx
import React from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';

interface HeroSectionProps {
  universityEmail: string;
  updateUniversityEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ universityEmail, updateUniversityEmail }) => {
  const [showWaitlist, setShowWaitlist] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');

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

  const isValidEmail = validateEmail(universityEmail);

  return (
    <>
      <div className="flex flex-col items-center pt-32 w-full text-center max-w-[968px] max-md:pt-24 max-md:max-w-full">
        <div className="text-7xl font-semibold text-white font-montserrat italic max-md:max-w-full max-md:text-4xl">
          Where Ideas Come to Fruition
        </div>
        <div className="self-stretch mt-20 text-2xl text-white font-montserrat max-md:mt-10 max-md:max-w-full">
          Fruition is a centralized platform designed to bridge the gap
          between students, faculty, and administrators in the world of
          research.
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2.5 px-7 py-2.5 mt-20 max-w-full bg-white rounded-2xl w-[690px] max-md:px-5 max-md:mt-10">
          <div className="relative flex-1 min-w-0 flex-grow">
            <input
              type="email"
              placeholder="Enter your university email"
              className="w-full px-4 py-3 text-2xl text-black rounded-lg shadow-[inset_0px_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-purple-500 font-montserrat placeholder-gray-400"
              value={universityEmail}
              onChange={(e) => {
                updateUniversityEmail(e);
                setEmailError('');
              }}
              required
            />
            <button
              type="submit"
              disabled={!universityEmail || !isValidEmail}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 text-xl font-semibold text-white bg-purple-950 hover:bg-purple-900 hover:shadow-lg transition-all rounded-lg font-montserrat disabled:opacity-50 disabled:cursor-not-allowed max-md:px-4 max-md:py-1.5 max-md:text-lg"
            >
              Get Started
            </button>
          </div>
        </form>
        {emailError && (
          <div className="mt-2 text-red-400 text-sm font-semibold">{emailError}</div>
        )}
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