import React from "react";
import Image from "next/image";

interface BenefitCardProps {
  icon: string;
  altText: string;
  title: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  altText,
  title,
}) => {
  return (
    <article className="text-center max-md:w-3/4 max-md:scale-110">
      <div 
        className="flex justify-center items-center mx-auto mt-0 mb-8 rounded-xl h-[117px] w-[117px] max-sm:h-[110px] max-sm:w-[110px]"
        style={{
          background: 'linear-gradient(180deg, #E5D1FF 0%, #C494FF 100%)'
        }}
      >
        <div className="flex items-center justify-center w-[85%] h-[85%]">
          <Image
            src={icon}
            alt={altText}
            width={77}
            height={77}
            className="max-sm:h-[70px] max-sm:w-[70px]"
          />
        </div>
      </div>
      <h3 className="text-lg font-bold mx-auto text-purple-950 max-sm:mt-2 max-sm:text-xl">
        {title}
      </h3>
    </article>
  );
};