import React from 'react';
import BenefitCard from './BenefitCard';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      title: "Smart Project Recommendations",
      description: "Receive personalized recommendations for active projects that align with your interests and experience.",
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/6f36119a8e6ddbc040b09973e24d1719f89b3c36b19ba1846ad382ac32034ea0?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
    },
    {
      title: "Seamless Application Tracking",
      description: "Track and manage applications with an intuitive drag-and-drop system, making it easy to review, shortlist, and onboard students.",
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/d11dcbb2df68b9d3610bd3c1b18509bc4fed14d38b1936c5c9ca594bfc796465?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
    },
    {
      title: "University-Wide Insights",
      description: "Access real-time analytics on research participation to monitor engagement and improve decision-making.",
      iconSrc: "https://cdn.builder.io/api/v1/image/assets/TEMP/1ae57ff40bb759659f7830b30b46d6bbab998eaa1aa9b390ea5873e7585e9a19?placeholderIfAbsent=true&apiKey=52d31c01194349e6a8f1e6e4f44a4e8b"
    }
  ];

  return (
    <div className="self-stretch mt-32 max-md:mt-10 max-md:max-w-full">
      <div className="flex gap-5 items-stretch justify-center max-md:flex-col">
        {benefits.map((benefit, index) => (
          <BenefitCard key={index} {...benefit} />
        ))}
      </div>
    </div>
  );
};

export default BenefitsSection;