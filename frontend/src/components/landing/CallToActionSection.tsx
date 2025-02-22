// CallToActionSection.tsx
import React from 'react';
import { WaitlistDialog } from '@/components/ui/WaitlistDialog';

interface CallToActionSectionProps {
  newsletterEmail: string;
  updateNewsletterEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  newsletterEmail,
  updateNewsletterEmail
}) => {
  const [showDemoDialog, setShowDemoDialog] = React.useState(false);
  const [showNewsletterDialog, setShowNewsletterDialog] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('.edu');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(newsletterEmail)) {
      setEmailError('Please enter a valid university email (.edu)');
      return;
    }
    setEmailError('');
    setShowNewsletterDialog(true);
  };

  const isValidEmail = validateEmail(newsletterEmail);

  return (
    <>
      <div className="mt-32 text-5xl font-semibold text-center text-white font-montserrat max-md:mt-10 max-md:max-w-full max-md:text-4xl">
        Join the Future of Research Today.
      </div>
      <div className="flex flex-wrap gap-3.5 items-center px-7 py-5 mt-28 w-full bg-white max-w-[1096px] rounded-[30px] max-md:px-5 max-md:mt-10 max-md:max-w-full transform scale-100 max-md:scale-90 max-sm:scale-75">
        <div className="flex flex-col grow shrink items-start self-stretch pr-20 my-auto rounded-3xl min-w-[240px] w-[489px] max-md:max-w-full max-md:pr-0">
          <div className="text-5xl font-bold text-black font-montserrat max-md:text-4xl">
            See <span className="font-montserrat-alternates italic tracking-tighter">fruition</span> in
            action
          </div>
          <button
            onClick={() => setShowDemoDialog(true)}
            className="px-6 py-5 mt-28 ml-4 text-3xl font-semibold rounded-3xl cursor-pointer bg-purple-950 hover:bg-purple-900 hover:shadow-lg transition-colors text-white max-md:pl-5 max-md:mt-10 max-md:ml-2.5 font-montserrat"
            type="button"
          >
            Request a Demo
          </button>
        </div>
        
        <div className="shrink self-stretch mx-0 my-auto w-px bg-transparent border border-solid border-stone-300 grow-0 h-[362px] max-md:hidden" />
        <div className="hidden max-md:block w-full h-px bg-stone-300 my-8" />
        
        <div className="flex flex-col grow shrink self-stretch pl-5 my-auto rounded-2xl min-w-[240px] w-[507px] max-md:max-w-full max-md:pl-0">
          <div className="self-start -mt-5 -ml-px text-5xl font-bold text-black font-montserrat max-md:ml-2.5 max-md:text-4xl max-md:mt-0">
            Join our newsletter waitlist
          </div>
          <form onSubmit={handleNewsletterSubmit} className="relative mt-12 max-md:mt-10">
            <input
              className="w-full px-4 py-3 text-base rounded-lg shadow-[inset_0px_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-purple-500 font-montserrat text-black placeholder-gray-400"
              type="email"
              placeholder="Enter your university email"
              value={newsletterEmail}
              onChange={(e) => {
                updateNewsletterEmail(e);
                setEmailError('');
              }}
              required
            />
            <button
              type="submit"
              disabled={!newsletterEmail || !isValidEmail}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 text-xl font-semibold text-white bg-purple-950 hover:bg-purple-900 hover:shadow-lg transition-all rounded-lg font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go
            </button>
          </form>
          {emailError && (
            <div className="mt-2 text-red-600 text-sm font-semibold">{emailError}</div>
          )}
        </div>
      </div>

      <WaitlistDialog 
        isOpen={showDemoDialog}
        onClose={() => setShowDemoDialog(false)}
        source="demo"
      />

      <WaitlistDialog 
        isOpen={showNewsletterDialog}
        onClose={() => setShowNewsletterDialog(false)}
        source="waitlist"
        prefilledEmail={newsletterEmail}
      />
    </>
  );
};

export default CallToActionSection;