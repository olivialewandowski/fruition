'use client';

import React, { useState } from 'react';
import Header from './Header';
import HeroSection from './hero/HeroSection';
import FeatureSection from './features/FeatureSection';
import BenefitsSection from './benefits/BenefitsSection';
import WhyFruitionSection from './why-fruition/WhyFruitionSection';
import CallToActionSection from './CallToActionSection';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  const [universityEmail, setUniversityEmail] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const updateUniversityEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUniversityEmail(event.target.value);
  };

  const updateNewsletterEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletterEmail(event.target.value);
  };

  return (
    <div 
      className="flex overflow-hidden flex-col items-center pt-24 pb-9 pr-4 font-montserrat text-white max-sm:py-5 max-sm:pr-2.5"
      style={{
        background: 'radial-gradient(circle at center, #5D00AE 0%, #260048 100%)'
      }}
    >
      <Header />
      <HeroSection universityEmail={universityEmail} updateUniversityEmail={updateUniversityEmail} />
      <FeatureSection />
      <BenefitsSection />
      <WhyFruitionSection />
      <CallToActionSection newsletterEmail={newsletterEmail} updateNewsletterEmail={updateNewsletterEmail} />
      <Footer />
    </div>
  );
};

export default LandingPage;