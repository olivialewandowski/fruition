// BenefitCard.tsx
import React from 'react';

interface BenefitCardProps {
  title: string;
  description: string;
  iconSrc: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, iconSrc }) => {
  return (
    <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full transform scale-100 max-md:scale-90 max-sm:scale-75">
      <div className="flex flex-col text-center text-black relative h-full font-montserrat">
        <div className="text-4xl font-semibold text-white max-md:max-w-full max-md:mb-6">
          {title}
        </div>
        <div className="flex justify-center items-center self-center mt-11 bg-white rounded-full aspect-square w-[203px] max-md:mt-8">
          <img
            loading="lazy"
            src={iconSrc}
            className="object-contain w-[119px] h-[119px]"
            alt={title}
          />
        </div>
        <div className="mt-11 text-2xl text-white max-md:mt-8 px-4">
          {description}
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;