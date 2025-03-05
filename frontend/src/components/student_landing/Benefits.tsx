import React from "react";
import { BenefitCard } from "./BenefitCard";

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: "/images/magnifier-icon.png",
      altText: "Magnifier icon",
      title: "Dynamic Project Discovery",
    },
    {
      icon: "/images/brain-icon.png",
      altText: "Brain icon",
      title: "Smart Project Recommendations",
    },
    {
      icon: "/images/tracking-icon.png",
      altText: "Tracking icon",
      title: "Seamless Application Process",
    },
  ];

  return (
    <section className="px-10 py-16 mx-8 my-12 rounded-3xl bg-neutral-200 max-w-[1012px]">
      <div className="mb-8 text-3xl font-bold text-left max-sm:text-2xl px-6">
        <div
          style={{
            background: 'linear-gradient(0deg, #9821FF 0%, #591EA6 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            display: 'inline-block'
          }}
        >
          Searching for research opportunities {"shouldn't"} be impossible. Our custom
          features help students find active positions relevant to them.
        </div>
      </div>
      <div className="flex justify-between mx-auto my-6 max-w-[798px] max-md:flex-col max-md:gap-14 max-md:items-center max-md:mt-12 px-8">
        {benefits.map((benefit, index) => (
          <BenefitCard
            key={index}
            icon={benefit.icon}
            altText={benefit.altText}
            title={benefit.title}
          />
        ))}
      </div>
    </section>
  );
};