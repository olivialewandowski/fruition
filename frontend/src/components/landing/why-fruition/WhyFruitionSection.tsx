import React from 'react';
import WhyFruitionCard from './WhyFruitionCard';

const WhyFruitionSection: React.FC = () => {
  const reasons = [
    {
      title: "For Students",
      description: "Finding research shouldn't be impossible. Fruition centralizes active research opportunities and ensures your applications reach mentors 100% of the time —no more endless searching or ignored emails."
    },
    {
      title: "For Faculty",
      description: "No more inbox overload. Fruition connects you with qualified, interested students only when you're actively recruiting on a project, saving time on reviewing irrelevant inquiries."
    },
    {
      title: "For Admin",
      description: "Research opportunities are scattered. Fruition centralizes positions, breaking department silos and automating student-faculty matching to increase research engagement and eliminate tedious manual matching."
    }
  ];

  return (
    <>
      <div className="mt-24 text-center font-montserrat max-md:mt-10 max-md:max-w-full">
        <span className="text-7xl font-semibold text-white max-md:text-4xl">Why </span>
        <span className="text-7xl font-montserrat-alternates italic tracking-tighter font-semibold text-white max-md:text-4xl">fruition</span>
        <span className="text-7xl font-semibold text-white max-md:text-4xl"> ?</span>
      </div>
      <div className="mt-24 w-full max-w-[1133px] mx-auto max-md:mt-10 max-md:max-w-full px-4">
        <div className="flex gap-5 max-md:flex-col">
          {reasons.map((reason, index) => (
            <WhyFruitionCard key={index} {...reason} />
          ))}
        </div>
      </div>
    </>
  );
};

export default WhyFruitionSection;